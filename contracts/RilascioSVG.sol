// SPDX-License-Identifier: None
pragma solidity ^0.8.9;

import './RilascioAdmin.sol';

library RilascioSVG {
  function getYieldSVG(
    uint256 _lockId,
    uint256 _toLockNftId,
    uint256 _amount,
    uint256 _lockStartDate,
    uint256 _lockDuration,
    address _paymentTokenAddress,
    address _toLockNftContract
  ) public view returns (bytes memory) {
    string memory svg = string(
      abi.encodePacked(
        abi.encodePacked(
          "<svg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' fill='#fff' viewBox='0 0 486 300'><rect width='485.4' height='300' fill='#fff' rx='12'/><rect width='485.4' height='300' fill='url(#a)' rx='12'/><text fill='#5A6480' font-family='Poppins' font-size='16' font-weight='400'><tspan x='28' y='40'>Yield NFT</tspan><tspan x='420' y='170'>",
          'MATIC',
          "</tspan></text><text fill='#5A6480' font-family='Inter' font-size='24' font-weight='900'><tspan x='28' y='135'>Claimable Funds</tspan></text><text fill='#5A6480' font-family='Inter' font-size='16' font-weight='900' text-anchor='end'><tspan x='415' y='170'>",
          Strings.toString(_amount),
          "</tspan></text><text fill='#98AABE' font-family='Inter' font-size='10' font-weight='900'><tspan x='28' y='270'>"
        ),
        abi.encodePacked(
          IERC721Metadata(_toLockNftContract).name(),
          "</tspan></text><text fill='#98AABE' font-family='Inter' font-size='10' font-weight='400'><tspan x='28' y='283'>",
          Strings.toHexString(uint256(uint160(_toLockNftContract)), 20),
          "</tspan></text><text fill='#98AABE' font-family='Inter' font-size='10' font-weight='400' text-anchor='end'><tspan x='463' y='270'>#",
          Strings.toString(_toLockNftId),
          "</tspan></text><defs><linearGradient id='a' x1='0' x2='379' y1='96' y2='353' gradientUnits='userSpaceOnUse'><stop stop-color='#7DBCFF' stop-opacity='.1'/><stop offset='1' stop-color='#FF7DC0' stop-opacity='.1'/></linearGradient></defs></svg>"
        )
      )
    );

    bytes memory json = abi.encodePacked(
      '{"name": "yieldNFT #',
      Strings.toString(_lockId),
      ' - Rilascio", "description": "YieldNFT represents Rental Fee deposited by Borrower in a Rilascio Escrow. The owner of this NFT can claim rental fee after lock-time expired by burn this.", "image": "data:image/svg+xml;base64,',
      Base64.encode(bytes(svg)),
      '", "attributes":[{"display_type": "date", "trait_type": "StartDate", "value":"',
      Strings.toString(_lockStartDate),
      '"},{"display_type": "date", "trait_type":"ExpireDate", "value":"',
      Strings.toString(_lockStartDate + _lockDuration),
      '"},{"trait_type":"FeeAmount", "value":"',
      Strings.toString(_amount),
      '"}]}'
    );

    return json;
  }

  function getOwnershipSVG(
    uint256 _lockId,
    uint256 _untilTime,
    uint256 _toLockNftId,
    uint256 _lockStartDate,
    uint256 _lockDuration,
    address _toLockNftContract
  ) public view returns (bytes memory) {
    string memory svg = string(
      abi.encodePacked(
        abi.encodePacked(
          "<svg xmlns='http://www.w3.org/2000/svg' fill='#fff' viewBox='0 0 486 300'><rect width='485.4' height='300' fill='#fff' rx='12'/><rect width='485.4' height='300' fill='url(#a)' rx='12'/><text fill='#5A6480' font-family='Poppins' font-size='16' font-weight='400'><tspan x='28' y='40'>Ownership NFT</tspan><tspan x='250' y='270'>Until Unlock</tspan><tspan x='430' y='270'>Day</tspan></text><text fill='#5A6480' font-family='Inter' font-size='32' font-weight='900'><tspan x='28' y='150'>",
          IERC721Metadata(_toLockNftContract).name(),
          "</tspan></text><text fill='#5A6480' font-family='Inter' font-size='36' font-weight='900' text-anchor='end'><tspan x='425' y='270'>",
          Strings.toString(_untilTime)
        ),
        abi.encodePacked(
          "</tspan></text><text fill='#98AABE' font-family='Inter' font-size='10' font-weight='400'><tspan x='28' y='170'>",
          Strings.toHexString(uint256(uint160(_toLockNftContract)), 20),
          "</tspan></text><text fill='#98AABE' font-family='Inter' font-size='10' font-weight='400'><tspan x='28' y='185'>",
          Strings.toString(_toLockNftId),
          "</tspan></text><defs><linearGradient id='a' x1='0' x2='379' y1='96' y2='353' gradientUnits='userSpaceOnUse'><stop stop-color='#7DBCFF' stop-opacity='.1'/><stop offset='1' stop-color='#FF7DC0' stop-opacity='.1'/></linearGradient></defs></svg>"
        )
      )
    );

    bytes memory json = abi.encodePacked(
      '{"name": "OwnershipNFT #',
      Strings.toString(_lockId),
      ' - Rilascio", "description": "OwnershipNFT represents Original NFT locked in a Rilascio Escrow. The owner of this NFT can claim original NFT after lock-time expired by burn this.", "image": "data:image/svg+xml;base64,',
      Base64.encode(bytes(svg)),
      '", "attributes":[{"display_type": "date", "trait_type": "StartDate", "value":"',
      Strings.toString(_lockStartDate),
      '"},{"display_type": "date", "trait_type":"ExpireDate", "value":"',
      Strings.toString(_lockStartDate + _lockDuration),
      '"}]}'
    );

    return json;
  }
}
