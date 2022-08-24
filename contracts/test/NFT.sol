// SPDX-License-Identifier: None
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";


contract NFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenCounter;

    constructor () ERC721 ("test", "TEST") {}

    function mint() public returns (uint256) {
        _tokenCounter.increment();
        uint256 newItemId = _tokenCounter.current();

        _safeMint(msg.sender, newItemId);
        _setTokenURI(newItemId, "https://gateway.pinata.cloud/ipfs/QmbsrWq6FBpcbn4zoZKFZ6qPwqud2QtJ21gBkQ1fiibaFT");

        return newItemId;
    }
}