import Image from 'next/image';
import rilascioAbi from '../../models/rilascioAbi.json';
import { ethers } from 'ethers';
const contractAddress = process.env.NEXT_PUBLIC_RILASCIO_CONTRACT_ADDRESS;

const RilascioDbLent = ({
  rentNo,
  imgUrl,
  cName,
  name,
  endDate,
  endTime,
  yields,
  withdrawFlg,
  claimFlg,
  cancelFlg,
}) => {
  //元のNFTを引き出す関数
  const onWithdraw = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, rilascioAbi, signer);

    contract.claimNFT(rentNo, { gasLimit: '500000' });
  };

  //手数料を引き出す関数
  const onClaim = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, rilascioAbi, signer);

    contract.claimYield(rentNo, { gasLimit: '500000' });
  };

  //ロックをキャンセルする関数
  const onCancel = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const accounts = provider.send('eth_requestAccounts', []);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, rilascioAbi, signer);

    //関数に必要な引数を取得する
    const tmpCondition = await contract.getLockConditions(rentNo);
    const tmpTokenAddr = tmpCondition[5];
    const tmpTokenId = tmpCondition[0];

    contract.cancel(rentNo, { gasLimit: '500000' });
  };

  return (
    <div className='grid grid-cols-9 py-6 text-center w-[1206px]'>
      <div className='m-auto col-span-1'>#{rentNo}</div>
      <div className='col-span-1 mx-auto'>
        <img src={imgUrl} width={50} height={50} alt='' />
      </div>
      <div className='col-span-2 my-auto mx-auto'>
        <div className='text-xs text-left'>{cName}</div>
        <a
          href={
            name
              ? 'https://testnets.opensea.io/assets/mumbai/' +
                process.env.NEXT_PUBLIC_SAMPLENFT_CONTRACT_ADDRESS +
                '/' +
                name.substring(name.indexOf('#') + 1)
              : 'unknown'
          }
          target='_blank'
          rel='noopener noreferrer'
        >
          <div className='text-pink-500 font-bold text-left'>{name}</div>
        </a>
      </div>
      <div className='m-auto col-span-1'>
        <div>{endDate}</div>
        <div>{endTime}</div>
      </div>
      {/* <div className='m-auto col-span-1 text-blue-600'>{borrowerAddr}</div> */}
      <div className='m-auto col-span-1'>{yields}ETH</div>
      <div className='flex items-center justify-center'>
        {withdrawFlg ? (
          <button
            onClick={onWithdraw}
            className=' rounded-full text-sm font-bold withdraw-button-bg text-white py-2 px-4 col-span-1 mx-2 my-1'
          >
            Withdraw
          </button>
        ) : (
          <div></div>
        )}
      </div>
      <div className='flex items-center justify-center'>
        {claimFlg ? (
          <button
            onClick={onClaim}
            className='rounded-full text-sm font-bold claim-button-bg text-white py-2 px-4 col-span-1 mx-2 my-1'
          >
            Claim
          </button>
        ) : (
          <div></div>
        )}
      </div>
      <div className='flex items-center justify-center'>
        {cancelFlg ? (
          <button
            onClick={onCancel}
            className='rounded-full text-sm font-bold cancel-button-bg text-white py-2 px-4 col-span-1 mx-2 my-1'
          >
            Cancel
          </button>
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
};

export default RilascioDbLent;
