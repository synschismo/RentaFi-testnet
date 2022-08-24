// SPDX-License-Identifier: None
pragma solidity ^0.8.9;

import '@openzeppelin/contracts/utils/Counters.sol';
import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/Base64.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol';
import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/token/ERC1155/IERC1155.sol';
import '@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol';
import '@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol';
//TODO
//Receiver
import '@openzeppelin/contracts/token/ERC1155/IERC1155Receiver.sol';
import './IRilascio.sol';
import './IRilascioONFT.sol';
import './IRilascioYNFT.sol';
import './IRilascioAdmin.sol';

contract RilascioAdmin is Ownable {
  address internal _adminAddress;
  uint256 internal _adminRoyalty = 100; //運営手数料 10%
  uint256 internal _minimumRentalFee = 1000000000000000; //最小レンタル費用 0.001 ether
  uint256 internal _minimumRentalDuration = 1; //最短のレンタル日数
  uint256 internal _divider = 1000;

  address private _yNft; //yNFTのコントラクトアドレス
  address private _oNft; //oNFTのコントラクトアドレス

  constructor() {
    _adminAddress = msg.sender;
  }

  /* ******** */
  /* MODIFIER */
  /* ******** */
  modifier onlyAdmin() {
    require(msg.sender == _adminAddress, 'only owner is allowance.');
    _;
  }

  /* ******** */
  /* FUNCTION */
  /* ******** */

  function setRilascioO(address oNft_) public onlyAdmin {
    _oNft = oNft_;
  }

  function setRilascioY(address yNft_) public onlyAdmin {
    _yNft = yNft_;
  }

  function changeAdmin(address _address) public onlyAdmin {
    _adminAddress = _address;
  }

  function changeAdminRoyalty(uint256 adminRoyalty_) public onlyAdmin {
    _adminRoyalty = adminRoyalty_;
  }

  function changeMinimumRentalFee(uint256 _fee) public onlyAdmin {
    _minimumRentalFee = _fee;
  }

  /* ************* */
  /* VIEW FUNCTION */
  /* ************* */

  function getRilascioO() public view returns (address) {
    return address(_oNft);
  }

  function getRilascioY() public view returns (address) {
    return address(_yNft);
  }

  function getAdminAddress() public view returns (address) {
    return address(_adminAddress);
  }

  function getAdminRoyalty() public view returns (uint256) {
    return _adminRoyalty;
  }

  function getMinimumRentalFee() public view returns (uint256) {
    return _minimumRentalFee;
  }

  function getMinimumRentalDuration() public view returns (uint256) {
    return _minimumRentalDuration;
  }

  function onERC721Received(
    address _operator,
    address _from,
    uint256 _tokenId,
    bytes calldata _data
  ) external view returns (bytes4) {
    require(
      IRilascio(address(this)).getRilascioW(msg.sender) != address(0),
      'Rilascio: This Token not Supported'
    );

    _operator;
    _from;
    _tokenId;
    _data;
    return 0x150b7a02;
  }
}
