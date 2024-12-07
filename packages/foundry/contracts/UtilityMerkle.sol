// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "murky/src/CompleteMerkle.sol";

contract UtilityMerkle {
    CompleteMerkle public merkleTree;

    constructor() {
        merkleTree = new CompleteMerkle();
    }

    function verifyMerkleProof(
        bytes32[] memory proof,
        bytes32 root,
        bytes32 leaf
    ) public view returns (bool) {
        return merkleTree.verifyProof(root, proof, leaf);
    }
}
