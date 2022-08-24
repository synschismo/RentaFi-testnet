// SPDX-License-Identifier: None
pragma solidity ^0.8.9;

interface IRilascio {
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

  function getRilascioW(address original_) external view returns (address);

  function getLockConditions(uint256 _lockId) external view returns (Lock memory);

  function getRentConditions(uint256 _rentId) external view returns (Rent memory);

  function getCurrentLocks(address original_, uint256 _tokenId) external view returns (uint256);

  function getCurrentRents(address _wrappedAddress, uint256 _tokenId)
    external
    view
    returns (uint256);

  function getPaymentToken(address paymentTokenAddress_) external view returns (bool);

  function getTotalLockVolume() external view returns (uint256);

  function getTotalRentVolume() external view returns (uint256);

  function getLockIdToAmount(uint256 _lockId) external view returns (uint256);

  function getRentIdToLockId(uint256 _rentId) external view returns (uint256);

  function getLockIdToRentIds(uint256 _lockId) external view returns (uint256[] memory);

  function getRentalAvailability(uint256 _lockId) external view returns (bool);

  function getWithdrawAvailability(uint256 _lockId) external view returns (bool);

  function getClaimAvailability(uint256 _lockId) external view returns (bool);

  function getWrappedOwner(uint256 _lockId) external view returns (address);
}
