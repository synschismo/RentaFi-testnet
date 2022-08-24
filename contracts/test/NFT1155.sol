// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract TEST1155 is ERC1155 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenCounter;

    // コントラクトデプロイ時に１度だけ呼ばれる
    constructor() ERC1155("") {}

    // Token name
    string public name;

    // Token symbol
    string public symbol;

    function mint(uint256 _tokenId, uint256 _amount) public { 
        _mint(msg.sender, _tokenId, _amount, "");
    }
}