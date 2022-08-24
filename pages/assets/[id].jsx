import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useMoralisWeb3Api, useMoralis } from 'react-moralis';
import RilascioFooter from '../../components/atoms/RilascioFooter';
import RilascioHeader from '../../components/atoms/RilascioHeader';
import RilascioBred from '../../components/atoms/RilascioBred';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faAlignLeft, faCoins, faBars } from '@fortawesome/free-solid-svg-icons';
import { ethers } from 'ethers';
import Modal from 'react-modal';
import { faEthereum } from '@fortawesome/free-brands-svg-icons';
import rilascioAbi from '../../models/rilascioAbi.json';
import network from '../../models/network.json';
import RentaFiLayout from '../../components/templates/RentaFiLayout';
import { useMediaQuery } from 'react-responsive';
import RentaFiTabs from '../../components/atoms/RentaFiTabs';
import RentaFiRentalModal from '../../components/atoms/RentaFiRentalModal';
const contractAddress = process.env.NEXT_PUBLIC_RILASCIO_CONTRACT_ADDRESS;
const wethAddress = process.env.NEXT_PUBLIC_WETH_CONTRACT_ADDRESS;
const defaultWethAbi = [
  'function approve(address spender, uint256 amount) external returns (bool)',
];
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
    width: '92vw',
    maxWidth: '500px',
    height: '300px',
    transform: 'translate(-50%, -50%)',
    borderRadius: '12px',
  },
};

const customRentalStyles = {
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
    height: '370px',
    transform: 'translate(-50%, -50%)',
    borderRadius: '12px',
    padding: '0',
  },
};

const RilascioDetail = () => {
  const iconStyle = { color: '#463A3F' };
  const router = useRouter();
  const Web3Api = useMoralisWeb3Api();
  const { isAuthenticated, authenticate, user, isInitialized } = useMoralis();
  const isDesktopOrLaptop = useMediaQuery({ query: '(min-width: 1024px)' });
  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1023px)' });

  const [colName, setColName] = useState();
  const [selNftTokenId, setSelNftTokenId] = useState();
  const [selNftContractAddr, setSelNftContractAddr] = useState();
  const [metadata, setMetadata] = useState();

  const [condition, setCondition] = useState();
  const [lockedDate, setLockedDate] = useState();
  const [rentalDuration, setRentalDuration] = useState(1);

  const [totalFee, setTotalFee] = useState(0);
  const [totalFeeBN, setTotalFeeBN] = useState();
  const [lockId, setLockId] = useState(0);
  const [rentAvail, setRentAvail] = useState();
  const [loginFlg, setLoginFlg] = useState();
  const [chainId, setChainId] = useState();
  const [modalIsOpen, setIsOpen] = useState(false);
  const [animeFlg, setAnimeFlg] = useState(false);
  const [RentalModalIsOpen, setRentalIsOpen] = useState(false);

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

  //Rentボタンを押した際の処理(sp時)
  const openRentalModal = () => {
    setRentalIsOpen(true);
  };

  // Rentモーダルを閉じる処理(sp時)
  const closeRentalModal = () => {
    setRentalIsOpen(false);
  };

  //【初期設定】チェーンの確認
  useEffect(() => {
    if (loginFlg == true && chainId == network.munbai && isInitialized) {
      fetchNft();
    }
  }, [loginFlg, chainId]);

  const fetchNft = async () => {
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

    //set for provider, accounts, signer, contract
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = await provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, rilascioAbi, signer);

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
      setMetadata(metadata);
      // if (metadata) {
      // } else {
      //   const options = {
      //     address: tmpContractAddr,
      //     token_id: tmpTokenId,
      //     flag: 'metadata',
      //   };
      //   const result = await Web3Api.token.reSyncMetadata(options);
      //   console.log(result);
      // }
      // console.log('metadata:' + metadata);

      //fetch data of rental
      const tmpSelectTokenId = await contract.getCurrentLocks(tmpContractAddr, tmpTokenId);
      const tmpSTokenId = tmpSelectTokenId.toString();
      const tmpCondition = await contract.getLockConditions(tmpSTokenId);
      const tmpRentAvail = await contract.getRentalAvailability(tmpSTokenId);

      //UNIXタイムスタンプを日付に変換する
      const dateTime = new Date(tmpCondition[1] * 1000);
      if (tmpCondition[1] != 0) {
        const dateTimeStr = dateTime.toLocaleDateString() + ' ' + dateTime.toLocaleTimeString();
        setLockedDate(dateTimeStr);
      } else {
        setLockedDate('No Lock');
      }

      // console.log(tmpCondition);
      setLockId(tmpSTokenId);
      setCondition(tmpCondition);
      setRentAvail(tmpRentAvail);
    }

    // 0: toLockNftId
    // 1: lockStartDate
    // 2: lockDuration
    // 3: maxRentalDuration
    // 4: dailyRentalPrice
    // 5: toLockNftContract
    // 6: lenderAddress
    // 7: paymentTokenAddress

    // 0: toLockNftId; //ロックするNFTのトークンID
    // 1: lockStartDate; //ロックした日時
    // 2: lockDuration; //NFTのロック期間 => ロックが終了する期間?
    // 3: maxRentalDuration; //レンタルする際の最大貸出期間
    // 4: dailyRentalPrice; //1日あたりのレンタル料
    // 5: amount; //預けるトークン数量
    // 6: toLockNftContract; //ロックするNFTのコントラクトアドレス
    // 7: lenderAddress; //貸主のアドレス
    // 8: paymentTokenAddress; //支払いに使用する通貨
    // 9: bool is1155;
  };

  useEffect(() => {
    if (condition != null) {
      const BN = ethers.BigNumber;
      //少数->整数切り捨て
      const durationInt = 1;
      setRentalDuration(durationInt);

      const durationBN = BN.from(durationInt);
      const dailyRentalPrice = condition.dailyRentalPrice;
      const dailyRentalPriceBN = BN.from(dailyRentalPrice);
      const totalPrice = durationBN.mul(dailyRentalPriceBN);
      const totalPriceWithAdminFee = totalPrice.mul(BN.from(110)).div(BN.from(100));
      setTotalFeeBN(totalPriceWithAdminFee);
      setTotalFee(ethers.utils.formatEther(totalPriceWithAdminFee.toString()));
    }
  }, [condition]);

  const onChangeDuration = (e) => {
    if (e.target.value != 0) {
      const BN = ethers.BigNumber;
      //少数->整数切り捨て
      const durationInt = e.target.value | 0;
      setRentalDuration(durationInt);

      const durationBN = BN.from(durationInt);
      const dailyRentalPrice = condition.dailyRentalPrice;
      const dailyRentalPriceBN = BN.from(dailyRentalPrice);
      const totalPrice = durationBN.mul(dailyRentalPriceBN);
      const totalPriceWithAdminFee = totalPrice.mul(BN.from(110)).div(BN.from(100));

      setTotalFeeBN(totalPriceWithAdminFee);

      setTotalFee(ethers.utils.formatEther(totalPriceWithAdminFee.toString()));
    } else if (e.target.value == 0) {
      setRentalDuration(0);
      setTotalFee(0);
    }
  };

  const onRent = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();
    const wethContract = new ethers.Contract(wethAddress, defaultWethAbi, signer);
    const contract = new ethers.Contract(contractAddress, rilascioAbi, signer);

    // イベントフィルターの設定
    const filter = contract.filters.LogRentalStart();

    // リスナーの設定：フィルター指定のイベント発火時に走る処理
    // .once()を使えば一度きりで終わる
    contract.once(filter, async () => {
      setAnimeFlg(true);
      setIsOpen(true);
    });

    contract.rent(lockId, rentalDuration, {
      value: totalFeeBN,
      gasLimit: '500000',
    });

    setIsOpen(true);
  };

  return (
    <RentaFiLayout
      setLoginFlg={setLoginFlg}
      loginFlg={loginFlg}
      chainId={chainId}
      setChainId={setChainId}
      pageState={'Rent'}
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
            <div className='font-bold text-center pt-4 text-theme-100 text-xl'>Rent Success!🎉</div>
            <div className='pt-6'></div>
          </div>
        ) : (
          <div>
            <div className='font-bold text-center pt-4 text-theme-100 text-xl'>now loading</div>
            <div className='flex justify-center mt-20'>
              <div className='animate-spin h-10 w-10 border-4 border-red-600 rounded-full border-t-transparent'></div>
            </div>
            <div className='pt-6'></div>
          </div>
        )}
      </Modal>
      {isDesktopOrLaptop && (
        <div className='grid grid-cols-2 max-w-screen-lg mx-auto px-9 mt-24 mb-40'>
          <div>
            <div className='px-10'>
              <div className='rounded-2xl shadow-lg bg-white h-[396px] py-4'>
                <div className=' h-[364px] w-[364px] rounded-lg relative mx-4'>
                  {metadata ? (
                    <Image
                      src={'https://ipfs.io/ipfs' + metadata.image.slice(6)}
                      layout='fill'
                      className='rounded-2xl'
                      alt=''
                    />
                  ) : (
                    <Image src={'/images/noimage.png'} width={200} height={200} alt='' />
                  )}
                </div>
              </div>
            </div>
            <div className='border rounded-lg shadow-lg mt-6 mx-10 bg-white'>
              <div className='flex border-b px-3 py-2 font-bold items-center'>
                <FontAwesomeIcon className='pr-2 icon-size' icon={faAlignLeft} style={iconStyle} />
                <div>Detail</div>
              </div>
              <div className='px-3 py-2'>
                <div className='flex justify-between text-sm mt-2'>
                  <div className='text-gray-500'>Locked NFT Contract</div>
                  <a
                    className='a-external'
                    href={
                      condition
                        ? 'https://mumbai.polygonscan.com/address/' + condition[6]
                        : 'unknown'
                    }
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    <div>
                      {condition
                        ? condition[6].slice(0, 5) + '...' + condition[6].slice(-4)
                        : 'unknown'}
                    </div>
                  </a>
                </div>
                <div className='flex justify-between text-sm mt-2'>
                  <div className='text-gray-500'>Locked NFT TokenID</div>
                  <div>{condition ? condition[0].toString() : 'unknown'}</div>
                </div>
                <div className='flex justify-between text-sm mt-2'>
                  <div className='text-gray-500'>Lock Duration (Days)</div>
                  <div>{condition ? (condition[2] / 86400).toString() : 'unknown'}</div>
                </div>
                <div className='flex justify-between text-sm mt-2'>
                  <div className='text-gray-500'>Daily Rent Price</div>
                  <div>
                    {condition ? ethers.utils.formatEther(condition[4].toString()) : 'unknown'}
                    ETH
                  </div>
                </div>
                <div className='flex justify-between text-sm mt-2'>
                  <div className='text-gray-500'>Locked Time</div>
                  <div>{lockedDate ? lockedDate : 'unknown'}</div>
                </div>
                <div className='flex justify-between text-sm mt-2'>
                  <div className='text-gray-500'>Max Duration (Days)</div>
                  <div>{condition ? (condition[3] / 86400).toString() : 'unknown'}</div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <div className='text-blue-600 text-sm text-theme-100'>{colName}</div>
            <div className='text-2xl font-bold text-theme-100'>
              {metadata ? metadata.name : 'unknown'}
            </div>
            <div className='flex justify-start'>
              {rentAvail ? (
                <div className='button-bg border rounded-full text-white px-6 py-[2px] text-xs mt-2'>
                  Available
                </div>
              ) : (
                <div className='bg-white border rounded-full text-gray-400 px-6 py-[2px] text-xs mt-2'>
                  Not Available
                </div>
              )}
            </div>
            <div>
              <div className='mt-6 p-3 border rounded-lg shadow-md bg-white'>
                <div className='flex justify-between'>
                  <div className='text-gray-400'>Max Duration(Days)</div>
                  <div>{condition ? (condition[3] / 86400).toString() : 'unknown'}</div>
                </div>
                <div className='flex justify-between'>
                  <div className='text-gray-400'>Daily Rent Price(ETH)</div>
                  <div className='flex'>
                    <div>
                      {condition ? ethers.utils.formatEther(condition[4].toString()) : 'unknown'}
                    </div>
                  </div>
                </div>
              </div>
              <div className='flex mt-10 font-bold items-center'>
                <FontAwesomeIcon className='pr-2 icon-size' icon={faClock} style={iconStyle} />
                <div className='text-theme-100'>Rent Duration(Days)</div>
              </div>
              <div className='flex justify-center p-2 border rounded-lg shadow-md mt-6 bg-white hover:border-red-300'>
                <div>
                  <input
                    type='num'
                    className='text-center'
                    onChange={onChangeDuration}
                    defaultValue={1}
                  />
                </div>
              </div>
              <div className='flex mt-10 font-bold items-center'>
                <FontAwesomeIcon className='pr-2 icon-size' icon={faCoins} style={iconStyle} />
                <div className='text-theme-100'>Total Fee</div>
              </div>
              <div>
                <div className='flex justify-end items-center'>
                  {/* <FontAwesomeIcon
                    className='pr-4 icon-size-big'
                    icon={faEthereum}
                    style={iconStyle}
                  /> */}
                  <Image src='/images/polygon.svg' width={40} height={40} alt='kabuto-left' />
                  <div className='text-2xl font-bold text-theme-100'>{totalFee}</div>
                </div>
                <div className='flex justify-between text-sm text-gray-500 pt-2'>
                  <div>Service Fee</div>
                  <div>10%</div>
                </div>
              </div>
              <div className='mt-6'></div>
              <div className='flex justify-center py-2 text-white font-bold rounded-full mt-6 button-bg border cursor-pointer'>
                <a onClick={onRent}>Rent</a>
              </div>
            </div>
          </div>
        </div>
      )}
      {isTabletOrMobile && (
        <>
          <Modal
            isOpen={RentalModalIsOpen}
            onRequestClose={closeRentalModal}
            style={customRentalStyles}
          >
            <RentaFiRentalModal
              closeRentModal={closeRentalModal}
              metadata={metadata}
              onChangeDuration={onChangeDuration}
              totalFee={totalFee}
              onRent={onRent}
            />
          </Modal>
          <div className='mx-auto mt-11'>
            <div>
              <div className=''>
                <div className='w-fit m-auto rounded-xl shadow-lg bg-white py-3'>
                  <div className='w-80 h-80 rounded-xl relative mx-3 sm:w-[450px] sm:h-[450px]'>
                    {metadata ? (
                      <Image
                        src={'https://ipfs.io/ipfs' + metadata.image.slice(6)}
                        layout='fill'
                        className='rounded-2xl'
                        alt=''
                      />
                    ) : (
                      <Image src={'/images/noimage.png'} width={200} height={200} alt='' />
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className='mt-6 mx-7'>
              <div className='text-blue-600 text-theme-100 text-sm'>{colName}</div>
              <div className='text-2xl font-bold text-theme-100'>
                {metadata ? metadata.name : 'unknown'}
              </div>
              <div className='flex justify-start'>
                {rentAvail ? (
                  <div className='button-bg border rounded-full text-white px-6 py-[2px] text-xs mt-2'>
                    Available
                  </div>
                ) : (
                  <div className='bg-white border rounded-full text-gray-400 px-6 py-[2px] text-xs mt-2'>
                    Not Available
                  </div>
                )}
              </div>
              <div>
                <div className='mt-12 bg-white flex flex-row'>
                  <div className='basis-1/2 px-3 py-1 border rounded-lg shadow-md'>
                    <div className='text-xs font-bold text-gray-400'>Max Duration</div>
                    <div className='text-2xl font-bold'>
                      {condition ? (condition[3] / 86400).toString() : 'unknown'}
                      <span className='ml-1.5 text-[10px] font-normal'>days</span>
                    </div>
                  </div>
                  <div className='basis-1/2 px-3 py-1 border rounded-lg shadow-md ml-3.5'>
                    <div className='text-xs font-bold text-gray-400'>Daily Price</div>
                    <div className='text-2xl font-bold'>
                      <div>
                        {condition ? ethers.utils.formatEther(condition[4].toString()) : 'unknown'}
                        <span className='ml-1.5 text-[10px] font-normal'>WETH</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='flex justify-center py-2 text-white font-bold rounded-full mt-6 button-bg border cursor-pointer'>
                  <a onClick={openRentalModal}>Rent</a>
                </div>
              </div>
            </div>

            <div className='mt-[73px] mx-7'>
              <RentaFiTabs condition={condition} lockedDate={lockedDate} />
            </div>
          </div>
        </>
      )}
    </RentaFiLayout>
  );
};

export default RilascioDetail;
