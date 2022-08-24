import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

const RilascioCard = ({ image, c_name, name, price, rentalFlg, avail }) => {
  const iconStyle = { fontSize: 16, color: '#463A3F' };

  return (
    <div className='p-3 bg-white rounded-lg bg-opacity-70 shadow-md'>
      {image ? (
        <Image src={image} alt={`画像`} width='300' height='300' className=' object-cover' />
      ) : (
        <Image
          src={'/images/noimage.png'}
          alt={`画像`}
          width={300}
          height={300}
          className=' object-cover'
        />
      )}
      <div className='text-[9px] md:text-xs mt-1 text-theme-100'>{c_name}</div>
      <div className='text-xs font-bold text-theme-100'>{name}</div>

      {rentalFlg && avail && (
        <>
          <div className='hidden lg:grid grid-cols-5 mt-5'>
            <div className='flex items-center col-span-3 px-1'>
              <FontAwesomeIcon className='px-2 ' style={iconStyle} icon={faBars} />
              <div className='text-xs font-bold text-theme-100'>{price} / day</div>
            </div>
            <div className='flex justify-end col-span-2'>
              <span className='py-1 px-4 font-bold theme-bg rounded-full text-white text-xs button-bg border-2'>
                Rental
              </span>
            </div>
          </div>
          <div className='lg:hidden py-0.5 sm:py-1 px-4 mt-2 font-bold theme-bg rounded-full text-white button-bg border-2 flex justify-center'>
            <Image src='/images/polygon_small.svg' width={15} height={15} alt='kabuto-left' />
            <span className='ml-1.5 text-[10px]'>{price}</span>
            <span className='text-[6px] ml-1.5'>/day</span>
          </div>
        </>
      )}
      {rentalFlg && !avail && (
        <>
          <div className='hidden lg:grid grid-cols-5 mt-5'>
            <div className='flex items-center col-span-3 px-1'>
              <FontAwesomeIcon className='px-2 ' style={iconStyle} icon={faBars} />
              <div className='text-xs font-bold'>{price} / day</div>
            </div>
            <div className='flex justify-end col-span-2'>
              <span className='py-1 px-4 font-bold theme-bg rounded-full text-white text-xs button-re-bg border-2'>
                Rented
              </span>
            </div>
          </div>
          <div className='lg:hidden py-0.5 sm:py-1 px-4 mt-2 font-bold theme-bg rounded-full text-white button-bg border-2 flex justify-center'>
            <Image src='/images/polygon_small.svg' width={15} height={15} alt='kabuto-left' />
            <span className='ml-1.5 text-[10px]'>{price}</span>
            <span className='text-[6px] ml-1.5'>/day</span>
          </div>
        </>
      )}
      {!rentalFlg && (
        <div className='flex justify-end col-span-2 mt-5'>
          <span className='py-1 px-4 font-bold theme-bg rounded-full text-white text-xs button-bg border-2'>
            Deposit
          </span>
        </div>
      )}
    </div>
  );
};

export default RilascioCard;
