// SPDX-License-Identifier: None
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Weth is ERC20 {
    constructor() ERC20("WETH", "Wrapped ETH") {
        _mint(msg.sender, 115000000000000000);
    }

    function mint() public {
        _mint(msg.sender, 115000000000000000);
    }
}