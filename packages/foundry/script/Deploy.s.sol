//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import { DeployMuP2PHashchain } from "./DeployMuP2PHashchain.s.sol";
import { DeployMuP2PMerkleTree } from "./DeployMuP2PMerkleTree.s.sol";

contract DeployScript is ScaffoldETHDeploy {
  function run() external {
    DeployMuP2PHashchain deployMuP2PHashchain = new DeployMuP2PHashchain();
    deployMuP2PHashchain.run();

    DeployMuP2PMerkleTree deployMuP2PMerkleTree = new DeployMuP2PMerkleTree();
    deployMuP2PMerkleTree.run();
    // deploy more contracts here
  }
}
