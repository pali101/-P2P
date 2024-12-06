const express = require('express');
const ethers = require('ethers');
const { Provider, Contract } = ethers;

const app = express();
const port = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// In-memory storage for the client's data
let clientData = null;
let correctHash = 0;

// Solidity contract ABI and address
const contractABI = [
  "event ChannelCreated(address indexed sender, address indexed merchant, uint256 amount, uint256 numberOfTokens, uint256 withdrawAfterBlocks)"
];
const contractAddress = '0xYourContractAddress'; // Replace with your contract address

// Ethereum provider and contract instance
const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID'); // Replace with your Infura project ID
const contract = new ethers.Contract(contractAddress, contractABI, provider);

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
    correctHash++;
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

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
