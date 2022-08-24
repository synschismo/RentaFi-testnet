// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IRilascioAdmin {
  function deployRilascioW(address original_) external;

  function setRialscioWManual(address original_, address wrapped_) external;

  function PaymentTokenWhitelist(address paymentTokenAddress_, bool _bool) external;
}
