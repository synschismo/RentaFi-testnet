// SPDX-License-Identifier: None
pragma solidity ^0.8.9;

import "./RilascioAdmin.sol";

contract RilascioW is ERC721URIStorage, Ownable, RilascioAdmin {

    address internal _rilascio; //メインのコントラクトアドレス

    modifier onlyRilascio() {
        require(msg.sender == _rilascio, "only rilascio is allowance.");
        _;
    }

    // Rilascioからデプロイする際に、プレフィックスとオリジナルNFTのname, symbolが結合された状態で代入される
    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {
        _rilascio = msg.sender;
    }

    // TODO
    function _exists(uint256 tokenId) internal view override returns (bool) {
        return IERC721(IRilascio(_rilascio).getLockConditions(IRilascio(_rilascio).getRentIdToLockId(IRilascio(_rilascio).getCurrentRents(address(this), tokenId))).toLockNftContract).ownerOf(tokenId) != address(0);
    }

    //TODO balances

    function ownerOf(uint256 _tokenId) public view virtual override returns (address) {
        uint256 _rentId = IRilascio(_rilascio).getCurrentRents(address(this), _tokenId);
        uint256 _rentalEndTime = IRilascio(_rilascio).getRentConditions(_rentId).rentalEndTime;
        if(_rentalEndTime > block.timestamp){
            return IRilascio(_rilascio).getRentConditions(_rentId).borrowerAddress;
        } else {
            return _rilascio;
        }
    }

    function emitTransfer(address _from, address _to, uint256 _tokenId) public onlyRilascio {
        emit Transfer(_from, _to, _tokenId);
    }
    
    function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
        uint256 _rentId = IRilascio(_rilascio).getCurrentRents(address(this), _tokenId);
        uint256 _rentalEndTime = IRilascio(_rilascio).getRentConditions(_rentId).rentalEndTime;
        uint256 _lockId = IRilascio(_rilascio).getRentIdToLockId(_rentId);
        IRilascio.Lock memory _lock = IRilascio(_rilascio).getLockConditions(_lockId);
        
        require(
            _exists(_tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        if(_rentalEndTime > block.timestamp){
            return IERC721Metadata(_lock.toLockNftContract).tokenURI(_tokenId);
        } else {
            bytes memory json = abi.encodePacked(
                '{"name": "wrappedNFT - Rilascio", "description": "WrappedNFT is wrapped original NFT deposited by Lender in a Rilascio Escrow. When rental has began, this NFT will link to Original NFT metadata."}'
            );
            string memory _tokenURI = string(
                abi.encodePacked(
                    "data:application/json;base64,",
                    Base64.encode(json)
                )
            );
            return _tokenURI;
        }
    }

    function _transfer(
        address from,
        address to,
        uint256 tokenId
    ) internal virtual override(ERC721) {
        require(
            from == _rilascio,
            "Wrapped NFT CAN Transfer as P2C. No supports with P2P."
        );
        super._transfer(from, to, tokenId);
    }

    function burn(uint256 _tokenId) public onlyRilascio {
        _burn(_tokenId);
    }
}
