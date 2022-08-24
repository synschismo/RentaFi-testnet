import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const RentaFiLendModal = ({closeLendModal, metadata, doChangeLockDuration, doChangeMaxDuration, doChangeDailyPrice, onDeposit}) => {
  const iconStyle = { color: '#26282C' };

  return (
    <div>
      <FontAwesomeIcon
        onClick={closeLendModal}
        className='absolute top-5 right-5 fa-lg md:hidden'
        icon={faXmark}
        style={iconStyle}
      />
      <div className='p-5 text-base font-bold text-theme-100'>
        {metadata ? metadata.name : 'unknown'}
      </div>

      <div className='border-t px-5 pt-5'>
        <div className='text-base font-bold'>
          <p className='text-theme-100'>Max Rental Duration (Days)</p>
        </div>
        <div className='pt-2'>
          <input
            type='text'
            className='w-full h-10 bg-white border rounded-lg shadow-md text-center hover:border-red-300'
            onChange={doChangeMaxDuration}
          />
        </div>
      </div>
      <div className='px-5 mt-5'>
        <div className='text-base font-bold'>
          <p className='text-theme-100'>Daily Rental Price</p>
        </div>
        <div className='pt-2'>
          <input
            type='text'
            className='w-full h-10 bg-white border rounded-lg shadow-md text-center hover:border-red-300'
            onChange={doChangeDailyPrice}
          />
        </div>
      </div>
      <div className='px-5 mt-5'>
        <div className='text-base font-bold'>
          <p className='text-theme-100'>Lock Duration (Days)</p>
        </div>
        <div className='pt-2'>
          <input
            type='text'
            className='w-full h-10 bg-white border rounded-lg shadow-md text-center hover:border-red-300'
            onChange={doChangeLockDuration}
          />
        </div>
      </div>
      <div className='px-5 mt-10'>
        <div className='flex justify-center py-2 text-white font-bold rounded-full button-bg border cursor-pointer'>
          <a onClick={() => { closeLendModal(); onDeposit(); }}>Lend</a>
        </div>
      </div>
      <div className='mt-2.5'>
        <p className='text-[10px] text-gray-400 text-center'>⚠ ︎Our smart contracts are not audited yet. To use at own risk.</p>
      </div>
    </div> 
  )
}

export default RentaFiLendModal;
