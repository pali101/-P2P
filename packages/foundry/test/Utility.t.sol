// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "forge-std/Test.sol";
import "../contracts/Utility.sol";

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
}
