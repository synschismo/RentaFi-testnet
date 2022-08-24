const RentaFiModal = ({ authenticate }) => {
  return (
    <div>
      <div className='font-bold text-center pt-4 text-theme-100 text-xl'>
        Welcome to RentaFi !! 🎉
      </div>
      <div className='pt-6'>
        <div className='text-left ml-4'>① Connect your wallet</div>
        <div
          className='button-bg mx-4 rounded-full px-2 py-3 cursor-pointer mt-2 text-center text-white font-bold'
          onClick={authenticate}
        >
          Connect Wallet
        </div>
        <div className='text-left ml-4 mt-4'>② If you have not any MATIC, get it from Faucet</div>
        <div className='button-bg mx-4 rounded-full px-2 py-3 cursor-pointer mt-2 text-center text-white font-bold'>
          <a href='https://faucet.polygon.technology/' target='_blank' rel='noopener noreferrer'>
            Matic Faucet
          </a>
        </div>
        <div className='text-left ml-4 mt-4'>③ And Mint our Trial NFT</div>
        <div className='button-bg mx-4 rounded-full px-2 py-3 cursor-pointer mt-2 text-center text-white font-bold'>
          <a href='https://faucet.rentafi.org/' target='_blank' rel='noopener noreferrer'>
            Trial NFT Faucet
          </a>
        </div>
        <div className='text-left ml-4 mt-4'>④ more information are documents</div>
        <div className='button-bg mx-4 rounded-full px-2 py-3 cursor-pointer mt-2 text-center text-white font-bold'>
          <a href='https://docs.rentafi.org/' target='_blank' rel='noopener noreferrer'>
            RentaFi Documents
          </a>
        </div>
      </div>
    </div>
  );
};

export default RentaFiModal;
