import RilascioCollectionCard from '../atoms/RilascioCollectionCard';
import collectionList from '../../models/collection.json';
import Link from 'next/link';
import Image from 'next/image';

const RilacioCollectionList = ({ dir }) => {
  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 lg:mt-12 max-w-screen-xl mx-auto px-4 md:px-9'>
      {/* {collectionList &&
        collectionList.map((collection, index) => {
          return (
            <Link
              href={{
                pathname: '/' + dir + '/[id]',
                query: {
                  cName: collection.cName,
                  cAddr: collection.cAddr,
                  cIndex: index,
                },
              }}
              as={'/' + dir + '/' + collection.cName + '.' + collection.cAddr + '.' + index}
              key={index}
            >
              <a>
                <RilascioCollectionCard
                  collectionTitle={collection.cName}
                  collectionAddress={
                    collection
                      ? collection.cAddr.slice(0, 5) + '...' + collection.cAddr.slice(-4)
                      : 'unknown'
                  }
                  imageUrl={'/images/collection/' + collection.cDire + '/' + collection.cSamne}
                />
              </a>
            </Link>
          );
        })} */}
      <Link
        href={{
          pathname: '/' + dir + '/[id]',
          query: {
            cName: collectionList[0].cName,
            cAddr: collectionList[0].cAddr,
            cIndex: 0,
          },
        }}
        as={'/' + dir + '/' + collectionList[0].cName + '.' + collectionList[0].cAddr + '.' + '0'}
        key={'1'}
      >
        <a>
          <RilascioCollectionCard
            collectionTitle={collectionList[0].cName}
            collectionAddress={
              collectionList[0]
                ? collectionList[0].cAddr.slice(0, 5) + '...' + collectionList[0].cAddr.slice(-4)
                : 'unknown'
            }
            imageUrl={
              '/images/collection/' + collectionList[0].cDire + '/' + collectionList[0].cSamne
            }
          />
        </a>
      </Link>
    </div>
  );
};

export default RilacioCollectionList;
