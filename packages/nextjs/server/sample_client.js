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

// Send a connection request
const connectData = {
    type: 'connect',
    trustAnchor: 'yourTrustAnchor',
    amount: 100,
    numberOfTokens: 10,
    withdrawAfterBlocks: 100
};
await sendMessage(stream, connectData);
const connectResponse = await receiveResponse(stream);
console.log('Connect response:', connectResponse);

// Send a preImage verification request
const verifyPreImageData = {
    type: 'verifyPreImage',
    preImage: 'yourPreImage'
};
await sendMessage(stream, verifyPreImageData);
const verifyPreImageResponse = await receiveResponse(stream);
console.log('VerifyPreImage response:', verifyPreImageResponse);

// Send a channel redemption request
const redeemChannelData = {
    type: 'redeemChannel',
    payer: 'yourPayerAddress',
    finalHashValue: 'yourFinalHashValue'
};
await sendMessage(stream, redeemChannelData);
const redeemChannelResponse = await receiveResponse(stream);
console.log('RedeemChannel response:', redeemChannelResponse);

// Stop the client node
await clientNode.stop();
console.log('Client node stopped');
