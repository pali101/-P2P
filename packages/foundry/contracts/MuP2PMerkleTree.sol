// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "./Utility.sol";

contract MicropayHashchain {
    Utility public utility;

    struct Channel {
        bytes32 trustAnchor;
        uint256 amount;
        uint256 numberOfTokens;
        uint256 withdrawAfterBlocks;
    }

    // user -> channel
    mapping(address => Channel) public channelsMapping;
    // user -> merchant -> number of validated tokens
    mapping(address => mapping(address => uint256)) public trackTokensMapping;
    // token -> consumed/not consumed
    mapping(bytes32 => bool) public consumedTokens;

    error IncorrectAmount(uint256 sent, uint256 expected);
    error TokenVerificationFailed(address payer, bytes32 token);

    event ChannelCreated(
        address indexed payer,
        uint256 amount,
        uint256 numberOfTokens,
        uint256 withdrawAfterBlocks
    );

    event TokenAdded(
        address indexed payer,
        address indexed merchant,
        bytes32 token
    );

    event MerchantPaid(
        address indexed payer,
        address indexed merchant,
        uint256 amount
    );

    constructor(address utilityAddress) {
        utility = Utility(utilityAddress);
    }

    function createChannel(
        bytes32 trustAnchor,
        uint256 amount,
        uint256 numberOfTokens,
        uint256 withdrawAfterBlocks
    ) public payable {
        if (msg.value != amount) {
            revert IncorrectAmount(msg.value, amount);
        }

        // prevent accidental overwrite
        require(
            channelsMapping[msg.sender].amount == 0,
            "Channel already exists."
        );

        channelsMapping[msg.sender] = Channel({
            trustAnchor: trustAnchor,
            amount: amount,
            numberOfTokens: numberOfTokens,
            withdrawAfterBlocks: withdrawAfterBlocks
        });

        emit ChannelCreated(
            msg.sender,
            amount,
            numberOfTokens,
            withdrawAfterBlocks
        );
    }

    function validateToken(
        address payer,
        bytes32[] calldata merkleProof,
        bytes32 token
    ) public {
        Channel memory channel = channelsMapping[payer];
        require(
            utility.verifyMerkleProof(merkleProof, channel.trustAnchor, token),
            TokenVerificationFailed(payer, token)
        );
        require(!consumedTokens[token], "Token already used.");
        consumedTokens[token] = true;

        trackTokensMapping[payer][msg.sender] += 1;
        emit TokenAdded(payer, msg.sender, token);
    }

    function payMerchant(address payer) public {
        Channel storage channel = channelsMapping[payer];
        uint256 payableAmount = (channel.amount *
            trackTokensMapping[payer][msg.sender]) / channel.numberOfTokens;

        trackTokensMapping[payer][msg.sender] = 0;

        (bool sent, ) = payable(msg.sender).call{value: payableAmount}("");
        require(sent, "Failed to send Ether");
        emit MerchantPaid(payer, msg.sender, payableAmount);
    }

    receive() external payable {}

    fallback() external payable {}
}
