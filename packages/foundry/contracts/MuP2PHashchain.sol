// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Utility.sol";

contract MuP2PHashchain {
    Utility public utility;

    struct Channel {
        bytes32 trustAnchor;
        uint256 amount;
        uint256 numberOfTokens;
        uint256 withdrawAfterBlocks;
    }

    // user -> merchant -> channel
    mapping(address => mapping(address => Channel)) public channelsMapping;

    error IncorrectAmount(uint256 sent, uint256 expected);

    event ChannelCreated(
        address indexed payer,
        address indexed merchant,
        uint256 amount,
        uint256 numberOfTokens,
        uint256 withdrawAfterBlocks
    );
    //event ChannelRedeemed(
    //    address indexed payer,
    //    address indexed merchant,
    //    uint256 amountPaid,
    //    bytes32 finalHashValue,
    //    uint256 numberOfTokensUsed
    //);

    constructor(address utilityAddress) {
        utility = Utility(utilityAddress);
    }

    function createChannel(
        address merchant,
        bytes32 trustAnchor,
        uint256 amount,
        uint256 numberOfTokens,
        uint256 withdrawAfterBlocks
    ) public payable {
        if (msg.value != amount) {
            revert IncorrectAmount(msg.value, amount);
        }
        channelsMapping[msg.sender][merchant] = Channel({
            trustAnchor: trustAnchor,
            amount: amount,
            numberOfTokens: numberOfTokens,
            withdrawAfterBlocks: withdrawAfterBlocks
        });

        emit ChannelCreated(
            msg.sender,
            merchant,
            amount,
            numberOfTokens,
            withdrawAfterBlocks
        );
    }

    function redeemChannel(
        address payer,
        bytes32 finalHashValue,
        uint256 numberOfTokensUsed
    ) public {
        Channel storage channel = channelsMapping[payer][msg.sender];
        require(
            channel.amount > 0,
            "Channel does not exist or has been withdrawn."
        );
        require(
            utility.verifyHashchain(
                channel.trustAnchor,
                finalHashValue,
                numberOfTokensUsed
            ),
            "Token verification failed."
        );
        uint256 payableAmount = (channel.amount * numberOfTokensUsed) /
            channel.numberOfTokens;
        require(payableAmount > 0, "Nothing is payable.");
        delete channelsMapping[payer][msg.sender];
        (bool sent, ) = payable(msg.sender).call{value: payableAmount}("");
        require(sent, "Failed to send Ether");

        //emit ChannelRedeemed(
        //    payer,
        //    msg.sender,
        //    payableAmount,
        //    finalHashValue,
        //    numberOfTokensUsed
        //);
    }

    receive() external payable {}

    fallback() external payable {}
}
