/**
 * This file is autogenerated by Scaffold-ETH.
 * You should not edit it manually or your changes might be overwritten.
 */
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const deployedContracts = {
  31337: {
    MuP2PHashchain: {
      address: "0xe1aa25618fa0c7a1cfdab5d6b456af611873b629",
      abi: [
        {
          type: "constructor",
          inputs: [
            {
              name: "utilityAddress",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "fallback",
          stateMutability: "payable",
        },
        {
          type: "receive",
          stateMutability: "payable",
        },
        {
          type: "function",
          name: "channelsMapping",
          inputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "trustAnchor",
              type: "bytes32",
              internalType: "bytes32",
            },
            {
              name: "amount",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "numberOfTokens",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "withdrawAfterBlocks",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "createChannel",
          inputs: [
            {
              name: "merchant",
              type: "address",
              internalType: "address",
            },
            {
              name: "trustAnchor",
              type: "bytes32",
              internalType: "bytes32",
            },
            {
              name: "amount",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "numberOfTokens",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "withdrawAfterBlocks",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "payable",
        },
        {
          type: "function",
          name: "redeemChannel",
          inputs: [
            {
              name: "payer",
              type: "address",
              internalType: "address",
            },
            {
              name: "finalHashValue",
              type: "bytes32",
              internalType: "bytes32",
            },
            {
              name: "numberOfTokensUsed",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "utility",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "contract Utility",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "event",
          name: "ChannelCreated",
          inputs: [
            {
              name: "payer",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "merchant",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "amount",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "numberOfTokens",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "withdrawAfterBlocks",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "IncorrectAmount",
          inputs: [
            {
              name: "sent",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "expected",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
      ],
      inheritedFunctions: {},
    },
    MuP2PMerkleTree: {
      address: "0xe1da8919f262ee86f9be05059c9280142cf23f48",
      abi: [
        {
          type: "constructor",
          inputs: [
            {
              name: "utilityAddress",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "fallback",
          stateMutability: "payable",
        },
        {
          type: "receive",
          stateMutability: "payable",
        },
        {
          type: "function",
          name: "channelsMapping",
          inputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "trustAnchor",
              type: "bytes32",
              internalType: "bytes32",
            },
            {
              name: "amount",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "numberOfTokens",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "withdrawAfterBlocks",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "consumedTokens",
          inputs: [
            {
              name: "",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "createChannel",
          inputs: [
            {
              name: "trustAnchor",
              type: "bytes32",
              internalType: "bytes32",
            },
            {
              name: "amount",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "numberOfTokens",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "withdrawAfterBlocks",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "payable",
        },
        {
          type: "function",
          name: "payMerchant",
          inputs: [
            {
              name: "payer",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "trackTokensMapping",
          inputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "utility",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "contract Utility",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "validateToken",
          inputs: [
            {
              name: "payer",
              type: "address",
              internalType: "address",
            },
            {
              name: "merkleProof",
              type: "bytes32[]",
              internalType: "bytes32[]",
            },
            {
              name: "token",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "event",
          name: "ChannelCreated",
          inputs: [
            {
              name: "payer",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "amount",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "numberOfTokens",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "withdrawAfterBlocks",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "MerchantPaid",
          inputs: [
            {
              name: "payer",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "merchant",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "amount",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "TokenAdded",
          inputs: [
            {
              name: "payer",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "merchant",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "token",
              type: "bytes32",
              indexed: false,
              internalType: "bytes32",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "IncorrectAmount",
          inputs: [
            {
              name: "sent",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "expected",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
        {
          type: "error",
          name: "TokenVerificationFailed",
          inputs: [
            {
              name: "payer",
              type: "address",
              internalType: "address",
            },
            {
              name: "token",
              type: "bytes32",
              internalType: "bytes32",
            },
          ],
        },
      ],
      inheritedFunctions: {},
    },
  },
} as const;

export default deployedContracts satisfies GenericContractsDeclaration;
