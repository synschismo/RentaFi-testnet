// SPDX-License-Identifier: None
pragma solidity 0.8.9;

import './RilascioW.sol';
import './RilascioAdmin.sol';

//TODO: noreentrancy, pauseable などのセキュリティ追加

contract Rilascio is RilascioAdmin {
  //STOTAGE
  /* ******* */
  /* STORAGE */
  /* ******* */

  using Counters for Counters.Counter;
  Counters.Counter private _lockCounter;
  Counters.Counter private _rentCounter;

  //uint256 private _totalLocks;
  //uint256 private _totalRents;

  struct Lock {
    // レンタルを管理する共有データ
    uint256 toLockNftId; //ロックするNFTのトークンID
    uint256 lockStartDate; //ロックした日時
    uint256 lockDuration; //NFTのロック期間 => ロックが終了する期間?
    uint256 maxRentalDuration; //レンタルする際の最大貸出期間
    uint256 dailyRentalPrice; //1日あたりのレンタル料
    uint256 amount; //預けるトークン数量
    address toLockNftContract; //ロックするNFTのコントラクトアドレス
    address lenderAddress; //貸主のアドレス
    address paymentTokenAddress; //支払いに使用する通貨
    bool is1155;
  }

  struct Rent {
    uint256 rentalStartTime; //レンタルを開始した日時
    uint256 rentalEndTime; //レンタルが終了する日時
    address borrowerAddress; //借手のアドレス
  }

  // ロックIDとロック情報の紐付け, deposit, delete
  mapping(uint256 => Lock) private _lockIdToConditions;

  // レンタルIDとレンタル情報の紐付け, rental
  mapping(uint256 => Rent) private _rentIdToConditions;

  // コントラクトアドレスとトークンIDから、ロックIDを取得, deposit, delete
  mapping(address => mapping(uint256 => uint256)) private _nftToLockId;

  // ラップしたコントラクトアドレスとIDから、レンタルIDを取得, rental,
  //TODO
  mapping(address => mapping(uint256 => uint256)) private _nftToRentId;

  // ロックするNFTのコントラクトアドレスからwコントラクトアドレスを紐付ける, deploy product
  mapping(address => address) private _originalToWrap;

  mapping(address => bool) private _payableToken;

  // レンタルID別の収益バランス deposit, rental
  mapping(uint256 => uint256) private _lockIdToAmount;

  // ロックID -> rentId, rental
  mapping(uint256 => uint256[]) private _lockIdToRentIds;

  // rentalID->ロックIDの紐付け, rental
  mapping(uint256 => uint256) private _rentIdToLockId;

  //EVENT
  /* ***** */
  /* EVENT */
  /* ***** */

  //TODO インターフェースにamountを反映させる
  event LogDeposit(uint256 indexed _lockId, uint256 indexed _tokenId, address indexed _nft);

  event LogContinueLockwithChange(
    uint256 indexed _lockId,
    uint256 indexed _tokenId,
    address indexed _nft
  );

  event LogDelete(
    address _lenderAddress,
    uint256 indexed _lockId,
    uint256 indexed _tokenId,
    address indexed _nft
  );

  // NFT の引き出し
  event LogWithdraw(
    address _withdrawer,
    uint256 indexed _lockId,
    uint256 indexed _tokenId,
    address indexed _nft
  );

  // レンタルのかいし
  event LogRentalStart(
    address _borrowerAddress,
    uint256 indexed _lockId,
    uint256 indexed _tokenId,
    address indexed _wrappedAddress
  );

  // 手数料の請求
  event LogClaim(address _claimer, uint256 indexed _lockId, uint256 _sendAmount);

  //FUNCTION
  /* ******** */
  /* FUNCTION */
  /* ******** */

  // NFTをエスクローコントラクトに預け入れる。貸し手は、ロック期間や連続レンタル日数、レンタル料金、NFTのコントラクトアドレス、トークンID、支払いトークンアドレスの指定を行う
  function deposit(
    uint256 _toLockNftId,
    uint256 _lockDuration, //units: days
    uint256 _maxRentalDuration, //units: days
    uint256 _dailyRentalPrice, //units: wei
    address _toLockNftContract
  ) public {
    /* INITIAL */
    _lockCounter.increment();
    uint256 newLockId = _lockCounter.current();

    /* REQUIRE　*/
    // @notice 預けるNFTのIDは0であってはならない
    //require(_toLockNftId != 0, "Rilascio: Token Id is Zero");
    // @notice ロック期間は0より大きくなければならない
    require(_lockDuration > 0, 'Rilascio: Duration is Zero');
    // @notice 最大連続レンタル日数は０よりも大きく、ロック期間以下でなければならない
    require(
      0 < _maxRentalDuration && _maxRentalDuration <= _lockDuration,
      'Rilascio: Dur. invalid'
    );
    // @notice レンタル料金は_minimumRentalFee以上でなければならない
    require(_dailyRentalPrice >= _minimumRentalFee, 'Rilascio: lager than minimum');
    // @notice コントラクトアドレスが正しいアドレスでなければならない
    require(_toLockNftContract != address(0), 'Rilascio: Address is Zero');
    // @notice 本プロトコルのホワイトリストに登録されたコレクションでなければならない
    require(getRilascioW(_toLockNftContract) != address(0), 'Rilascio: Token not Supported');

    /* CHANGE STATE */
    //ERC1155への対応のため、配列を用いて一般化した（ERC721であれば長さ1で利用でき、1155であれば任意の板数に対応できる
    _nftToLockId[_toLockNftContract][_toLockNftId] = newLockId;

    //1155の有無に関わらず、貸板は唯一である
    _lockIdToConditions[newLockId] = Lock({
      toLockNftId: _toLockNftId,
      lockStartDate: 0, // @notice depositしただけではロックは始まらない
      lockDuration: _dayToSec(_lockDuration),
      maxRentalDuration: _dayToSec(_maxRentalDuration),
      dailyRentalPrice: _dailyRentalPrice,
      amount: 1,
      toLockNftContract: _toLockNftContract,
      lenderAddress: msg.sender,
      paymentTokenAddress: address(0),
      is1155: false
    });

    /* TRANSACTION */
    // @notice コントラクトへNFTをロックする。ロック期間が終了するまで引き出すことはできない
    IERC721(_toLockNftContract).safeTransferFrom(msg.sender, address(this), _toLockNftId);

    _mintOYNft(newLockId);

    /* EMIT */
    emit LogDeposit(newLockId, _toLockNftId, _toLockNftContract);
  }

  function _mintOYNft(uint256 _lockId) internal {
    address _tempRilascioO = getRilascioO();
    address _tempRilascioY = getRilascioY();

    Lock memory _lock = _lockIdToConditions[_lockId];

    require(_lock.lenderAddress == msg.sender, 'your not lender');
    require(
      !IRilascioONFT(_tempRilascioO).exists(_lockId) &&
        !IRilascioYNFT(_tempRilascioY).exists(_lockId),
      'already minted'
    );

    // @notice oNFT, yNFTを、ロックIDに基づいて発行
    IRilascioONFT(_tempRilascioO).mint(msg.sender, _lockId);
    IRilascioYNFT(_tempRilascioY).mint(msg.sender, _lockId);
  }

  // @notice レンタルを削除する（NFTを引き戻す）
  // withdraw でまとめたいかも
  function cancel(uint256 _lockId) public {
    /* INITIAL */
    Lock memory _lock = _lockIdToConditions[_lockId];
    uint256 _tokenId = _lock.toLockNftId;
    address _original = _lock.toLockNftContract;
    address _lender = _lock.lenderAddress;
    address _tempRilascioO = getRilascioO();
    address _tempRilascioY = getRilascioY();

    /* REQUIRE */
    // @notice 実行者がロックしたアドレスであること
    require(msg.sender == _lock.lenderAddress, 'Rilascio: You are not Lender');
    // @notice まだレンタルが開始していない場合しか返却できない
    require(_lock.lockStartDate == 0, "Rilascio: can't cencel after Rent");

    /* CHANGE STATE */
    delete _nftToLockId[_original][_tokenId]; // @notice ストレージの削除
    delete _lockIdToConditions[_lockId]; // @notice ストレージの削除

    /* TRANSACTION */
    // @notice NFTを返却し、oNFT, yNFTをBurnする
    IERC721(_original).safeTransferFrom(address(this), _lender, _tokenId);

    // @notice 不要であるため、burn
    IRilascioONFT(_tempRilascioO).burn(_lockId);
    IRilascioYNFT(_tempRilascioY).burn(_lockId);

    /* EMITE */
    // "sender" canceled "lockId".
    emit LogDelete(msg.sender, _lockId, _tokenId, _original);
  }

  // @notice 借手のアクション
  function rent(uint256 _lockId, uint256 _rentalDurationByDay) public payable {
    // INIT
    _rentCounter.increment();
    uint256 newRentId = _rentCounter.current();

    Lock memory _lock = _lockIdToConditions[_lockId];
    address _wrappedAddress = getRilascioW(_lock.toLockNftContract);
    uint256 _rentalStartTime = block.timestamp;
    uint256 _rentalEndTime = block.timestamp + _dayToSec(_rentalDurationByDay);

    //fee
    //TODO 数量に応じた料金設定を反映させる
    uint256 _rentalFee = _lock.dailyRentalPrice * _rentalDurationByDay;
    uint256 _adminFee = (_rentalFee * _adminRoyalty) / _divider;
    uint256 _paymentAmount = _rentalFee + _adminFee;

    // REQUIRE
    require(_lockId > 0, 'Rilascio: Lock Id is invalid');
    require(_rentalDurationByDay >= _minimumRentalDuration, 'Rilascio: Duration must be 1 day +');
    require(getRentalAvailability(_lockId), 'Rilascio: not available');
    require(msg.value >= _paymentAmount, 'Not enough funds');

    // CHANGE STATE
    _nftToRentId[getRilascioW(_lock.toLockNftContract)][_lock.toLockNftId] = newRentId;
    _rentIdToLockId[newRentId] = _lockId;
    _lockIdToRentIds[_lockId].push(newRentId);

    // 初回のレンタルが開始した時点でロック期間が成立する
    _lockIdToConditions[_lockId].lockStartDate = block.timestamp;

    // Lenderの収益バランスの保存
    _lockIdToAmount[_lockId] += _paymentAmount;

    _rentIdToConditions[newRentId] = Rent({
      rentalStartTime: _rentalStartTime,
      rentalEndTime: _rentalEndTime,
      borrowerAddress: msg.sender
    });

    // TRANSACTION
    // 送られすぎたトークンを返送
    if (msg.value > _paymentAmount) {
      payable(msg.sender).transfer(msg.value - _paymentAmount);
    } else {
      payable(msg.sender).transfer(msg.value);
    }

    //TODO wNFTを1155へ対応
    RilascioW(_wrappedAddress).emitTransfer(address(this), msg.sender, _lock.toLockNftId);

    // EMIT
    // "sender" rent nft, "nft-contract, id"
    emit LogRentalStart(msg.sender, _lockId, _lock.toLockNftId, _wrappedAddress);
  }

  function claimNFT(uint256 _lockId) public {
    /* INITIAL */
    Lock memory _lock = _lockIdToConditions[_lockId];
    address _nftContract = _lock.toLockNftContract;
    uint256 _nftId = _lock.toLockNftId;
    uint256 _lockExpireDate = _lock.lockStartDate + _lock.lockDuration;

    /* REQUIRE */
    require(
      msg.sender == IERC721(getRilascioO()).ownerOf(_lockId),
      'Rilascio: You are not Holder of this oNFT'
    );
    require(block.timestamp > _lockExpireDate, 'Withdraw can execute after Lock ExpireDate');

    /* TRANSACTION */
    IERC721(_nftContract).safeTransferFrom(address(this), msg.sender, _nftId);

    IRilascioONFT(getRilascioO()).burn(_lockId);

    /* EMIT */
    // "sender" withdraw "lockId"
    emit LogWithdraw(msg.sender, _lockId, _nftId, _nftContract);
  }

  // 手数料を引き出す（yNFTのオーナーに送る）
  function claimYield(uint256 _lockId) public {
    /* INITIAL */
    uint256 _lockExpireDate = _lockIdToConditions[_lockId].lockStartDate +
      _lockIdToConditions[_lockId].lockDuration;

    /* REQUIRE */
    require(msg.sender == IERC721(getRilascioY()).ownerOf(_lockId), 'Rilascio: not Holder of yNFT');
    require(block.timestamp > _lockExpireDate, 'Rilascio: can execute after Lock Expire');

    /* CHANGE STATE */
    uint256 _sendAmount = _lockIdToAmount[_lockId];
    _lockIdToAmount[_lockId] = 0;

    /* TRANSACTION */
    payable(msg.sender).transfer(_sendAmount);
    //IERC20(_lockIdToConditions[_lockId].paymentTokenAddress).transfer(_claimer, _sendAmount);
    IRilascioYNFT(getRilascioY()).burn(_lockId);

    /* EMIT */
    // "sender" claim "lockId"'s "amount"
    emit LogClaim(msg.sender, _lockId, _sendAmount);
  }

  // VIEW FUNCTION

  /* ************* */
  /* VIEW FUNCTION */
  /* ************* */

  function getRilascioW(address original_) public view returns (address) {
    return address(_originalToWrap[original_]);
  }

  function getLockConditions(uint256 _lockId) public view returns (Lock memory) {
    return _lockIdToConditions[_lockId];
  }

  function getRentConditions(uint256 _rentId) public view returns (Rent memory) {
    return _rentIdToConditions[_rentId];
  }

  //TODO Conditions
  function getCurrentLocks(address original_, uint256 _tokenId) public view returns (uint256) {
    return _nftToLockId[original_][_tokenId];
  }

  //TODO これ必要ない
  function getCurrentRents(address _wrappedAddress, uint256 _tokenId)
    public
    view
    returns (uint256)
  {
    return _nftToRentId[_wrappedAddress][_tokenId];
  }

  function getPaymentToken(address paymentTokenAddress_) public view returns (bool) {
    return _payableToken[paymentTokenAddress_];
  }

  /*function getTotalLockVolume() public view returns(uint256) {
        return _totalLocks;
    }*/

  /*function getTotalRentVolume() public view returns(uint256) {
        return _totalRents;
    }*/

  function getLockIdToAmount(uint256 _lockId) public view returns (uint256) {
    return _lockIdToAmount[_lockId];
  }

  function getRentIdToLockId(uint256 _rentId) public view returns (uint256) {
    return _rentIdToLockId[_rentId];
  }

  function getLockIdToRentIds(uint256 _lockId) public view returns (uint256[] memory) {
    return _lockIdToRentIds[_lockId];
  }

  function getRentalAvailability(uint256 _lockId) public view returns (bool) {
    address _wrappedAddress = getRilascioW(_lockIdToConditions[_lockId].toLockNftContract);
    uint256 _wrappedId = _lockIdToConditions[_lockId].toLockNftId;
    uint256 _rentId = getCurrentRents(_wrappedAddress, _wrappedId);
    return block.timestamp > getRentConditions(_rentId).rentalEndTime;
  }

  //TODO done
  function getWithdrawAvailability(uint256 _lockId) public view returns (bool) {
    require(IRilascioONFT(getRilascioO()).exists(_lockId), 'Rilascio: oNFT does not exist');
    Lock memory _lock = getLockConditions(_lockId);
    return block.timestamp > (_lock.lockStartDate + _lock.lockDuration);
  }

  //TODO done
  function getClaimAvailability(uint256 _lockId) public view returns (bool) {
    require(IRilascioYNFT(getRilascioY()).exists(_lockId), 'Rilascio: yNFT does not exist');
    Lock memory _lock = getLockConditions(_lockId);
    return block.timestamp > (_lock.lockStartDate + _lock.lockDuration);
  }

  //TODO done
  function getWrappedOwner(uint256 _lockId) public view returns (address) {
    require(IRilascioYNFT(getRilascioY()).exists(_lockId), 'Rilascio: wNFT does not exist');
    return
      RilascioW(getRilascioW(_lockIdToConditions[_lockId].toLockNftContract)).ownerOf(
        _lockIdToConditions[_lockId].toLockNftId
      );
  }

  // INTERNAL FUNCTION

  /* ***************** */
  /* INTERNAL FUNCTION */
  /* ***************** */

  //TODO
  function _concatenateWithName(address original_) internal view returns (string memory) {
    return string(abi.encodePacked('RentaFi-', IERC721Metadata(original_).name()));
  }

  //TODO
  function _concatenateWithSymbol(address original_) internal view returns (string memory) {
    return string(abi.encodePacked('r', IERC721Metadata(original_).symbol()));
  }

  function _dayToSec(uint256 _day) internal pure returns (uint256) {
    return _day * (60 * 60 * 24);
  }

  function _deployWrappedContract(address original_) internal returns (address) {
    return
      address(new RilascioW(_concatenateWithName(original_), _concatenateWithSymbol(original_)));
  }

  function is1155(address original_) public view returns (bool) {
    return IERC165(original_).supportsInterface(type(IERC1155).interfaceId);
  }

  /* ***************** */
  /* SETTING FUNCTION */
  /* ***************** */

  // Wコントラクトのデプロイ
  function deployRilascioW(address original_) public onlyAdmin {
    require(getRilascioW(original_) == address(0), 'Already deployed');
    _originalToWrap[original_] = _deployWrappedContract(original_);
  }

  function setRialscioWManual(address original_, address wrapped_) public onlyAdmin {
    require(original_ != address(0) && wrapped_ != address(0), 'Invalid Contracts pair');
    _originalToWrap[original_] = wrapped_;
  }

  function PaymentTokenWhitelist(address paymentTokenAddress_, bool _bool) public onlyAdmin {
    _payableToken[paymentTokenAddress_] = _bool;
  }

  // FALLBACK FUNCTION

  /* ***************** */
  /* FALLBACK_RECEIVE FUNCTION */
  /* ***************** */

  receive() external payable {
    revert();
  }
}
