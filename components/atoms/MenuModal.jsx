import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const MenuModal = ({ closeMenuModal }) => {
  const iconStyle = { color: '#26282C' };

  return (
    <div>
      <FontAwesomeIcon
        onClick={closeMenuModal}
        className='absolute top-5 right-5 fa-lg md:hidden'
        icon={faXmark}
        style={iconStyle}
      />
      <ul className='mt-10 text-center'>
        <Link href='/'>
          <a className='font-bold mb-4 block'>Rent</a>
        </Link>
        <Link href='/lend'>
          <a className='font-bold mb-4 block'>Lend</a>
        </Link>
        <Link href='/dashboard'>
          <a className='font-bold mb-4 block'>Dashboard</a>
        </Link>
        <Link href='https://rentafi.org/'>
          <a className='text-gray-500 text-sm mt-2 block'>website</a>
        </Link>
        <Link href='https://docs.rentafi.org/'>
          <a className='text-gray-500 text-sm mt-2 block'>Documents</a>
        </Link>
        <Link href='/'>
          <a className='text-gray-500 text-sm mt-2 block'>Contract</a>
        </Link>
        <Link href='/'>
          <a className='text-gray-500 text-sm mt-2 block'>Medium</a>
        </Link>
        <Link href='https://discord.com/invite/9nmDtTe'>
          <a className='text-gray-500 text-sm mt-2 block'>Discord</a>
        </Link>
        <Link href='https://twitter.com/0xRentaFi'>
          <a className='text-gray-500 text-sm mt-2 block'>Twitter</a>
        </Link>
      </ul>
    </div>
  );
};
export default MenuModal;
