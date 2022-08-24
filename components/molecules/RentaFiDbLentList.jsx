import RilascioDbLent from '../atoms/RilascioDbLent';

const RentaFiDbLentList = ({ lockNumList, loginFlg, lockItemStateList }) => {
  return (
    <div className='px-4 md:px-9 max-w-screen-xl mx-auto mt-20'>
      <div className='text-3xl font-bold text-theme-100'>LEND</div>
      {lockItemStateList && loginFlg ? (
        <div className='bg-white rounded-lg border shadow-md mt-6 overflow-x-scroll'>
          <div className='grid grid-cols-9 border-b p-2 font-bold text-xs text-gray-400 text-center w-[1206px]'>
            <div className='col-span-1'>Lock ID</div>
            <div className='col-span-1'>Locked Item</div>
            <div className='col-span-2'></div>
            <div className='col-span-1'>Lock Expire Date</div>
            <div className='col-span-1'>Total Yields</div>
            <div className='col-span-1'>Withdraw NFT</div>
            <div className='col-span-1'>Claim Yields</div>
            <div className='col-span-1'>Cancel Lend</div>
          </div>
          {lockNumList.map((item, index) => {
            if (lockItemStateList) {
              return (
                <RilascioDbLent
                  key={index}
                  rentNo={lockItemStateList ? lockItemStateList[item].lockNo : ''}
                  imgUrl={
                    lockItemStateList
                      ? 'https://ipfs.io/ipfs' + lockItemStateList[item].image.slice(6)
                      : ''
                  }
                  cName={lockItemStateList ? lockItemStateList[item].cName : ''}
                  name={lockItemStateList ? lockItemStateList[item].name : ''}
                  endDate={lockItemStateList ? lockItemStateList[item].LockExpireData : ''}
                  endTime={lockItemStateList ? lockItemStateList[item].LockExpireTime : ''}
                  yields={lockItemStateList ? lockItemStateList[item].amount : ''}
                  withdrawFlg={lockItemStateList ? lockItemStateList[item].withdrawFlg : ''}
                  claimFlg={lockItemStateList ? lockItemStateList[item].claimFlg : ''}
                  cancelFlg={lockItemStateList ? lockItemStateList[item].cancelFlg : ''}
                />
              );
            }
          })}
        </div>
      ) : (
        <div className='flex justify-center items-center text-gray-400 pt-10'>
          <div className='pr-2 text-theme-100'>now loading...</div>
          <div className='animate-spin h-3 w-3 border-2 loading-bg rounded-full border-t-transparent mt-[2px]'></div>
        </div>
      )}
    </div>
  );
};

export default RentaFiDbLentList;
