const express = require('express');
const ethers = require('ethers');
const { createNode, pipe, uint8ArrayFromString, uint8ArrayToString } = require('./helper');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// In-memory storage for the client's data
let clientData = null;
let numberOfTokensUsed = 0;
let contractType = null;

// Solidity contract ABIs and addresses
const hashchainContractABI = [
  "event ChannelCreated(address indexed payer, address indexed merchant, uint256 amount, uint256 numberOfTokens, uint256 withdrawAfterBlocks)",
  "function createChannel(address merchant, bytes32 trustAnchor, uint256 amount, uint256 numberOfTokens, uint256 withdrawAfterBlocks) public payable",
  "function redeemChannel(address payer, bytes32 finalHashValue, uint256 numberOfTokensUsed) public"
];
const hashchainContractAddress = '0xYourHashchainContractAddress'; // Replace with your hashchain contract address

const merkleTreeContractABI = [
  "event ChannelCreated(address indexed payer, uint256 amount, uint256 numberOfTokens, uint256 withdrawAfterBlocks)",
  "event TokenAdded(address indexed payer, address indexed merchant, bytes32 token)",
  "event MerchantPaid(address indexed payer, address indexed merchant, uint256 amount)",
  "function createChannel(bytes32 trustAnchor, uint256 amount, uint256 numberOfTokens, uint256 withdrawAfterBlocks) public payable",
  "function validateToken(address payer, bytes32[] calldata merkleProof, bytes32 token) public",
  "function payMerchant(address payer) public"
];
const merkleTreeContractAddress = '0xYourMerkleTreeContractAddress'; // Replace with your merkle tree contract address

// Ethereum provider and contract instances
const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/4ddbeaf177884a69bdf6073b94008c27');
const signer = provider.getSigner();
const hashchainContract = new ethers.Contract(hashchainContractAddress, hashchainContractABI, signer);
const merkleTreeContract = new ethers.Contract(merkleTreeContractAddress, merkleTreeContractABI, signer);

// Create libp2p node for the server
const serverNode = await createNode();

// Start the server node
await serverNode.start();
console.log('Server node is started and listening on:', serverNode.getMultiaddrs().map((addr) => addr.toString()));

// Handle incoming connections and messages
serverNode.handle('/a-protocol', ({ stream }) => {
  pipe(
    stream,
    async function (source) {
      for await (const msg of source) {
        const message = uint8ArrayToString(msg.subarray());
        console.log('Received:', message);

        // Parse the message
        const data = JSON.parse(message);

        if (data.type === 'connect') {
          handleConnect(data, stream);
        } else if (data.type === 'validateToken') {
          handleValidateToken(data, stream);
        } else if (data.type === 'payMerchant') {
          handlePayMerchant(data, stream);
        } else if (data.type === 'redeemChannel') {
          handleRedeemChannel(data, stream);
        }
      }
    }
  );
});

// Function to send a response back to the client
const sendResponse = (stream, message, status) => {
  const response = JSON.stringify({ message, status });
  pipe(
    [uint8ArrayFromString(response)],
    stream
  );
};

// Endpoint to handle client connection request
const handleConnect = (data, stream) => {
  const { trustAnchor, amount, numberOfTokens, withdrawAfterBlocks, contractType } = data;

  if (!trustAnchor || !amount || !numberOfTokens || !withdrawAfterBlocks || !contractType) {
    return sendResponse(stream, 'Missing required parameters', 400);
  }

  clientData = {
    trustAnchor,
    amount,
    numberOfTokens,
    withdrawAfterBlocks
  };
  this.contractType = contractType;

  sendResponse(stream, 'Connection established', 200);

  if (contractType === 'hashchain') {
    hashchainContract.on('ChannelCreated', (payer, merchant, amount, numberOfTokens, withdrawAfterBlocks, event) => {
      if (!verifyEventData({ payer, merchant, amount, numberOfTokens, withdrawAfterBlocks })) {
        console.log('Event data does not match client data. Connection refused.');
        return;
      }
      console.log('Channel created and verified successfully');
    });
  } else if (contractType === 'merkleTree') {
    merkleTreeContract.on('ChannelCreated', (payer, amount, numberOfTokens, withdrawAfterBlocks, event) => {
      if (!verifyEventData({ payer, amount, numberOfTokens, withdrawAfterBlocks })) {
        console.log('Event data does not match client data. Connection refused.');
        return;
      }
      console.log('Channel created and verified successfully');
    });
  }
};

// Function to verify the event data with client data
const verifyEventData = (event) => {
  const { payer, merchant, amount, numberOfTokens, withdrawAfterBlocks } = event;

  if (payer !== clientData.trustAnchor ||
      amount !== clientData.amount ||
      numberOfTokens !== clientData.numberOfTokens ||
      withdrawAfterBlocks !== clientData.withdrawAfterBlocks) {
    return false;
  }

  return true;
};

// Endpoint to handle token validation
const handleValidateToken = async (data, stream) => {
  if (!clientData || !this.contractType) {
    return sendResponse(stream, 'No active connection', 400);
  }

  if (this.contractType === 'hashchain') {
    const { preImage } = data;

    if (!preImage) {
      return sendResponse(stream, 'Missing preImage', 400);
    }

    const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(preImage));

    if (hash === clientData.trustAnchor) {
      numberOfTokensUsed++;
      clientData.trustAnchor = preImage;
      clientData.numberOfTokens--;

      if (clientData.numberOfTokens === 0) {
        return sendResponse(stream, 'No tokens left', 400);
      }

      sendResponse(stream, 'PreImage verified', 200);
    } else {
      sendResponse(stream, 'PreImage does not match trustAnchor', 400);
    }
  } else if (this.contractType === 'merkleTree') {
    const { payer, merkleProof, token } = data;

    if (!payer || !merkleProof || !token) {
      return sendResponse(stream, 'Missing required parameters', 400);
    }

    try {
      await merkleTreeContract.validateToken(payer, merkleProof, token);
      numberOfTokensUsed++;
      clientData.numberOfTokens--;

      if (clientData.numberOfTokens === 0) {
        return sendResponse(stream, 'No tokens left', 400);
      }

      sendResponse(stream, 'Token validated successfully', 200);
    } catch (error) {
      console.error('Error validating token:', error);
      sendResponse(stream, 'Token validation failed', 400);
    }
  }
};

// Endpoint to handle merchant payment
const handlePayMerchant = async (data, stream) => {
  if (!clientData || !this.contractType) {
    return sendResponse(stream, 'No active connection', 400);
  }

  if (this.contractType === 'hashchain') {
    const { payer, finalHashValue, numberOfTokensUsed } = data;

    if (!payer || !finalHashValue || !numberOfTokensUsed) {
      return sendResponse(stream, 'Missing required parameters', 400);
    }

    try {
      await hashchainContract.redeemChannel(payer, finalHashValue, numberOfTokensUsed);
      console.log('Channel redeemed successfully');
      clientData = null; // Reset client data
      numberOfTokensUsed = 0; // Reset the number of tokens used
      sendResponse(stream, 'Channel redeemed successfully', 200);
    } catch (error) {
      console.error('Error redeeming channel:', error);
      sendResponse(stream, 'Failed to redeem channel', 500);
    }
  } else if (this.contractType === 'merkleTree') {
    const { payer } = data;

    if (!payer) {
      return sendResponse(stream, 'Missing required parameters', 400);
    }

    try {
      await merkleTreeContract.payMerchant(payer);
      console.log('Merchant paid successfully');
      clientData = null; // Reset client data
      numberOfTokensUsed = 0; // Reset the number of tokens used
      sendResponse(stream, 'Merchant paid successfully', 200);
    } catch (error) {
      console.error('Error paying merchant:', error);
      sendResponse(stream, 'Failed to pay merchant', 500);
    }
  }
};

// Start the server
app.listen(port, () => {
  console.log(`HTTP server is running on http://localhost:${port}`);
});
