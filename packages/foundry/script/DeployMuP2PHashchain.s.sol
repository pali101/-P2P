//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../contracts/MuP2PHashchain.sol";
import "./DeployHelpers.s.sol";

contract DeployMuP2PHashchain is ScaffoldETHDeploy {
  // use `deployer` from `ScaffoldETHDeploy`
  function run() external ScaffoldEthDeployerRunner {
    MuP2PHashchain muP2PHashchain = new MuP2PHashchain(deployer);
    console.logString(
      string.concat(
        "MuP2PHashchain deployed at: ", vm.toString(address(muP2PHashchain))
      )
    );
  }
}
