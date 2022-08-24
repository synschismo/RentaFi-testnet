import { useState } from 'react';
import { useEffect } from 'react';
import { useMoralis, useNFTBalances, useMoralisWeb3Api } from 'react-moralis';
import network from '../../models/network.json';
import { ethers } from 'ethers';
import RilascioFooter from '../atoms/RilascioFooter';
import RilascioHeader from '../atoms/RilascioHeader';
import RilascioBred from '../atoms/RilascioBred';

const RentaFiLayout = ({ children, loginFlg, setLoginFlg, chainId, setChainId, pageState }) => {
  const { isAuthenticated, isInitialized } = useMoralis();

  //【初期設定】チェーンをRilascio対応チェーン(Rinkeby)に変更する
  const onChainChange = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x13881',
            chainName: 'Polygon Testnet',
            nativeCurrency: {
              name: 'MATIC',
              symbol: 'MATIC',
              decimals: 18,
            },
            rpcUrls: ['https://rpc-mumbai.maticvigil.com'],
          },
        ],
      });
      checkChain();
    } catch (Exeption) {
      console.log('Polygon Network has already been connected.');
    } finally {
    }
  };

  //【初期設定】接続チェーンの確認
  const checkChain = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const tmpInfo = await provider.ready;
    const tmpChainId = tmpInfo.chainId;
    setChainId(tmpChainId);
  };

  //【初期設定】チェーンの確認
  useEffect(() => {
    if (loginFlg == true) {
      checkChain();
    }
  }, [loginFlg]);

  //【初期設定】ログイン確認
  useEffect(() => {
    console.log(isAuthenticated);
    setLoginFlg(isAuthenticated);
  }, [isAuthenticated]);

  return (
    <div>
      <div className='min-h-[90vh]'>
        <RilascioHeader
          stateFlg={pageState}
          chainId={chainId}
          loginFlg={loginFlg}
          onChainChange={onChainChange}
        />
        <RilascioBred title={pageState} />
        <div>{children}</div>
      </div>
      <RilascioFooter />
    </div>
  );
};

export default RentaFiLayout;
