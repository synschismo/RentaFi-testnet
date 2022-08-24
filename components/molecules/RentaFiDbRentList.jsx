import RilascioDbRent from '../atoms/RilascioDbRent';

const RentaFiDbRentList = ({ wrapItem, loginFlg, rentItemStateList }) => {
  return (
    <div className='px-4 md:px-9 max-w-screen-xl mx-auto mt-20'>
      <div className='text-3xl font-bold text-theme-100'>RENT ITEM</div>
      {rentItemStateList && loginFlg ? (
        <div className='bg-white rounded-lg border shadow-md mt-6 overflow-x-scroll'>
          <div className='grid grid-cols-9 items-center border-b p-2 font-bold text-sm text-gray-400 text-center w-[1206px]'>
            <div className='col-span-1'>Rent ID</div>
            <div className='col-span-1'>Item</div>
            <div className='col-span-2'></div>
            <div className='col-span-2'>Wrapped NFT</div>
            <div className='col-span-1'>From</div>
            <div className='col-span-1'>Price</div>
            <div className='col-span-1'>Return Date</div>
          </div>
          {wrapItem.map((item, index) => {
            if (rentItemStateList) {
              if (rentItemStateList[index].rentTimeFlg) {
                return (
                  <RilascioDbRent
                    key={index}
                    lockNo={rentItemStateList ? rentItemStateList[index].rentNo : ''}
                    imgUrl={
                      rentItemStateList
                        ? 'https://ipfs.io/ipfs' + rentItemStateList[index].imgUrl.slice(6)
                        : ''
                    }
                    originCName={rentItemStateList ? rentItemStateList[index].originCName : ''}
                    originName={rentItemStateList ? rentItemStateList[index].originName : ''}
                    wrapCName={rentItemStateList ? rentItemStateList[index].wrapCName : ''}
                    wrapName={rentItemStateList ? rentItemStateList[index].wrapName : ''}
                    from={
                      rentItemStateList
                        ? rentItemStateList[index].from.slice(0, 4) +
                          '...' +
                          rentItemStateList[index].from.slice(-4)
                        : ''
                    }
                    fromAddr={rentItemStateList ? rentItemStateList[index].from : ''}
                    price={rentItemStateList ? rentItemStateList[index].price : ''}
                    returnDate={rentItemStateList ? rentItemStateList[index].rentEndDate : ''}
                    returnTime={rentItemStateList ? rentItemStateList[index].rentEndTime : ''}
                  />
                );
              }
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

export default RentaFiDbRentList;
