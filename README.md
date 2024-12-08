# μP2P
In today's world, one can find oneself stuck in service contracts which are defined by the corporate greed rather than your requirements. We intend to solve this by giving back control to you, the user. Our micro-transactions solution lets you granularise and adapt these service contracts to your needs, whether your need is for a few seconds or a couple of hours. Take your WiFi service contract for example, you are forced to pay on a monthly/yearly basis even though you might use it for a few minutes/hours. Our solution allows you to track this usage at a very granular level and pay only for what you have used. This provides you with the freedom you deserve, while ensuring more trust between you and the service provider.

<!-- ## Process Flow Diagrams
The process flow of interactions between the client, server, and smart contract is described in the following diagrams: -->

## Contracts 
Our scheme MuP2P is a collection of three individual micropayment schemes. The key insight behind the initial two schemes is to replace resource-hungry PKI operations with hash functions to reduce on-chain cost. Our final scheme utilizes probabilistic micropayment, here a payer hands out tokens instead of payments to each merchant and then draws a winner randomly and pays the reward for that particular lot to the winner. In the long run, the economics works out, and the scheme is fair to everyone while simulatively reducing hundreds/thousands of on-chain transactions into a few. 

### Schemes: 

#### 1. Hash Chain-Based Scheme
This contract facilitates decentralized payments using hashchains for token validation between payers and merchants.

##### Core Features:
- Channel creation: Users create channels with a trust anchor, locked Ether, and token parameters.
- Channel Redemption: Merchants redeem tokens, validated by the Utility contract. Contract sends proportional payment and refunds any remaining balance.
- Token Validation: Uses hashchains for secure, trustless token verification.

The process flow of interactions between the client, server, and smart contract is described in the following diagrams:

<img src="InteractionDiagram.png" alt="Hash Chain-Based Scheme" width="500"/>

This contract ensures secure, efficient, and trustless micro transactions for decentralized applications.

MuP2P based on Merkle tree: 

MuP2P probabilistic:
#### 2. Merkle Tree-Based Scheme
This contract enables decentralized payments using Merkle trees for secure token validation between payers and merchants.

##### Core Features:
- Channel Creation: Payers create payment channels with funds and trust anchors.
- Token Validation: Tokens are verified against a Merkle proof using the UtilityMerkle contract. Contract prevents token reuse with consumedTokens mapping.
- Merchant Payment: Merchants claim payments based on validated tokens. The merchants are proportionally paid from locked funds.

The process flow of interactions between the client, server, and smart contract is described in the following diagrams:

<img src="InteractionDiagramMerkle.png" alt="Merkle Tree-Based Scheme" width="500"/>

This contract ensures secure, scalable micro transactions with Merkle tree-based token validation.

#### 3. Probabilistic Scheme
This contract facilitates probabilistic payments using ticket-based mechanisms where payees submit off-chain tickets to participate in a lottery-style payout.

##### Core Features:
- Lot Initialization: The payer initializes a payment lot with a predefined number of tickets (lotSize) and value (ticketValue). It ensures funds are locked for payouts.
- Ticket Submission: Payees submit signed tickets, verified on-chain using signatures. Contract adds valid tickets to the current lot.
- Winner Selection: A winner is selected pseudorandomly when a lot is full. The winner receives the total lot payout (lotSize * ticketValue).

## LibP2P 

We utilized libp2p to connect client and server in a decentralized manner. We choose libp2p as it provides us with peer discovery and direct communication without centralized servers, supports multiple transport protocols (TCP, WebRTC, QUIC) and help us set up encrypted connections with protocol multiplexing for modular communication.  

libp2p enables decentralized, secure, and fault-tolerant peer-to-peer communication, offering scalability, flexibility, reduced infrastructure costs, and seamless interoperability with blockchain and Web3 systems. 

## Server
`packages/nextjs/server/server.js `

Starts the libp2p server node and listens for incoming connections. 

- **sendResponse**: Sends a JSON response back to the client via a libp2p stream. 

- **HandleConnect**: Handles client connection requests and verifies the initial setup with the appropriate contract type. 

- **verifyEventData**: Verifies event data emitted by smart contracts against the client data. 

- **handleValidateToken**: Validates a hashchain preImage or a merkle tree token provided by the client. 

- **handlePayMerchant**: Handles the process of paying the merchant and/or redeeming the channel based on the contract type.  

