// SPDX-License-Identifier: None
pragma solidity ^0.8.9;

interface IRilascioYNFT {
  function mint(address _borrower, uint256 _lockId) external;

  function burn(uint256 _lockId) external;

  function exists(uint256 _tokenId) external view returns (bool);
}
