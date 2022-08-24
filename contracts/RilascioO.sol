// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import './RilascioAdmin.sol';
import './RilascioSVG.sol';

contract RilascioO is ERC721URIStorage, RilascioAdmin {
  /* ******* */
  /* STORAGE */
  /* ******* */

  address internal _rilascio; //メインのコントラクトアドレス

  /* *********** */
  /* CONSTRUCTOR */
  /* *********** */

  constructor(address rilascio_) ERC721('OwnershipNFT-Rilascio', 'oNFT') {
    _rilascio = rilascio_;
  }

  modifier onlyRilascio() {
    require(msg.sender == _rilascio, 'only rilascio is allowance.');
    _;
  }

  /* ******** */
  /* FUNCTION */
  /* ******** */

  function mint(address _lender, uint256 _lockId) public onlyRilascio {
    // REQUIRE
    require(msg.sender == _rilascio, 'You are not minter');

    // TRANSACTION
    _safeMint(_lender, _lockId);
  }

  function tokenURI(uint256 _lockId) public view override returns (string memory) {
    // REQUIRE
    require(_exists(_lockId), 'ERC721Metadata: URI query for nonexistent token');

    // CHANGE STATE
    IRilascio.Lock memory _lock = IRilascio(_rilascio).getLockConditions(_lockId);
    uint256 _untilTime = 0;
    if (_lock.lockStartDate > 0) {
      _untilTime = (_lock.lockStartDate + _lock.lockDuration - block.timestamp) / 86400;
    }
    bytes memory json = RilascioSVG.getOwnershipSVG(
      _lockId,
      _untilTime,
      _lock.toLockNftId,
      _lock.lockStartDate,
      _lock.lockDuration,
      _lock.toLockNftContract
    );
    string memory _tokenURI = string(
      abi.encodePacked('data:application/json;base64,', Base64.encode(json))
    );
    return _tokenURI;
  }

  /* ************** */
  /* OWNER FUNCTION */
  /* ************** */

  function burn(uint256 _lockId) public onlyRilascio {
    _burn(_lockId);
  }

  /* ************* */
  /* VIEW FUNCTION */
  /* ************* */

  function exists(uint256 _tokenId) external view returns (bool) {
    return _exists(_tokenId);
  }
}
