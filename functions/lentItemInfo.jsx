import { ethers } from 'ethers';
import rilascioAbi from '../contracts/abi/rilascioAbi';
import { useNFTBalances, useMoralisWeb3Api, useMoralis } from 'react-moralis';

//各コントラクトアドレス
const contractAddress = process.env.NEXT_PUBLIC_RILASCIO_CONTRACT_ADDRESS;
const yContractAddress = process.env.NEXT_PUBLIC_YIELD_CONTRACT_ADDRESS;
const oContractAddress = process.env.NEXT_PUBLIC_OWNER_CONTRACT_ADDRESS;
const wContractAddress = process.env.NEXT_PUBLIC_WRAP_CONTRACT_ADDRESS;

export const getDBLentItem = async (tmpYW) => {
  const Web3Api = useMoralisWeb3Api();
  
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
  // setLockNumList(tmpLockNoList);

  //Lendの状態をまとめる配列を準備
  let tmpLockItemStateList = [];
  for (let step = 0; step < tmpLockNoList.length; step++) {
    console.log(step);
    const tmpLockStateDetail = {
      lockNo: '',
      cName: '',
      name: '',
      image: '',
      lender: '',
      amount: '',
      LockExpireData: '',
      withdrawFlg: false,
      claimFlg: false,
      cancelFlg: false,
    };

    const tmpLockNo = tmpLockNoList[step];
    const tmpCondition = await contract.getLockConditions(tmpLockNo);
    const tmpLockAmountWei = await contract.getLockIdToAmount(tmpLockNo);
    const tmpLockAmountEth = ethers.utils.formatEther(tmpLockAmountWei);
    // console.log(tmpCondition);

    const tmpSelTokenId = tmpCondition[0].toString();
    const tmpSelTokenAddr = tmpCondition[5].toString();

    const optionsSel = await {
      address: tmpSelTokenAddr,
      token_id: tmpSelTokenId,
      chain: 'rinkeby',
    };

    //get NFT metadata(Moralis API)
    const data = await Web3Api.token.getTokenIdMetadata(optionsSel);
    const metadata = await JSON.parse(data?.metadata);

    //レンタル終了の時間を確認
    const time = new Date(tmpCondition[1] * 1000);
    const dataTime = time.toLocaleDateString();

    tmpLockStateDetail.lockNo = tmpLockNo;
    tmpLockStateDetail.image = metadata?.image;
    tmpLockStateDetail.cName = data.name;
    if (dataTime != '1970/1/1') {
      tmpLockStateDetail.LockExpireData = dataTime;
      tmpLockStateDetail.cancelFlg = true;
    } else {
      tmpLockStateDetail.LockExpireData = 'no rental';
      tmpLockStateDetail.cancelFlg = true;
    }
    tmpLockStateDetail.amount = tmpLockAmountEth;
    tmpLockStateDetail.name = metadata?.name;
    tmpLockStateDetail.lender = 'no data';
    tmpCondition[6].slice(0, 4) + '...' + tmpCondition[6].slice(-4);

    const tmpLockState = {
      [tmpLockNo]: tmpLockStateDetail,
    };

    //Lendの状態を追加していく
    tmpLockItemStateList = Object.assign({ ...tmpLockItemStateList }, tmpLockState);
  }

  //ownershipNFTとyieldNFTを調べる
  for (let step = 0; step < tmpYW.length; step++) {
    const tokenId = tmpYW[step].token_id;

    //withdraw関数を叩けるか確認
    if (tmpYW[step].token_address.toUpperCase() == oContractAddress.toUpperCase()) {
      tmpLockItemStateList[tokenId].withdrawFlg = true;
      // console.log("wContract:"+"true");
    } else if (tmpYW[step].token_address.toUpperCase() == oContractAddress.toUpperCase()) {
      tmpLockItemStateList[tokenId].withdrawFlg = false;
      // console.log("wContract:"+"false");
    }

    //yield関数を叩けるかの確認
    if (tmpYW[step].token_address.toUpperCase() == yContractAddress.toUpperCase()) {
      tmpLockItemStateList[tokenId].claimFlg = true;
      // console.log("yContract:"+"true");
    } else if (tmpYW[step].token_address.toUpperCase() == yContractAddress.toUpperCase()) {
      tmpLockItemStateList[tokenId].claimFlg = false;
      // console.log("yContract:"+"false");
    }
  }
  // console.log(tmpLockItemStateList)
  return tmpLockItemStateList;

  // 0: toLockNftId
  // 1: lockStartDate
  // 2: lockDuration
  // 3: maxRentalDuration
  // 4: dailyRentalPrice
  // 5: toLockNftContract
  // 6: lenderAddress
  // 7: paymentTokenAddress
};
