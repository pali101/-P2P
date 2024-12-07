const express = require('express');
const ethers = require('ethers');
const { Provider, Contract } = ethers;
const { createNode, pipe, uint8ArrayFromString, uint8ArrayToString } = require('./helper');

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// In-memory storage for the client's data
let clientData = null;
let numberOfTokensUsed = 0;

// Solidity contract ABI and address
const contractABI = [
  "event ChannelCreated(address indexed sender, address indexed merchant, uint256 amount, uint256 numberOfTokens, uint256 withdrawAfterBlocks)",
  "function redeemChannel(address payer, bytes32 finalHashValue, uint256 numberOfTokensUsed) public"
];
const contractAddress = '0xYourContractAddress'; // Replace with your contract address

// Ethereum provider and contract instance
const provider = new ethers.providers.JsonRpcProvider('https://sepolia.infura.io/v3/4ddbeaf177884a69bdf6073b94008c27');
const signer = provider.getSigner();
const contract = new ethers.Contract(contractAddress, contractABI, signer);

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
        } else if (data.type === 'verifyPreImage') {
          handleVerifyPreImage(data, stream);
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
  const { trustAnchor, amount, numberOfTokens, withdrawAfterBlocks } = data;

  if (!trustAnchor || !amount || !numberOfTokens || !withdrawAfterBlocks) {
    return sendResponse(stream, 'Missing required parameters', 400);
  }

  clientData = {
    trustAnchor,
    amount,
    numberOfTokens,
    withdrawAfterBlocks
  };

  sendResponse(stream, 'Connection established', 200);
};

// Function to verify the event data with client data
const verifyEventData = (event) => {
  const { sender, merchant, amount, numberOfTokens, withdrawAfterBlocks } = event;

  if (amount !== clientData.amount ||
      numberOfTokens !== clientData.numberOfTokens ||
      withdrawAfterBlocks !== clientData.withdrawAfterBlocks) {
    return false;
  }

  return true;
};

// Listen for the ChannelCreated event
contract.on('ChannelCreated', (sender, merchant, amount, numberOfTokens, withdrawAfterBlocks, event) => {
  if (!verifyEventData({ sender, merchant, amount, numberOfTokens, withdrawAfterBlocks })) {
    console.log('Event data does not match client data. Connection refused.');
    return;
  }

  console.log('Channel created and verified successfully');
});

// Endpoint to handle preImage verification
const handleVerifyPreImage = (data, stream) => {
  if (!clientData) {
    return sendResponse(stream, 'No active connection', 400);
  }

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
};

// Endpoint to handle channel redemption
const handleRedeemChannel = async (data, stream) => {
  if (!clientData) {
    return sendResponse(stream, 'No active connection', 400);
  }

  const { payer, finalHashValue } = data;

  if (!payer || !finalHashValue) {
    return sendResponse(stream, 'Missing required parameters', 400);
  }

  try {
    const tx = await contract.redeemChannel(payer, finalHashValue, numberOfTokensUsed);
    await tx.wait();

    console.log('Channel redeemed successfully');
    clientData = null; // Reset client data
    numberOfTokensUsed = 0; // Reset the number of tokens used
    sendResponse(stream, 'Channel redeemed successfully', 200);
  } catch (error) {
    console.error('Error redeeming channel:', error);
    sendResponse(stream, 'Failed to redeem channel', 500);
  }
};

// Start the server
app.listen(port, () => {
  console.log(`HTTP server is running on http://localhost:${port}`);
});
