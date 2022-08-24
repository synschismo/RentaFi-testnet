import RilascioFooter from '../components/atoms/RilascioFooter';
import RilascioItemList from '../components/molecules/RilascioItemList';
import RilascioHeader from '../components/atoms/RilascioHeader';
import RilascioBred from '../components/atoms/RilascioBred';
import { useNFTBalances, useMoralis, useMoralisWeb3Api } from 'react-moralis';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import network from '../models/network.json';
import RentaFiLayout from '../components/templates/RentaFiLayout';
const wContractAddress = process.env.NEXT_PUBLIC_WRAP_CONTRACT_ADDRESS;
const yContractAddress = process.env.NEXT_PUBLIC_YIELD_CONTRACT_ADDRESS;
const oContractAddress = process.env.NEXT_PUBLIC_OWNER_CONTRACT_ADDRESS;
const sContractAddress = process.env.NEXT_PUBLIC_SAMPLENFT_CONTRACT_ADDRESS;
const vraContractAddress = process.env.NEXT_PUBLIC_VRA_CONTRACT_ADDRESS;

const Lent = () => {
  const Web3Api = useMoralisWeb3Api();
  const { isAuthenticated, user, isInitialized } = useMoralis();
  const [myItemList, setMyItemList] = useState();
  const [loginFlg, setLoginFlg] = useState();
  const [chainId, setChainId] = useState();

  //【フィルター】 function for wrapNFTをフロントから取り除く
  const filterWrap = (item) => {
    if (item.token_address.toUpperCase() == sContractAddress.toUpperCase()) {
      return true;
    } else if(item.token_address.toUpperCase() == vraContractAddress.toUpperCase()) {
      return true;
    }
  };

  const fetchNFT = async () => {
    const options = {
      chain: 'mumbai',
      address: user?.get('ethAddress'),
    };
    const tmpCtrItemList = await Web3Api.account.getNFTs(options);
    const tmpItem = await tmpCtrItemList.result.filter(filterWrap);
    setMyItemList(tmpItem);
  };

  //【初期設定】チェーンの確認
  useEffect(() => {
    if (loginFlg == true && chainId == network.munbai && isInitialized) {
      fetchNFT();
    }
  }, [loginFlg, chainId]);

  return (
    <RentaFiLayout
      setLoginFlg={setLoginFlg}
      loginFlg={loginFlg}
      chainId={chainId}
      setChainId={setChainId}
      pageState={'Lend'}
    >
      <div className='px-9 max-w-screen-xl mx-auto mt-20'>
        <div className='text-3xl font-bold'>Your NFT 🗄</div>
      </div>
      <RilascioItemList data={myItemList} rentalFlg={false} dir='form' />
    </RentaFiLayout>
  );
};

export default Lent;
