//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/MuP2PMerkleTree.sol";
import "./DeployHelpers.s.sol";

contract DeployMuP2PMerkleTree is ScaffoldETHDeploy {
  // use `deployer` from `ScaffoldETHDeploy`
  function run() external ScaffoldEthDeployerRunner {
    MuP2PMerkleTree muP2PMerkleTree = new MuP2PMerkleTree(deployer);
    console.logString(
      string.concat(
        "MuP2PMerkleTree deployed at: ", vm.toString(address(muP2PMerkleTree))
      )
    );
  }
}
