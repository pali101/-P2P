// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract MuP2PProbabilistic {
    address public payer;
    uint256 public lotSize;
    uint256 public currentLotId = 1;
    uint256 public ticketValue;

    struct Ticket {
        address payee;
        uint256 ticketIndex;
    }

    struct Lot {
        bool initialized;
        uint256 totalTickets;
        bool processed;
    }

    // Lot ID => Lot details
    mapping(uint256 => Lot) public lots;
    // Lot ID => Tickets in the lot
    mapping(uint256 => Ticket[]) public tickets;

    event LotInitialized(uint256 lotId, uint256 deposit);
    event TicketSubmitted(
        address indexed payee,
        uint256 ticketIndex,
        uint256 lotId
    );
    event WinnerSelected(address indexed winner, uint256 lotId, uint256 payout);

    constructor(uint256 _lotSize, uint256 _ticketValue, address _payer) {
        lotSize = _lotSize;
        ticketValue = _ticketValue;
        payer = _payer;
    }

    function initializeLot() external payable {
        require(msg.sender == payer, "Only the payer can initialize a lot");
        require(!lots[currentLotId].initialized, "Lot already initialized");
        require(msg.value == lotSize * ticketValue, "Incorrect deposit amount");

        lots[currentLotId] = Lot({
            initialized: true,
            totalTickets: 0,
            processed: false
        });

        emit LotInitialized(currentLotId, msg.value);
    }

    // Payees submit tickets issued off-chain
    function submitTicket(
        uint256 ticketIndex,
        bytes32 ticketHash,
        bytes memory signature
    ) external {
        require(lots[currentLotId].initialized, "Lot is not initialized");
        require(
            !lots[currentLotId].processed,
            "Lot has already been processed"
        );
        require(lots[currentLotId].totalTickets < lotSize, "Lot is full");
        require(
            _verifyTicket(ticketHash, signature),
            "Invalid ticket signature"
        );

        // Add the ticket to the current lot
        tickets[currentLotId].push(Ticket(msg.sender, ticketIndex));
        lots[currentLotId].totalTickets++;

        emit TicketSubmitted(msg.sender, ticketIndex, currentLotId);

        // If the lot is full, process it to select a winner
        if (lots[currentLotId].totalTickets >= lotSize) {
            _selectWinner(currentLotId);
            currentLotId++;
        }
    }

    // Internal function to select a winner for a lot
    function _selectWinner(uint256 lotId) internal {
        require(lots[lotId].initialized, "Lot is not initialized");
        require(!lots[lotId].processed, "Lot already processed");
        require(lots[lotId].totalTickets == lotSize, "Lot is not full");

        // Generate pseudo-random number
        // To-do: switch to Supra or chainlink
        uint256 random = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    block.number
                )
            )
        );
        uint256 winnerIndex = random % lotSize;

        Ticket memory winningTicket = tickets[lotId][winnerIndex];
        uint256 payout = ticketValue * lotSize;

        // Transfer funds to the winner
        payable(winningTicket.payee).transfer(payout);

        emit WinnerSelected(winningTicket.payee, lotId, payout);

        // Mark the lot as processed
        lots[lotId].processed = true;
    }

    // Verify the signature of a ticket
    function _verifyTicket(
        bytes32 ticketHash,
        bytes memory signature
    ) internal view returns (bool) {
        bytes32 ethSignedMessageHash = _getEthSignedMessageHash(ticketHash);
        return recoverSigner(ethSignedMessageHash, signature) == payer;
    }

    // Helper to calculate the Ethereum signed message hash
    function _getEthSignedMessageHash(
        bytes32 hash
    ) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
            );
    }

    // Recover the signer from a signature
    function recoverSigner(
        bytes32 hash,
        bytes memory signature
    ) internal pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = _splitSignature(signature);
        return ecrecover(hash, v, r, s);
    }

    // Helper to split a signature into r, s, and v
    function _splitSignature(
        bytes memory sig
    ) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        require(sig.length == 65, "Invalid signature length");
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }

    // Withdraw unused funds (only the payer can withdraw)
    function withdrawFunds(uint256 amount) external {
        require(msg.sender == payer, "Only the payer can withdraw funds");
        payable(payer).transfer(amount);
    }

    // Allow the contract to receive ETH
    receive() external payable {}
}
