const RentaFiPagenation = (rentPriceList, pageTotal, doPageNation, nowPage) => {
  console.log(pageTotal);
  return (
    <div>
      {rentPriceList && (
        <div className='flex justify-center gap-10'>
          {pageTotal != [] &&
            pageTotal.map((number, index) => (
              <a key={index} className='cursor-pointer' onClick={() => doPageNation(number)}>
                {index + 1 == nowPage ? (
                  <div className='py-2 px-3 bg-theme-100 rounded-lg shadow-md font-bold text-white'>
                    {number}
                  </div>
                ) : (
                  <div className='py-2 px-3 bg-white rounded-lg shadow-md font-bold text-theme-100'>
                    {number}
                  </div>
                )}
              </a>
            ))}
        </div>
      )}
    </div>
  );
};

export default RentaFiPagenation;
