// SPDX-License-Identifier: None
pragma solidity ^0.8.9;

import './RilascioAdmin.sol';
import './RilascioSVG.sol';

contract RilascioY is ERC721URIStorage, RilascioAdmin {
  /* ******* */
  /* STORAGE */
  /* ******* */

  address internal _rilascio; //メインのコントラクトアドレス

  /* *********** */
  /* CONSTRUCTOR */
  /* *********** */

  constructor(address rilascio_) ERC721('YieldNFT-Rilascio', 'yNFT') {
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
    uint256 _amount = IRilascio(_rilascio).getLockIdToAmount(_lockId);
    bytes memory json = RilascioSVG.getYieldSVG(
      _lockId,
      _lock.toLockNftId,
      _amount,
      _lock.lockStartDate,
      _lock.lockDuration,
      _lock.paymentTokenAddress,
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
