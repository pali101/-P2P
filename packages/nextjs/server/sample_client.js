/* eslint-disable no-console */

if (typeof global.CustomEvent !== "function") {
    global.CustomEvent = class CustomEvent extends Event {
        constructor(event, params = {}) {
            super(event, params);
            this.detail = params.detail || null;
        }
    };
}

import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import { tcp } from '@libp2p/tcp';
import { pipe } from 'it-pipe';
import { createLibp2p } from 'libp2p';
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string';
import { multiaddr } from 'multiaddr';

const createNode = async () => {
    const node = await createLibp2p({
        addresses: {
            listen: ['/ip4/0.0.0.0/tcp/0'] // Listening on a random port
        },
        transports: [tcp()],
        streamMuxers: [yamux()],
        connectionEncrypters: [noise()]
    });

    return node;
};

const clientNode = await createNode();

await clientNode.start();
console.log('Client node is started and listening on:', clientNode.getMultiaddrs().map((addr) => addr.toString()));

const serverMultiaddr = multiaddr('/ip4/127.0.0.1/tcp/3000/p2p/12D3KooWFRcDr8aWfgnA6MygLPyu99511L9rTZvaWQ4buy6CxfG8');

const stream = await clientNode.dialProtocol(serverMultiaddr, '/a-protocol');

// Function to send a message to the server
const sendMessage = async (stream, message) => {
    const data = JSON.stringify(message);
    await pipe(
        [uint8ArrayFromString(data)],
        stream
    );
};

// Function to receive a response from the server
const receiveResponse = async (stream) => {
    return new Promise((resolve, reject) => {
        pipe(
            stream,
            async function (source) {
                for await (const msg of source) {
                    const response = JSON.parse(uint8ArrayToString(msg.subarray()));
                    resolve(response);
                }
            },
            (err) => {
                if (err) reject(err);
            }
        );
    });
};

// Function to handle the connection request
const handleConnect = async (stream, contractType) => {
    const connectData = {
        type: 'connect',
        trustAnchor: 'yourTrustAnchor', // Replace with actual trustAnchor
        amount: 100,
        numberOfTokens: 10,
        withdrawAfterBlocks: 100,
        contractType: contractType
    };
    await sendMessage(stream, connectData);
    const connectResponse = await receiveResponse(stream);
    console.log('Connect response:', connectResponse);
    return connectResponse;
};

// Function to handle preImage verification for hashchain
const handleVerifyPreImage = async (stream) => {
    const verifyPreImageData = {
        type: 'verifyPreImage',
        preImage: 'yourPreImage' // Replace with actual preImage
    };
    await sendMessage(stream, verifyPreImageData);
    const verifyPreImageResponse = await receiveResponse(stream);
    console.log('VerifyPreImage response:', verifyPreImageResponse);
    return verifyPreImageResponse;
};

// Function to handle token validation for merkle tree
const handleValidateToken = async (stream) => {
    const validateTokenData = {
        type: 'validateToken',
        payer: 'yourPayerAddress', // Replace with actual payer address
        merkleProof: ['yourMerkleProof'], // Replace with actual merkleProof
        token: 'yourToken' // Replace with actual token
    };
    await sendMessage(stream, validateTokenData);
    const validateTokenResponse = await receiveResponse(stream);
    console.log('ValidateToken response:', validateTokenResponse);
    return validateTokenResponse;
};

// Function to handle channel redemption for hashchain
const handleRedeemChannel = async (stream) => {
    const redeemChannelData = {
        type: 'redeemChannel',
        payer: 'yourPayerAddress', // Replace with actual payer address
        finalHashValue: 'yourFinalHashValue', // Replace with actual finalHashValue
        numberOfTokensUsed: 5 // Replace with actual number of tokens used
    };
    await sendMessage(stream, redeemChannelData);
    const redeemChannelResponse = await receiveResponse(stream);
    console.log('RedeemChannel response:', redeemChannelResponse);
    return redeemChannelResponse;
};

// Function to handle merchant payment for merkle tree
const handlePayMerchant = async (stream) => {
    const payMerchantData = {
        type: 'payMerchant',
        payer: 'yourPayerAddress' // Replace with actual payer address
    };
    await sendMessage(stream, payMerchantData);
    const payMerchantResponse = await receiveResponse(stream);
    console.log('PayMerchant response:', payMerchantResponse);
    return payMerchantResponse;
};

// Main function to run the client
const main = async () => {
    const contractType = 'hashchain'; // Change to 'merkleTree' to test the other contract
    const connectResponse = await handleConnect(stream, contractType);

    if (connectResponse.status === 200) {
        if (contractType === 'hashchain') {
            await handleVerifyPreImage(stream);
            await handleRedeemChannel(stream);
        } else if (contractType === 'merkleTree') {
            await handleValidateToken(stream);
            await handlePayMerchant(stream);
        }
    } else {
        console.log('Connection failed:', connectResponse.message);
    }

    await clientNode.stop();
    console.log('Client node stopped');
};

main().catch((error) => {
    console.error('Error in client:', error);
});
