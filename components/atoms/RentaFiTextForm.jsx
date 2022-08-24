const RentaFiTextForm = ({ children, doChangeMaxDuration, title }) => {
  return (
    <div>
      <div className='flex mt-10 font-bold items-center'>
        {children}
        <div className='text-theme-100'>{title}</div>
      </div>
      <div className='pt-2'>
        <input
          type='text'
          className='w-full h-10 bg-white border rounded-lg shadow-md text-center hover:border-red-300'
          onChange={doChangeMaxDuration}
        />
      </div>
    </div>
  );
};

export default RentaFiTextForm;
