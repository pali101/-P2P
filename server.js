const express = require('express');
const ethers = require('ethers');
const { Provider, Contract } = ethers;

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

// Endpoint to handle client connection request
app.post('/connect', (req, res) => {
  const { trustAnchor, amount, numberOfTokens, withdrawAfterBlocks } = req.body;

  if (!trustAnchor || !amount || !numberOfTokens || !withdrawAfterBlocks) {
    return res.status(400).send('Missing required parameters');
  }

  clientData = {
    trustAnchor,
    amount,
    numberOfTokens,
    withdrawAfterBlocks
  };

  res.status(200).send('Connection established');
});

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
app.post('/verifyPreImage', (req, res) => {
  if (!clientData) {
    return res.status(400).send('No active connection');
  }

  const { preImage } = req.body;

  if (!preImage) {
    return res.status(400).send('Missing preImage');
  }

  const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(preImage));

  if (hash === clientData.trustAnchor) {
    numberOfTokensUsed++;
    clientData.trustAnchor = preImage;
    clientData.numberOfTokens--;

    if (clientData.numberOfTokens === 0) {
      return res.status(400).send('No tokens left');
    }

    res.status(200).send('PreImage verified');
  } else {
    res.status(400).send('PreImage does not match trustAnchor');
  }
});

// Endpoint to handle channel redemption
app.post('/redeemChannel', async (req, res) => {
  if (!clientData) {
    return res.status(400).send('No active connection');
  }

  const { payer, finalHashValue } = req.body;

  if (!payer || !finalHashValue) {
    return res.status(400).send('Missing required parameters');
  }

  try {
    const tx = await contract.redeemChannel(payer, finalHashValue, numberOfTokensUsed);
    await tx.wait();

    console.log('Channel redeemed successfully');
    clientData = null; // Reset client data
    numberOfTokensUsed = 0; // Reset the number of tokens used
    res.status(200).send('Channel redeemed successfully');
  } catch (error) {
    console.error('Error redeeming channel:', error);
    res.status(500).send('Failed to redeem channel');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
