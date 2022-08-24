import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useMoralis, useMoralisWeb3Api } from 'react-moralis';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAlignLeft, faCoins, faClock } from '@fortawesome/free-solid-svg-icons';
import { ethers } from 'ethers';
import Modal from 'react-modal';
import rilascioAbi from '../../models/rilascioAbi.json';
const contractAddress = process.env.NEXT_PUBLIC_RILASCIO_CONTRACT_ADDRESS;
const wethAddress = process.env.NEXT_PUBLIC_WETH_CONTRACT_ADDRESS;
const defaultAbi = ['function approve(address to, uint256 tokenId) public virtual override'];
import network from '../../models/network.json';
import RentaFiLayout from '../../components/templates/RentaFiLayout';
import RentaFiTextForm from '../../components/atoms/RentaFiTextForm';
import { useMediaQuery } from 'react-responsive'
import RentaFiTabs from '../../components/atoms/RentaFiTabs';
import RentaFiLendModal from '../../components/atoms/RentaFiLendMidal';

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
    height: '300px',
    transform: 'translate(-50%, -50%)',
    borderRadius: '12px',
  },
};

const customLendStyles = {
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
    width: '344px',
    height: '480px',
    transform: 'translate(-50%, -50%)',
    borderRadius: '12px',
    padding: '0'
  },
};

const RilascioForm = () => {
  const iconStyle = { color: '#463A3F' };
  const router = useRouter();
  const [nft, setNft] = useState();
  const [metadata, setMetadata] = useState();
  const [colName, setColName] = useState();
  const Web3Api = useMoralisWeb3Api();
  const [maxDuration, setMaxDuration] = useState();
  const [dailyPrice, setDailyPrice] = useState();
  const [lockDuration, setLockDuration] = useState();
  const { isAuthenticated, user, isInitialized } = useMoralis();
  const [selNftTokenId, setSelNftTokenId] = useState();
  const [selNftContractAddr, setSelNftContractAddr] = useState();
  const [flg, setFlg] = useState(false);
  const [loginFlg, setLoginFlg] = useState();
  const [chainId, setChainId] = useState();
  const [modalIsOpen, setIsOpen] = useState(false);
  const [animeFlg, setAnimeFlg] = useState(false);
  const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1024px)' })
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1023px)' })
  const [LendModalIsOpen, setLendIsOpen] = useState(false);

  // モーダルを開く処理
  const openModal = () => {
    setIsOpen(true);
  };

  const afterOpenModal = () => {
    // モーダルが開いた後の処理
  };

  // モーダルを閉じる処理
  const closeModal = () => {
    setIsOpen(false);
  };

  // Lendボタンを押した際の処理(sp時)
  const openLendModal = () => {
    setLendIsOpen(true);
  };

  // Lendモーダルを閉じる処理(sp時)
  const closeLendModal = () => {
    setLendIsOpen(false);
  };

  const fetchNFT = async () => {
    //fetch for contract_address, token_id, collection_name
    const tmpPath = router.asPath.split('/')[2].split('.');
    const tmpContractAddr = router.query.contractAddress
      ? router.query.contractAddress
      : tmpPath[0];
    const tmpTokenId = router.query.tokenId ? router.query.tokenId : Number(tmpPath[1]);
    const tmpSetColName = router.query.collectionName ? router.query.collectionName : tmpPath[2];
    const tmpColName = tmpSetColName.replaceAll('%20', ' ');

    setColName(tmpColName);
    setSelNftContractAddr(tmpContractAddr);
    setSelNftTokenId(tmpTokenId);

    //error handling if not tmpContractAddr
    if (tmpContractAddr != undefined && tmpContractAddr != '[id]') {
      const options = await {
        address: tmpContractAddr,
        token_id: tmpTokenId,
        chain: 'mumbai',
      };

      //get NFT metadata(Moralis API)
      const data = await Web3Api.token.getTokenIdMetadata(options);
      const metadata = await JSON.parse(data.metadata);
      setNft(data);
      setMetadata(metadata);
      console.log('data:' + data);
      console.log('metadata:' + metadata);
    }
  };

  //【初期設定】チェーンの確認
  useEffect(() => {
    if (loginFlg == true && chainId == network.munbai && isInitialized) {
      fetchNFT();
    }
  }, [loginFlg, chainId]);

  const onDeposit = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, rilascioAbi, signer);
    const nftContract = new ethers.Contract(nft.token_address, defaultAbi, signer);
    console.log('tokenId:' + nft.token_id);
    console.log('lockDuration:' + lockDuration);
    console.log('maxDuration:' + maxDuration);
    console.log('dailyPrice:' + dailyPrice);
    console.log('tokenAddress:' + nft.token_address);
    console.log('wethaddress:' + wethAddress);
    nftContract.approve(contractAddress, nft.token_id, { gasLimit: '500000' });

    // イベントフィルターの設定
    const filter = contract.filters.LogDeposit();

    // リスナーの設定：フィルター指定のイベント発火時に走る処理
    // .once()を使えば一度きりで終わる
    contract.once(filter, async () => {
      setAnimeFlg(true);
      setIsOpen(true);
    });

    contract.deposit(
      nft.token_id,
      lockDuration,
      maxDuration,
      ethers.utils.parseEther(dailyPrice),
      nft.token_address,
      {
        gasLimit: '3000000',
      },
    );

    setIsOpen(true);
  };

  const doChangeMaxDuration = (e) => {
    setMaxDuration(e.target.value);
  };

  const doChangeDailyPrice = (e) => {
    setDailyPrice(e.target.value);
  };

  const doChangeLockDuration = (e) => {
    setLockDuration(e.target.value);
  };

  return (
    <RentaFiLayout
      setLoginFlg={setLoginFlg}
      loginFlg={loginFlg}
      chainId={chainId}
      setChainId={setChainId}
      pageState={'Lend'}
    >
      <Modal
        // isOpenがtrueならモダールが起動する
        isOpen={modalIsOpen}
        // モーダルが開いた後の処理を定義
        onAfterOpen={afterOpenModal}
        // モーダルを閉じる処理を定義
        onRequestClose={closeModal}
        // スタイリングを定義
        style={customStyles}
      >
        {animeFlg ? (
          <div>
            <div className='font-bold text-center pt-4 text-theme-100 text-xl'>
              Deposit Success!🎉
            </div>
            <div className='pt-6'></div>
          </div>
        ) : (
          <div>
            <div className='font-bold text-center pt-4 text-theme-100 text-xl'>now loading</div>
            <div className='flex justify-center mt-20'>
              <div className='animate-spin h-10 w-10 border-4 loading-bg rounded-full'></div>
            </div>
            <div className='pt-6'></div>
          </div>
        )}
      </Modal>
      {isDesktopOrLaptop && 
        <div className='grid grid-cols-2 max-w-screen-lg mx-auto px-9 mt-24 mb-40'>
          <div>
            <div className='px-10'>
              <div className='rounded-2xl shadow-lg bg-white h-[396px] py-4'>
                <div className=' h-[364px] w-[364px] rounded-lg relative mx-4'>
                  {metadata ? (
                    <img
                      src={'https://ipfs.io/ipfs' + metadata.image.slice(6)}
                      layout='fill'
                      className='rounded-2xl'
                      alt=''
                    />
                  ) : (
                    <img src={'/images/noimage.png'} width={200} height={200} alt='' />
                  )}
                </div>
              </div>
              <div></div>
            </div>
            <div className='border rounded-lg shadow-lg mt-6 mx-10 bg-white'>
              <div className='flex border-b px-3 py-2 font-bold items-center'>
                <FontAwesomeIcon className='pr-2 icon-size' icon={faAlignLeft} />
                <div>Detail</div>
              </div>
              <div className='px-3 py-2'>
                <div className='flex justify-between text-sm mt-2'>
                  <div className='text-gray-500'>Contract Address</div>
                  <a
                    className='a-external'
                    href={
                      nft?.token_address
                        ? 'https://mumbai.polygonscan.com/address/' + nft?.token_address
                        : 'unknown'
                    }
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <div>{nft?.token_address.slice(0, 5) + '...' + nft?.token_address.slice(-4)}</div>
                  </a>
                </div>
                <div className='flex justify-between text-sm mt-2'>
                  <div className='text-gray-500'>Token ID</div>
                  <div>{nft?.token_id}</div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className='text-blue-600 text-sm text-theme-100'>{colName}</div>
            <div className='text-2xl font-bold text-theme-100'>{metadata?.name}</div>
            <div>
            <RentaFiTextForm
              doChangeMaxDuration={doChangeLockDuration}
              title={'Lock Duration (Days)'}
            >
              <FontAwesomeIcon className='px-2 icon-size' icon={faClock} style={iconStyle} />
            </RentaFiTextForm>

            <RentaFiTextForm
              doChangeMaxDuration={doChangeMaxDuration}
              title={'Rental Consecutive Duration (Days)'}
            >
              <FontAwesomeIcon className='px-2 icon-size' icon={faClock} style={iconStyle} />
            </RentaFiTextForm>

            <RentaFiTextForm doChangeMaxDuration={doChangeDailyPrice} title={'Daily Rental Price'}>
              <FontAwesomeIcon className='px-2 icon-size' icon={faCoins} style={iconStyle} />
            </RentaFiTextForm>

            <div className='flex justify-center py-2 text-white font-bold rounded-full mt-12 button-bg border cursor-pointer'>
              <a onClick={onDeposit}>Lend</a>
            </div>
          </div>
          </div>
        </div>
      }
      {isTabletOrMobile && 
        <>
          <Modal isOpen={LendModalIsOpen} onRequestClose={closeLendModal} style={customLendStyles}>
            <RentaFiLendModal
              closeLendModal={closeLendModal}
              metadata={metadata}
              doChangeLockDuration={doChangeLockDuration}
              doChangeMaxDuration={doChangeMaxDuration}
              doChangeDailyPrice={doChangeDailyPrice}
              onDeposit={onDeposit}
            />
          </Modal>
          <div className='mx-auto mt-11'>
            <div>
              <div className=''>
                <div className='w-fit m-auto rounded-xl shadow-lg bg-white py-3'>
                  <div className='w-80 h-80 rounded-xl relative mx-3 sm:w-[450px] sm:h-[450px]'>
                    {metadata ? (
                      <img
                        src={'https://ipfs.io/ipfs' + metadata.image.slice(6)}
                        layout='fill'
                        className='rounded-2xl'
                        alt=''
                      />
                    ) : (
                      <img src={'/images/noimage.png'} width={200} height={200} alt='' />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className='mt-6 mx-7'>
              <div className='text-blue-600 text-sm text-theme-100'>{colName}</div>
              <div className='text-2xl font-bold text-theme-100'>{metadata?.name}</div>
              <div className='flex justify-center py-2 text-white font-bold rounded-full mt-10 button-bg border cursor-pointer'>
                <a onClick={openLendModal}>Lend</a>
              </div>
            </div>
            <div className='mt-[73px] mx-7'>
            <RentaFiTabs nft={nft} />
            </div>
          </div>
        </>
      }
    </RentaFiLayout>
  );
};

export default RilascioForm;
