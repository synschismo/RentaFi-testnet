import RilascioItemList from '../components/molecules/RilascioItemList';
import RilascioCollectionList from '../components/molecules/RilascioCollectionList';
import { useMoralis, useMoralisWeb3Api } from 'react-moralis';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import Modal from 'react-modal';
import network from '../models/network.json';
import rilascioAbi from '../models/rilascioAbi.json';
import RentaFiModal from '../components/atoms/RentaFiModal';
import RentaFiLayout from '../components/templates/RentaFiLayout';
import RentaFiPageNation from '../components/molecules/RentaFiPageNation';
import Seo from '../components/atoms/Seo';

const contractAddress = process.env.NEXT_PUBLIC_RILASCIO_CONTRACT_ADDRESS;
const wContractAddress = process.env.NEXT_PUBLIC_WRAP_CONTRACT_ADDRESS;
const sContractAddress = process.env.NEXT_PUBLIC_SAMPLENFT_CONTRACT_ADDRESS;

Modal.setAppElement('#__next');
const customStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    width: '500px',
    height: '490px',
    transform: 'translate(-50%, -50%)',
    borderRadius: '12px',
  },
};

const Home = () => {
  const Web3Api = useMoralisWeb3Api();
  const { authenticate, isInitialized } = useMoralis();
  const [rentPriceList, setRentPriceList] = useState();
  const [availList, setAvailList] = useState();
  const [itemList, setItemList] = useState([]);
  const [loginFlg, setLoginFlg] = useState();
  const [chainId, setChainId] = useState();
  const [modalIsOpen, setIsOpen] = useState(true);
  const [nowPage, setNowPage] = useState(1);
  const [pageTotal, setPageTotal] = useState(0);
  const [itemTotal, setItemTotal] = useState();

  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

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
    // console.log(nextPage);
    const tmpPgae = nextPage;
    setNowPage(tmpPgae);
    fetchPageUpdate();
    setRentPriceList();
  };

  const range = (start, end) => [...Array(end - start + 1)].map((_, i) => start + i);

  //【フィルター】 wrapNFTをフロントから取り除く
  const filterWrap = (item) => {
    if (
      item.token_address.toUpperCase() != wContractAddress.toUpperCase() &&
      item.token_address.toUpperCase() == sContractAddress.toUpperCase()
    ) {
      return true;
    }
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
      pageState={'Rent'}
    >
      <Seo
        pageTitle={'RentaFi'}
        pageDescription={
          'RentaFi is Community Centric & No collateral Required, NFT Rental Protocol / Platform'
        }
        pageImg={'/images/RentaFi.png'}
        pageImgWidth={1280}
        pageImgHeight={960}
      />
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal} style={customStyles}>
        <RentaFiModal authenticate={authenticate} />
      </Modal>

      <div>
        {loginFlg && chainId == network.munbai && (
          <div className='pb-10'>
            <div className='px-9 max-w-screen-xl mx-auto mt-20'>
              <div className='text-2xl lg:text-3xl font-bold text-theme-100'>COLLECTION 📚</div>
            </div>
            <RilascioCollectionList dir={'collections'} />
          </div>
        )}
      </div>
    </RentaFiLayout>
  );
};

export default Home;
