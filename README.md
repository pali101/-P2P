# μP2P

<!-- ## Process Flow Diagrams
The process flow of interactions between the client, server, and smart contract is described in the following diagrams: -->

### Hash Chain-Based Scheme
This contract facilitates decentralized payments using hashchains for token validation between payers and merchants.

Core Features:
- Channel creation: Users create channels with a trust anchor, locked Ether, and token parameters.
- Channel Redemption: Merchants redeem tokens, validated by the Utility contract. Contract sends proportional payment and refunds any remaining balance.
- Token Validation: Uses hashchains for secure, trustless token verification.

The process flow of interactions between the client, server, and smart contract is described in the following diagrams:

<img src="InteractionDiagram.png" alt="Hash Chain-Based Scheme" width="500"/>

This contract ensures secure, efficient, and trustless micro transactions for decentralized applications.

### Merkle Tree-Based Scheme
This contract enables decentralized payments using Merkle trees for secure token validation between payers and merchants.

Core Features:
- Channel Creation: Payers create payment channels with funds and trust anchors.
- Token Validation: Tokens are verified against a Merkle proof using the UtilityMerkle contract. Contract prevents token reuse with consumedTokens mapping.
- Merchant Payment: Merchants claim payments based on validated tokens. The merchants are proportionally paid from locked funds.

The process flow of interactions between the client, server, and smart contract is described in the following diagrams:

<img src="InteractionDiagramMerkle.png" alt="Merkle Tree-Based Scheme" width="500"/>

This contract ensures secure, scalable micro transactions with Merkle tree-based token validation.

### Probabilistic Scheme
This contract facilitates probabilistic payments using ticket-based mechanisms where payees submit off-chain tickets to participate in a lottery-style payout.

Core Features:
- Lot Initialization: The payer initializes a payment lot with a predefined number of tickets (lotSize) and value (ticketValue). It ensures funds are locked for payouts.
- Ticket Submission: Payees submit signed tickets, verified on-chain using signatures. Contract adds valid tickets to the current lot.
- Winner Selection: A winner is selected pseudorandomly when a lot is full. The winner receives the total lot payout (lotSize * ticketValue).

