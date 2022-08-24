import Link from 'next/link';
import RilascioCard from '../atoms/RilascioCard';
import { useMoralisWeb3Api } from 'react-moralis';

const ItemList = ({ data, rentPriceData, rentalFlg, dir, rentAvailList }) => {
  // console.log(rentAvailList);
  if (rentalFlg == false) {
    return (
      <div className='grid grid-cols-2 gap-8 px-9 pb-10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 max-w-screen-xl mx-auto mt-12'>
        {data &&
          data.map((nft, index) => {
            const json = JSON.parse(nft.metadata);
            // console.log(json.image.slice(6));
            return (
              <Link
                href={{
                  pathname: '/' + dir + '/[id]',
                  query: {
                    chain: 'mumbai',
                    contractAddress: nft.token_address,
                    tokenId: nft.token_id,
                    collectionName: nft.name,
                  },
                }}
                as={'/' + dir + '/' + nft.token_address + '.' + nft.token_id + '.' + nft.name}
                key={nft.token_address + nft.token_id}
              >
                <a>
                  <RilascioCard
                    image={
                      json?.image
                        ? 'https://ipfs.io/ipfs' + json.image.slice(6)
                        : '/images/noimage.png'
                    }
                    c_name={nft.name}
                    name={json?.name ? json.name : 'unknown'}
                    price={rentalFlg && rentPriceData ? rentPriceData[index] : ''}
                    avail={rentalFlg && rentAvailList ? rentAvailList[index] : ''}
                    rentalFlg={rentalFlg}
                  />
                </a>
              </Link>
            );
          })}
      </div>
    );
  }
  return (
    <div>
      {!rentPriceData && (
        <div className='flex justify-center items-center text-gray-400 pt-10'>
          <div className='pr-2 text-theme-100'>now loading...</div>
          <div className='animate-spin h-3 w-3 border-2 loading-bg rounded-full border-t-transparent mt-[2px]'></div>
        </div>
      )}
      <div className='grid grid-cols-2 gap-4 md:gap-9 px-4 md:px-9 pb-10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 max-w-screen-xl mx-auto mt-6 lg:mt-12'>
        {rentPriceData &&
          data.map((nft, index) => {
            const json = JSON.parse(nft.metadata);
            // console.log(json.image.slice(6));
            return (
              <Link
                href={{
                  pathname: '/' + dir + '/[id]',
                  query: {
                    chain: 'mumbai',
                    contractAddress: nft.token_address,
                    tokenId: nft.token_id,
                    collectionName: nft.name,
                  },
                }}
                as={'/' + dir + '/' + nft.token_address + '.' + nft.token_id + '.' + nft.name}
                key={nft.token_address + nft.token_id}
              >
                <a>
                  <RilascioCard
                    image={
                      json?.image
                        ? 'https://ipfs.io/ipfs' + json.image.slice(6)
                        : '/images/noimage.png'
                    }
                    c_name={nft.name}
                    name={json?.name ? json.name : 'unknown'}
                    price={rentalFlg && rentPriceData ? rentPriceData[index] : ''}
                    avail={rentalFlg && rentAvailList ? rentAvailList[index] : ''}
                    rentalFlg={rentalFlg}
                  />
                </a>
              </Link>
            );
          })}
      </div>
    </div>
  );
};

export default ItemList;
