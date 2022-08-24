import rilascioAbi from '../models/rilascioAbi.json';
import { ethers } from 'ethers';
import { useEffect, useState } from 'react';
import { useMoralisWeb3Api, useMoralis } from 'react-moralis';
import network from '../models/network.json';
import RentaFiLayout from '../components/templates/RentaFiLayout';
import RentaFiDbRentList from '../components/molecules/RentaFiDbRentList';
import RentaFiDbLentList from '../components/molecules/RentaFiDbLentList';

const contractAddress = process.env.NEXT_PUBLIC_RILASCIO_CONTRACT_ADDRESS;
const yContractAddress = process.env.NEXT_PUBLIC_YIELD_CONTRACT_ADDRESS;
const oContractAddress = process.env.NEXT_PUBLIC_OWNER_CONTRACT_ADDRESS;
const wContractAddress = process.env.NEXT_PUBLIC_WRAP_CONTRACT_ADDRESS;
const wvraContractAddress = process.env.NEXT_PUBLIC_WRAPVRA_CONTRACT_ADDRESS;

const Dashboard = () => {
  const { user, isInitialized } = useMoralis();
  const Web3Api = useMoralisWeb3Api();

  const [lendItem, setLendItem] = useState();
  const [lockItemStateList, setLockItemStateList] = useState();
  const [rentItemStateList, setRentItemStateList] = useState();
  const [lockNumList, setLockNumList] = useState();
  const [wrapItem, setWrapItem] = useState();
  const [loginFlg, setLoginFlg] = useState();
  const [chainId, setChainId] = useState();
  const [myItemList, setMyItemList] = useState();

  //【Rent情報】
  const getDBRentItem = async (item) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, rilascioAbi, signer);

    //情報群を入れる配列を準備
    const tmpRentalItemStateList = [];
    for (let step = 0; step < item.length; step++) {
      const tmpRentalStateDetail = {
        rentNo: '',
        imgUrl: '',
        originCName: '',
        originName: '',
        wrapCName: '',
        wrapName: '',
        from: '',
        price: '',
        rentTimeFlg: false,
        rentStartTime: '',
        rentEndDate: '',
      };

      const optionsSel = await {
        address: item[step].token_address,
        token_id: item[step].token_id,
        chain: 'mumbai',
      };
      const data = await Web3Api.token.getTokenIdMetadata(optionsSel);
      const metadata = await JSON.parse(data?.metadata);
      const tmpRentId = await contract.getCurrentRents(
        item[step].token_address,
        item[step].token_id,
      );

      const tmpRentCondition = await contract.getRentConditions(tmpRentId);
      const tmpLockId = await contract.getRentIdToLockId(tmpRentId);
      const tmpLockCondition = await contract.getLockConditions(tmpLockId);
      const tmpOriginContract = tmpLockCondition.toLockNftContract;
      const tmpOriginTokenId = tmpLockCondition.toLockNftId;
      const tmpDailyPrice = tmpLockCondition.dailyRentalPrice.toString();
      const tmpDailyPriceEther = tmpDailyPrice;

      const originOptions = await {
        address: tmpOriginContract,
        token_id: tmpOriginTokenId.toString(),
        chain: 'mumbai',
      };
      const originData = await Web3Api.token.getTokenIdMetadata(originOptions);
      const originMetadata = await JSON.parse(originData?.metadata);

      //レンタル終了の時間を確認
      const nowTime = new Date();
      const startTime = new Date(tmpRentCondition.rentalStartTime * 1000);
      const endDate = new Date(tmpRentCondition.rentalEndTime * 1000);
      const rentStartTime = startTime.toLocaleDateString();
      const rentEndDate = endDate.toLocaleDateString();
      const rentEndTime = endDate.toLocaleTimeString();
      const tmpTotalPrice = ((endDate - startTime) / 86400000) * tmpDailyPriceEther;

      //【Rent情報： rentNo】
      tmpRentalStateDetail.rentNo = tmpRentId.toString();

      //【Rent情報： imgUrl】
      tmpRentalStateDetail.imgUrl = originMetadata.image;

      //【Rent情報： originCName】
      tmpRentalStateDetail.originCName = originData.name;

      //【Rent情報： originName】
      tmpRentalStateDetail.originName = originMetadata.name;

      //【Rent情報： wrapCName】
      tmpRentalStateDetail.wrapCName = item[step].name;

      //【Rent情報： wrapName】
      tmpRentalStateDetail.wrapName = metadata.name;

      //【Rent情報： from】
      tmpRentalStateDetail.from = tmpLockCondition.lenderAddress;

      //【Rent情報： price】
      tmpRentalStateDetail.price = ethers.utils.formatEther(String(tmpTotalPrice));

      //【Rent情報： rentTimeFlg】
      if (nowTime.getTime() < endDate.getTime()) {
        tmpRentalStateDetail.rentTimeFlg = true;
      }

      //【Rent情報： rentStartTime】
      tmpRentalStateDetail.rentStartTime = rentStartTime;

      //【Rent情報： rentEndDate】
      tmpRentalStateDetail.rentEndDate = rentEndDate;
      tmpRentalStateDetail.rentEndTime = rentEndTime;

      // console.log(tmpRentalStateDetail);

      tmpRentalItemStateList.push(tmpRentalStateDetail);
    }
    setRentItemStateList(tmpRentalItemStateList);
  };

  //【Lent情報】
  const getDBLentItem = async (tmpYW) => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, rilascioAbi, signer);

    //LockNoの配列を作る(tmpYWはyieldsかwithdrawNFTのこと)
    let tmpLockNoListCov = [];
    for (let step = 0; step < tmpYW.length; step++) {
      tmpLockNoListCov.push(tmpYW[step].token_id);
    }
    //被りある数字を消していく(例[1,3,4,3] => [1,3,4])
    const tmpLockNoList = Array.from(new Set(tmpLockNoListCov));
    setLockNumList(tmpLockNoList);

    //Lendの状態をまとめる配列を準備
    let tmpLockItemStateList = [];
    for (let step = 0; step < tmpLockNoList.length; step++) {
      const tmpLockStateDetail = {
        lockNo: '',
        cName: '',
        name: '',
        image: '',
        amount: '',
        LockExpireData: '',
        LockExpireTime: '',
        lockFlg: false,
        withdrawFlg: false,
        claimFlg: false,
        cancelFlg: false,
      };

      const tmpLockNo = tmpLockNoList[step];
      const tmpCondition = await contract.getLockConditions(tmpLockNo);
      const tmpLockDuration = tmpCondition.lockDuration;
      const tmpLockStartDate = tmpCondition.lockStartDate;
      const tmpLockEndDate =
        Number(tmpLockDuration.toString()) + Number(tmpLockStartDate.toString());
      const tmpLockEndDateTime = new Date(tmpLockEndDate * 1000);

      const tmpSelTokenId = tmpCondition.toLockNftId.toString();
      const tmpSelTokenAddr = tmpCondition.toLockNftContract.toString();

      const optionsSel = await {
        address: tmpSelTokenAddr,
        token_id: tmpSelTokenId,
        chain: 'mumbai',
      };

      const data = await Web3Api.token.getTokenIdMetadata(optionsSel);
      const metadata = await JSON.parse(data?.metadata);

      //【Lent情報: Amount】
      const tmpLockAmountWei = await contract.getLockIdToAmount(tmpLockNo);
      const tmpLockAmountEth = ethers.utils.formatEther(tmpLockAmountWei);
      tmpLockStateDetail.amount = tmpLockAmountEth;

      //【Lent情報: lockFlg】
      //const time = new Date(tmpCondition[1] * 1000 + 86400000);
      const time = new Date(tmpCondition[1] * 1000);
      const time2 = new Date();
      if (time2.getTime() > tmpLockEndDateTime.getTime()) {
        tmpLockStateDetail.lockFlg = true;
      }

      //【Lent情報: cancelFlg, LockExpireData, LockExpireTime】
      console.log(tmpLockStartDate.toString() == '0');
      if (tmpLockStartDate.toString() != '0') {
        tmpLockStateDetail.LockExpireData = tmpLockEndDateTime.toLocaleDateString();
        tmpLockStateDetail.LockExpireTime = tmpLockEndDateTime.toLocaleTimeString();
        tmpLockStateDetail.cancelFlg = false;
      } else {
        tmpLockStateDetail.LockExpireData = 'no rental';
        tmpLockStateDetail.cancelFlg = true;
      }

      //【Lent情報: lockNo】
      tmpLockStateDetail.lockNo = tmpLockNo;

      //【Lent情報: image】
      tmpLockStateDetail.image = metadata?.image;

      //【Lent情報: cName】
      tmpLockStateDetail.cName = data.name;

      //【Lent情報: name】
      tmpLockStateDetail.name = metadata?.name;

      const tmpLockState = {
        [tmpLockNo]: tmpLockStateDetail,
      };

      tmpLockItemStateList = Object.assign({ ...tmpLockItemStateList }, tmpLockState);
    }

    //【Lent情報: withdrawFlg、claimFlg】
    for (let step = 0; step < tmpYW.length; step++) {
      const tokenId = tmpYW[step].token_id;

      //【Lent情報: withdrawFlg】
      if (
        tmpLockItemStateList[tokenId].lockFlg == true &&
        tmpLockItemStateList[tokenId].cancelFlg == false
      ) {
        if (tmpYW[step].token_address.toUpperCase() == oContractAddress.toUpperCase()) {
          tmpLockItemStateList[tokenId].withdrawFlg = true;
        } else if (tmpYW[step].token_address.toUpperCase() == oContractAddress.toUpperCase()) {
          tmpLockItemStateList[tokenId].withdrawFlg = false;
        }

        //【Lent情報: claimFlg】
        if (tmpYW[step].token_address.toUpperCase() == yContractAddress.toUpperCase()) {
          tmpLockItemStateList[tokenId].claimFlg = true;
        } else if (tmpYW[step].token_address.toUpperCase() == yContractAddress.toUpperCase()) {
          tmpLockItemStateList[tokenId].claimFlg = false;
        }
      }
    }
    setLockItemStateList(tmpLockItemStateList);

    // 0: toLockNftId; //ロックするNFTのトークンID
    // 1: lockStartDate; //ロックした日時
    // 2: lockDuration; //NFTのロック期間 => ロックが終了する期間?
    // 3: maxRentalDuration; //レンタルする際の最大貸出期間
    // 4: dailyRentalPrice; //1日あたりのレンタル料
    // 5: amount; //預けるトークン数量
    // 6: toLockNftContract; //ロックするNFTのコントラクトアドレス
    // 7: lenderAddress; //貸主のアドレス
    // 8: paymentTokenAddress; //支払いに使用する通貨
    // 9: is1155;
  };

  //filter function for ownershipNFT, yieldNFT
  const filterYW = (item) => {
    if (
      item.token_address.toUpperCase() == oContractAddress.toUpperCase() ||
      item.token_address.toUpperCase() == yContractAddress.toUpperCase()
    ) {
      return true;
    }
  };

  //filter function for wrapNFT
  const filterWrap = (item) => {
    if (item.token_address.toUpperCase() == wContractAddress.toUpperCase()) {
      return true;
    } else if(item.token_address.toUpperCase() == wvraContractAddress.toUpperCase()) {
      return true;
    }
  };

  //RentItemとLendItemをフィルターにかける
  useEffect(() => {
    if (myItemList) {
      let tmpYW = myItemList.filter(filterYW);
      let tmpWrap = myItemList.filter(filterWrap);
      getDBLentItem(tmpYW);
      getDBRentItem(tmpWrap);
      setWrapItem(tmpWrap);
      setLendItem(tmpYW);
    }
  }, [myItemList]);

  const fetchNFT = async () => {
    const options = {
      chain: 'mumbai',
      address: user?.get('ethAddress'),
    };
    const tmpCtrItemList = await Web3Api.account.getNFTs(options);
    setMyItemList(tmpCtrItemList.result);
  };

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
      pageState={'Dashboard'}
    >
      <RentaFiDbRentList
        wrapItem={wrapItem}
        loginFlg={loginFlg}
        rentItemStateList={rentItemStateList}
      />

      <RentaFiDbLentList
        lockNumList={lockNumList}
        loginFlg={loginFlg}
        lockItemStateList={lockItemStateList}
      />
    </RentaFiLayout>
  );
};

export default Dashboard;
