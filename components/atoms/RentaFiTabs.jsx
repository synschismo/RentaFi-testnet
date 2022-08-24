import { useState } from "react";
import { ethers } from 'ethers';
import { useRouter } from 'next/router';

const RentaFiTabs = ({condition, lockedDate, nft}) => {
  const [openTab, setOpenTab] = useState(1);

  const router = useRouter();
  const tmpPath = String(router.asPath.split('/')[1]);

  // Detailのcontentをページによって切り替える関数コンポーネント(page: assets or form or else)
  const TabContentDetail = () => {
    if (tmpPath == "assets") {
      return (
        <div className='px-3 py-2'>
          <div className='flex justify-between text-sm mt-2'>
            <div className='text-gray-500'>Locked NFT Contract</div>
            <a
              className='a-external'
              href={
                condition ? 'https://mumbai.polygonscan.com/address/' + condition[6] : 'unknown'
              }
              target='_blank'
              rel='noopener noreferrer'
            >
              <div>
                {condition
                  ? condition[6].slice(0, 5) + '...' + condition[6].slice(-4)
                  : 'unknown'}
              </div>
            </a>
          </div>
          <div className='flex justify-between text-sm mt-2'>
            <div className='text-gray-500'>Locked NFT TokenID</div>
            <div>{condition ? condition[0].toString() : 'unknown'}</div>
          </div>
          <div className='flex justify-between text-sm mt-2'>
            <div className='text-gray-500'>Lock Duration (Days)</div>
            <div>{condition ? (condition[2] / 86400).toString() : 'unknown'}</div>
          </div>
          <div className='flex justify-between text-sm mt-2'>
            <div className='text-gray-500'>Daily Rent Price</div>
            <div>
              {condition ? ethers.utils.formatEther(condition[4].toString()) : 'unknown'}
              ETH
            </div>
          </div>
          <div className='flex justify-between text-sm mt-2'>
            <div className='text-gray-500'>Locked Time</div>
            <div>{lockedDate ? lockedDate : 'unknown'}</div>
          </div>
          <div className='flex justify-between text-sm mt-2'>
            <div className='text-gray-500'>Max Duration (Days)</div>
            <div>{condition ? (condition[3] / 86400).toString() : 'unknown'}</div>
          </div>
        </div>
      )
    } else if (tmpPath == "form") {
      return (
        <div className='px-3 py-2'>
          <div className='flex justify-between text-sm mt-2'>
            <div className='text-gray-500'>Contract Address</div>
            <a
              className='a-external'
              href={
                nft?.token_address
                  ? 'https://mumbai.polygonscan.com/address/' + nft?.token_address
                  : 'unknown'
              }
              target='_blank'
              rel='noopener noreferrer'
            >
              <div>{nft?.token_address.slice(0, 5) + '...' + nft?.token_address.slice(-4)}</div>
            </a>
          </div>
          <div className='flex justify-between text-sm mt-2'>
            <div className='text-gray-500'>Token ID</div>
            <div>{nft?.token_id}</div>
          </div>
        </div>
      )
    } else {
      return (
        <></>
      )
    }
    
  }

  return (
    <>
      <div className="flex flex-wrap">
        <div className="w-full">
          <ul
            className="flex mb-0 pb-0.5 list-none flex-row border rounded-full"
            role="tablist"
          >
            <li className="mr-2 flex-auto text-center">
              <a
                className={
                  "text-xs font-bold pb-0.5 " +
                  (openTab === 1
                    ? "text-theme-100"
                    : "text-zinc-300")
                }
                onClick={e => {
                  e.preventDefault();
                  setOpenTab(1);
                }}
                role="tablist"
              >
                Detail
              </a>
            </li>
            <li className="mr-2 flex-auto text-center">
              <a
                className={
                  "text-xs font-bold " +
                  (openTab === 2
                    ? "text-theme-100"
                    : "text-zinc-300")
                }
                onClick={e => {
                  e.preventDefault();
                  // setOpenTab(2);
                }}
                role="tablist"
              >
                Attributes
              </a>
            </li>
            <li className="mr-2 flex-auto text-center">
              <a
                className={
                  "text-xs font-bold " +
                  (openTab === 3
                    ? "text-theme-100"
                    : "text-zinc-300")
                }
                onClick={e => {
                  e.preventDefault();
                  // setOpenTab(3);
                }}
                role="tablist"
              >
                Info
              </a>
            </li>
          </ul>
          <div className="w-full mt-4 mb-6">
            <div className="tab-content">
              <div className={openTab === 1 ? "block" : "hidden"}>
                <TabContentDetail />
              </div>  
              <div className={openTab === 2 ? "block" : "hidden"}>
              </div>
              <div className={openTab === 3 ? "block" : "hidden"}>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default RentaFiTabs;