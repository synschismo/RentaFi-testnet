import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import React, { useState } from 'react';
import Modal from 'react-modal';
import Link from 'next/link';
import RilascioMetaButton from './RilascioMetaBotton';
import Image from 'next/image';
import { useEffect } from 'react';
import network from '../../models/network.json';
import MenuModal from './MenuModal';

Modal.setAppElement('#__next');
const customStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },

  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    width: '240px',
    height: '360px',
    transform: 'translate(-50%, -50%)',
    borderRadius: '20px',
  },
};

const RilascioHeader = ({ stateFlg, chainId, onChainChange, loginFlg }) => {
  const iconStyle = { color: '#26282C' };
  const [MenuModalIsOpen, setIsOpen] = useState(false);

  const openMenuModal = () => {
    setIsOpen(true);
  };

  const closeMenuModal = () => {
    setIsOpen(false);
  };

  return (
    <div>
      <Modal isOpen={MenuModalIsOpen} onRequestClose={closeMenuModal} style={customStyles}>
        <MenuModal closeMenuModal={closeMenuModal} />
      </Modal>
      <div className='flex justify-between gap-8 h-20 items-center px-9 bg-opacity-50 '>
        {(() => {
          if (stateFlg == 'Rent') {
            return (
              <div className='flex justify-between gap-8'>
                <Link href='/'>
                  <a>
                    <div className='flex justify-center min-w-max'>
                      <Image
                        src={'/images/rentafi_logo.png'}
                        width={25}
                        height={25}
                        alt='rentafi_logo'
                      />
                      <div className='hidden md:inline-block'>
                        <Image
                          src={'/images/rentafi_title.svg'}
                          width={120}
                          height={20}
                          alt='rentafi_logo'
                        />
                      </div>
                    </div>
                  </a>
                </Link>
                <Link href='/'>
                  <a className='font-bold hidden md:inline-block'>Rent</a>
                </Link>
                <Link href='/lend'>
                  <a className='hidden md:inline-block'>Lend</a>
                </Link>
                <Link href='/dashboard'>
                  <a className='hidden md:inline-block'>Dashboard</a>
                </Link>
              </div>
            );
          } else if (stateFlg == 'Lend') {
            return (
              <div className='flex justify-between gap-8'>
                <Link href='/'>
                  <a>
                    <div className='flex justify-center'>
                      <Image
                        src={'/images/rentafi_logo.png'}
                        width={25}
                        height={25}
                        alt='rentafi_logo'
                      />
                      <div className='hidden md:inline-block'>
                        <Image
                          src={'/images/rentafi_title.svg'}
                          width={120}
                          height={20}
                          alt='rentafi_logo'
                        />
                      </div>
                    </div>
                  </a>
                </Link>
                <Link href='/'>
                  <a className='hidden md:inline-block'>Rent</a>
                </Link>
                <Link href='/lend'>
                  <a className='font-bold hidden md:inline-block'>Lend</a>
                </Link>
                <Link href='/dashboard'>
                  <a className='hidden md:inline-block'>Dashboard</a>
                </Link>
              </div>
            );
          } else if (stateFlg == 'Dashboard') {
            return (
              <div className='flex justify-between gap-8'>
                <Link href='/'>
                  <a>
                    <div className='flex justify-center'>
                      <Image
                        src={'/images/rentafi_logo.png'}
                        width={25}
                        height={25}
                        alt='rentafi_logo'
                      />
                      <div className='hidden md:inline-block'>
                        <Image
                          src={'/images/rentafi_title.svg'}
                          width={120}
                          height={20}
                          alt='rentafi_logo'
                        />
                      </div>
                    </div>
                  </a>
                </Link>
                <Link href='/'>
                  <a className='hidden md:inline-block'>Rent</a>
                </Link>
                <Link href='/lend'>
                  <a className='hidden md:inline-block'>Lend</a>
                </Link>
                <Link href='/dashboard'>
                  <a className='font-bold hidden md:inline-block'>Dashboard</a>
                </Link>
              </div>
            );
          }
        })()}
        <div className='flex justify-center items-center'>
          <div className='ml-2'>
            {loginFlg ? (
              <div>
                {chainId == network.munbai ? (
                  <a className='py-2 px-4 border font-bold rounded-full shadow bg-white cursor-pointer'>
                    mumbai
                  </a>
                ) : (
                  <>
                    <a
                      className='py-2 px-4 border font-bold text-sm rounded-full shadow bg-red-600 text-white cursor-pointer hidden lg:block'
                      onClick={onChainChange}
                    >
                      Wrong Network
                    </a>
                    <a
                      className='p-1 border font-bold text-sm rounded-full shadow bg-red-600 text-white cursor-pointer flex items-center lg:hidden'
                      onClick={onChainChange}
                    >
                      <p className='w-6 p-1 bg-white text-red-600 rounded-full text-base leading-none text-center'>!</p>
                      <FontAwesomeIcon icon={faAngleDown} className='mx-2'/>
                    </a>
                  </>
                )}
              </div>
            ) : (
              <div></div>
            )}
          </div>
          <RilascioMetaButton />
          <FontAwesomeIcon onClick={openMenuModal} className='ml-2 fa-lg md:hidden' icon={faBars} style={iconStyle}/>
        </div>
      </div>
    </div>
  );
};

export default RilascioHeader;
