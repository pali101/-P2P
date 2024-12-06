// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../src/Utility.sol";
import "murky/src/CompleteMerkle.sol";

contract UtilityTest is Test {
    Utility private utility;

    function setUp() public {
        utility = new Utility();
    }

    function testVerifyHashchain() public view {
        // Arrange
        bytes32 initialHashValue = keccak256(abi.encode("initialValue"));
        uint256 numberOfTokensUsed = 5;
        bytes32 trustAnchor = initialHashValue;

        for (uint256 i = 0; i < numberOfTokensUsed; i++) {
            trustAnchor = keccak256(abi.encode(trustAnchor));
        }

        // Act
        bool result = utility.verifyHashchain(
            trustAnchor,
            initialHashValue,
            numberOfTokensUsed
        );

        // Assert
        assertTrue(result, "Hashchain verification failed");
    }

    function testGenerateAndVerifyMerkleProof() public {
        // Arrange
        bytes32[] memory leaves = new bytes32[](4);
        leaves[0] = keccak256(abi.encodePacked("leaf1"));
        leaves[1] = keccak256(abi.encodePacked("leaf2"));
        leaves[2] = keccak256(abi.encodePacked("leaf3"));
        leaves[3] = keccak256(abi.encodePacked("leaf4"));

        // Generate Merkle root
        bytes32 root = utility.merkleTree().getRoot(leaves);

        // Generate proof for the first leaf
        bytes32[] memory proof = utility.merkleTree().getProof(leaves, 0);

        // Act
        bool result = utility.verifyMerkleProof(proof, root, leaves[0]);

        // Assert
        assertTrue(result, "Merkle proof verification failed");
    }

    function testInvalidMerkleProof() public {
        // Arrange
        bytes32[] memory leaves = new bytes32[](4);
        leaves[0] = keccak256(abi.encodePacked("leaf1"));
        leaves[1] = keccak256(abi.encodePacked("leaf2"));
        leaves[2] = keccak256(abi.encodePacked("leaf3"));
        leaves[3] = keccak256(abi.encodePacked("leaf4"));

        // Generate Merkle root
        bytes32 root = utility.merkleTree().getRoot(leaves);

        // Generate proof for the first leaf
        bytes32[] memory proof = utility.merkleTree().getProof(leaves, 0);

        // Modify the leaf (simulate tampered data)
        bytes32 tamperedLeaf = keccak256(abi.encodePacked("tamperedLeaf"));

        // Act
        bool result = utility.verifyMerkleProof(proof, root, tamperedLeaf);

        // Assert
        assertFalse(result, "Invalid Merkle proof was incorrectly verified");
    }

    function testProofForDifferentLeaf() public {
        // Arrange
        bytes32[] memory leaves = new bytes32[](4);
        leaves[0] = keccak256(abi.encodePacked("leaf1"));
        leaves[1] = keccak256(abi.encodePacked("leaf2"));
        leaves[2] = keccak256(abi.encodePacked("leaf3"));
        leaves[3] = keccak256(abi.encodePacked("leaf4"));

        // Generate Merkle root
        bytes32 root = utility.merkleTree().getRoot(leaves);

        // Generate proof for the first leaf
        bytes32[] memory proof = utility.merkleTree().getProof(leaves, 0);

        // Act
        bool result = utility.verifyMerkleProof(proof, root, leaves[1]); // Use a different leaf

        // Assert
        assertFalse(
            result,
            "Proof for a different leaf was incorrectly verified"
        );
    }
}
