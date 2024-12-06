// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "murky/src/CompleteMerkle.sol";

contract Utility {
    CompleteMerkle public merkleTree;

    constructor() {
        merkleTree = new CompleteMerkle();
    }

    function verifyHashchain(
        bytes32 trustAnchor,
        bytes32 finalHashValue,
        uint256 numberOfTokensUsed
    ) external pure returns (bool) {
        for (uint256 i = 0; i < numberOfTokensUsed; i++) {
            finalHashValue = keccak256(abi.encode(finalHashValue));
        }
        return finalHashValue == trustAnchor;
    }

    function verifyMerkleProof(
        bytes32[] memory proof,
        bytes32 root,
        bytes32 leaf
    ) public view returns (bool) {
        return merkleTree.verifyProof(root, proof, leaf);
    }
}
