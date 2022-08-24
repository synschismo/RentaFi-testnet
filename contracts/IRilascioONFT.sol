// SPDX-License-Identifier: None
pragma solidity ^0.8.9;

interface IRilascioONFT {
  function mint(address _to, uint256 _lockId) external;

  function burn(uint256 _lockId) external;

  function exists(uint256 _tokenId) external view returns (bool);
}
