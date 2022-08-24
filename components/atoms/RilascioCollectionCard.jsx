import Image from 'next/image';

const RilascioCollectionCard = ({ collectionTitle, collectionAddress, imageUrl }) => {
  // console.log(imageUrl);
  return (
    <div className='p-3 shadow-md rounded-lg bg-white'>
      <div className='w-full h-52 bg-black rounded-xl relative'>
        <Image src={imageUrl} layout='fill' objectFit='cover' className='rounded-lg' />
      </div>
      <div className='pt-3 font-bold'>{collectionTitle}</div>
      <div className='text-sm'>
        By <span className='text-blue-600'>{collectionAddress}</span>
      </div>
    </div>
  );
};

export default RilascioCollectionCard;
