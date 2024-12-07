// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract Utility {
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
}
