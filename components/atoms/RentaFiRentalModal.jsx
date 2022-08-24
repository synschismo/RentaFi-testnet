import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { faEthereum } from '@fortawesome/free-brands-svg-icons';
import Image from 'next/image';

const RentaFiRentalModal = ({ closeRentModal, metadata, onChangeDuration, totalFee, onRent }) => {
  const iconStyle = { color: '#26282C' };

  return (
    <div>
      <FontAwesomeIcon
        onClick={closeRentModal}
        className='absolute top-5 right-5 fa-lg md:hidden'
        icon={faXmark}
        style={iconStyle}
      />
      <div className='p-5 text-base font-bold text-theme-100'>
        {metadata ? metadata.name : 'unknown'}
      </div>
      <div className='border-t px-5 pt-5'>
        <p className='text-base font-bold'>Rent Duration (Days)</p>
        <p className='text-[10px] text-gray-400'>Rent Duration <span className='text-theme-100'>5~30days</span></p>
        <div className='flex justify-center p-2 border rounded-lg shadow-md mt-2.5 bg-white hover:border-red-300'>
          <input
            type='num'
            className='text-center'
            onChange={onChangeDuration}
            defaultValue={1}
            />
        </div>
      </div>
      <div className='px-5 mt-5'>
        <p>Total Fee</p>
        <div className='flex items-baseline'>
          <Image src='/images/polygon_small.svg' width={20} height={20} alt='kabuto-left' />
          <div className='ml-2 text-3xl font-bold text-theme-100'>{totalFee}</div>
          <p className='text-[10px] text-gray-400 ml-4'>Protocol Fee 10% included</p>
        </div>
      </div>
      <div className='px-5 mt-7'>
        <div className='flex justify-center py-2 text-white font-bold rounded-full button-bg border cursor-pointer'>
          <a onClick={() => { closeRentModal();  onRent();}}>Rent</a>
        </div>
      </div>
      <div className='mt-2.5'>
        <p className='text-[10px] text-gray-400 text-center'>⚠ ︎Our smart contracts are not audited yet. To use at own risk.</p>
      </div>
    </div>
  )
}

export default RentaFiRentalModal;
