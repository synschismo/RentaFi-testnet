import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEthereum } from '@fortawesome/free-brands-svg-icons';

const RilascioStateBox = ({ totalLockVol, totalLockNum, activeRentNum, activeLentNum }) => {
  const iconStyle = {
    fontSize: 20,
  };
  return (
    <div className='px-9 max-w-screen-xl mx-auto'>
      <div className='grid grid-cols-2 gap-8 mt-16 border rounded-xl border-gray-300 shadow-md bg-white'>
        {/* <div className='p-4'>
          <div className='text-xs'>Total Lock Volume</div>
          <div className='flex items-center'>
            <FontAwesomeIcon style={iconStyle} icon={faEthereum} />
            <div className='text-2xl font-bold pl-1'>{totalLockVol}</div>
          </div>
        </div> */}
        <div className='p-4'>
          <div className='text-xs'>Total Number of Lock</div>
          <div className='flex items-center'>
            <div className='text-2xl font-bold pl-1'>{totalLockNum}</div>
          </div>
        </div>
        <div className='p-4'>
          <div className='text-xs'>Total Number of Rental</div>
          <div className='flex items-center'>
            <div className='text-2xl font-bold pl-1'>{activeRentNum}</div>
          </div>
        </div>
        {/* <div className='p-4'>
          <div className='text-xs'>Active Lends</div>
          <div className='flex items-center'>
            <div className='text-2xl font-bold pl-1'>{activeLentNum}</div>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default RilascioStateBox;
