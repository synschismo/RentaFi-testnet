import { useMoralis } from 'react-moralis';

const RilascioMetaButton = () => {
  const { isAuthenticated, authenticate, user, logout } = useMoralis();
  const backgroundStyle = { background: '#ED4B9E' };
  // console.log(isAuthenticated);

  if (!isAuthenticated) {
    return (
      <div className='ml-2 hover:cursor-pointer'>
        <a
          className='py-2 px-4 font-bold border rounded-full text-sm shadow bg-white cursor-pointer'
          onClick={authenticate}
        >
          connect wallet
        </a>
      </div>
    );
  } else {
    const address = user.get('ethAddress');
    const omitAddress = address.slice(0, 5) + '...' + address.slice(-4);
    return (
      <div className='ml-2'>
        <a
          className='py-2 px-4 font-bold  rounded-full text-sm shadow text-white cursor-pointer'
          style={backgroundStyle}
          onClick={logout}
        >
          {omitAddress}
        </a>
      </div>
    );
  }
};

export default RilascioMetaButton;
