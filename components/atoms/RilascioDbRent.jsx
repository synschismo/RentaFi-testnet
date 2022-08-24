import Image from 'next/image';

const RilascioDbRent = ({
  lockNo,
  imgUrl,
  originCName,
  originName,
  wrapCName,
  wrapName,
  from,
  fromAddr,
  price,
  returnDate,
  returnTime,
}) => {
  return (
    <div className='grid grid-cols-9 py-6 text-center w-[1206px]'>
      <div className='m-auto col-span-1'>#{lockNo}</div>
      <div className='col-span-1 mx-auto'>
        <img src={imgUrl} width={50} height={50} alt='' />
      </div>
      <div className='col-span-2 my-auto mx-auto'>
        <div className='text-xs text-left'>{originCName}</div>
        <a
          href={
            wrapName
              ? 'https://testnets.opensea.io/assets/mumbai/' +
                process.env.NEXT_PUBLIC_SAMPLENFT_CONTRACT_ADDRESS +
                '/' +
                originName.substring(originName.indexOf('#') + 1)
              : 'unknown'
          }
          target='_blank'
          rel='noopener noreferrer'
        >
          <div className='text-pink-500 font-bold text-left'>{originName}</div>
        </a>
      </div>
      <div className='col-span-2 my-auto mx-auto'>
        <div className='text-xs text-left'>{wrapCName}</div>
        <a
          href={
            wrapName
              ? 'https://testnets.opensea.io/assets/mumbai/' +
                process.env.NEXT_PUBLIC_WRAP_CONTRACT_ADDRESS +
                '/' +
                wrapName.substring(wrapName.indexOf('#') + 1)
              : 'unknown'
          }
          target='_blank'
          rel='noopener noreferrer'
        >
          <div className='text-pink-500 font-bold text-left'>{wrapName}</div>
        </a>
      </div>
      <a
        className='m-auto col-span-1 text-pink-500'
        href={fromAddr ? 'https://mumbai.polygonscan.com/address/' + fromAddr : 'unknown'}
        target='_blank'
        rel='noopener noreferrer'
      >
        <div>{from}</div>
      </a>
      <div className='m-auto col-span-1'>{price}ETH</div>
      <div className='m-auto col-span-1'>
        <div>{returnDate}</div>
        <div>{returnTime}</div>
      </div>
    </div>
  );
};

export default RilascioDbRent;
