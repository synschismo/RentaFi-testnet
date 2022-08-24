import { useRouter } from 'next/router';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { useMoralis, useMoralisWeb3Api } from 'react-moralis';
import RilascioItemList from '../../components/molecules/RilascioItemList';
import RentaFiLayout from '../../components/templates/RentaFiLayout';
import RentaFiPageNation from '../../components/molecules/RentaFiPageNation';
import network from '../../models/network.json';
import rilascioAbi from '../../models/rilascioAbi.json';
const contractAddress = process.env.NEXT_PUBLIC_RILASCIO_CONTRACT_ADDRESS;
import collectionList from '../../models/collection.json';

const Collection = () => {
  const Web3Api = useMoralisWeb3Api();
  const { isInitialized } = useMoralis();
  const router = useRouter();

  //【ページ情報】
  const [nowPage, setNowPage] = useState(1);
  const [pageTotal, setPageTotal] = useState(0);
  const [itemTotal, setItemTotal] = useState();

  //【NFT一覧情報】
  const [rentPriceList, setRentPriceList] = useState();
  const [availList, setAvailList] = useState();
  const [itemList, setItemList] = useState([]);

  //【コレクション情報】
  const [cNmae, setCName] = useState();
  const [cAddr, setCAddr] = useState('');
  const [cIndex, setCIndex] = useState();

  //【ログイン確認】
  const [loginFlg, setLoginFlg] = useState();
  const [chainId, setChainId] = useState();

  //【LockNFTのレンタル価格取得関数】
  const fetchRentPriceList = async (item) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, rilascioAbi, signer);

    let tmpPriceList = [];
    let tmpAvailList = [];
    if (item) {
      for (let step = 0; step < item.length; step++) {
        const tokenAddr = item[step].token_address;
        const tokenId = item[step].token_id;

        const tmpSelectTokenId = await contract.getCurrentLocks(tokenAddr, tokenId);
        const tmpTokenId = tmpSelectTokenId.toString();
        const tmpCondition = await contract.getLockConditions(tmpTokenId);
        const tmpPrice = ethers.utils.formatEther(tmpCondition.dailyRentalPrice.toString());
        const tmpRentAvail = await contract.getRentalAvailability(tmpTokenId);
        tmpPriceList.push(tmpPrice);
        tmpAvailList.push(tmpRentAvail);
      }
      setRentPriceList(tmpPriceList);
      setAvailList(tmpAvailList);
    }
  };

  //コントラクトにロックしてあるNFTを取得
  const fetchNFT = async () => {
    const tmpPath = router.asPath.split('/')[2].split('.');
    const tmpSetColName = router.query.cName ? router.query.cName : tmpPath[0];
    const tmpColName = tmpSetColName.replaceAll('%20', ' ');
    const tmpColAddr = router.query.cAddr ? router.query.cAddr : tmpPath[1];
    const tmpColIndex = router.query.cIndex ? router.query.cIndex : tmpPath[2];
    setCIndex(tmpColIndex);
    setCName(tmpColName);
    setCAddr(tmpColAddr);

    //【フィルター】 wrapNFTをフロントから取り除く
    const filterWrap = (item) => {
      if (item.token_address.toUpperCase() == tmpColAddr.toUpperCase()) {
        return true;
      }
    };

    const options = {
      chain: 'mumbai',
      address: contractAddress,
    };
    const tmpCtrItemList = await Web3Api.account.getNFTs(options);
    const tmpItem = await tmpCtrItemList.result.filter(filterWrap);

    const tmpPageTotal = Math.floor(tmpItem.length / 8);
    const tmpPageTotalRemain = Math.floor(tmpItem.length % 8);
    if (tmpPageTotalRemain == 0) {
      const tmpRange = range(1, tmpPageTotal);
      setPageTotal(tmpRange);
    } else {
      tmpPageTotal += 1;
      const tmpRange = range(1, tmpPageTotal);
      setPageTotal(tmpRange);
    }

    setItemTotal(tmpItem);
    const tmpItemRes = tmpItem.slice((nowPage - 1) * 8, (nowPage - 1) * 8 + 8);
    setItemList(tmpItemRes);
    fetchRentPriceList(tmpItemRes);
    fetchPageUpdate();
  };

  const fetchPageUpdate = () => {
    if (itemTotal != undefined) {
      const tmpItemRes = itemTotal.slice((nowPage - 1) * 8, (nowPage - 1) * 8 + 8);
      setItemList(tmpItemRes);
      fetchRentPriceList(tmpItemRes);
    }
  };

  const doPageNation = (nextPage) => {
    const tmpPgae = nextPage;
    setNowPage(tmpPgae);
    fetchPageUpdate();
    setRentPriceList();
  };

  const range = (start, end) => [...Array(end - start + 1)].map((_, i) => start + i);

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
      pageState={'Rent'}
    >
      <div>
        <div className='px-9 max-w-screen-xl mx-auto'>
          <div className='bg-white h-64 rounded-lg mt-10  relative'>
            <Image
              src={
                '/images/collection/' +
                collectionList[cIndex]?.cDire +
                '/' +
                collectionList[cIndex]?.cTop
              }
              layout='fill'
              objectFit='cover'
              className='rounded-lg'
            />
          </div>
        </div>
        <div className='px-9 max-w-screen-xl mx-auto mt-16'>
          <div className='text-4xl font-bold text-center text-theme-100'>{cNmae}</div>
        </div>
        <div className='px-9 max-w-screen-xl mx-auto mt-2'>
          <div className='text-center text-theme-100'>
            By{' '}
            <span className='text-blue-600'>
              {cAddr ? cAddr.slice(0, 5) + '...' + cAddr.slice(-4) : 'unknown'}
            </span>
          </div>
        </div>
        <div className='px-9 max-w-screen-xl mx-auto mt-20'>
          <div className='text-3xl font-bold text-theme-100'>ITEMS</div>
        </div>
        <div className='pb-10'>
          <RilascioItemList
            data={itemList}
            rentPriceData={rentPriceList}
            rentAvailList={availList}
            rentalFlg={true}
            dir='assets'
          />
          <RentaFiPageNation
            rentPriceList={rentPriceList}
            pageTotal={pageTotal}
            nowPage={nowPage}
            doPageNation={doPageNation}
          />
        </div>
      </div>
    </RentaFiLayout>
  );
};

export default Collection;
