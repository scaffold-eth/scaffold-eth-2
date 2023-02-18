const SkeletonP = ({ className = "" }: { className?: string }) => {
  return <p className={`my-0 mt-2 w-24 h-3 bg-gray-500 animate-pulse rounded-md ${className}`}></p>;
};

const SkeletonDiv = ({ className = "" }: { className?: string }) => {
  return <div className={`h-6 w-6 bg-gray-400 animate-pulse rounded-md ${className}`}></div>;
};

const SkeletonInputButton = () => {
  return (
    <div className="flex flex-col">
      <SkeletonDiv className="!w-full !rounded-2xl !h-7 mb-2" />
      <SkeletonDiv className="self-end !w-20 !h-6 !rounded-xl" />
    </div>
  );
};

const SkeletonContractUI = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 py-12 px-10 lg:gap-12 w-full max-w-7xl my-0">
      <div className="col-span-5 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="col-span-1 flex flex-col">
          <div className="bg-base-100 border-base-300 border shadow-md shadow-secondary rounded-3xl px-8 mb-6 space-y-1 py-4">
            <div className="flex">
              <div className="flex flex-col gap-1">
                <div className="flex space-x-2 items-center">
                  <SkeletonDiv className="!rounded-full" />
                  <SkeletonP className="w-24" />
                </div>
                <div className="flex flex-col">
                  <SkeletonP className="w-28" />
                  <SkeletonP className="w-28" />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-base-300 rounded-3xl px-8 py-4 shadow-lg shadow-base-300 space-y-3">
            {[1, 2, 3].map(id => {
              return (
                <div key={id} className="flex flex-col">
                  <SkeletonP className="w-24" />
                  <SkeletonP className="w-36" />
                </div>
              );
            })}
          </div>
        </div>
        <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
          <div className="z-10">
            <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 collapse collapse-arrow overflow-visible flex flex-col mt-10 ">
              <input
                type="checkbox"
                className="absolute -top-[38px] left-0 z-50 h-[2.75rem] w-[5.5rem] min-h-fit"
                defaultChecked
              />
              <div className="h-[5rem] w-[5.5rem] px-4 bg-base-300 absolute self-start rounded-[22px] -top-[38px] -left-[1px] -z-10 py-[0.65rem] collapse-title after:!top-[25%] shadow-lg shadow-base-300">
                <div className="flex items-center space-x-2">
                  <p className="my-0 text-sm">Read</p>
                </div>
              </div>
              <div className="collapse-content py-3 px-4 min-h-12 transition-all duration-200">
                <div className="space-y-5">
                  <SkeletonP className="mt-0 !h-4 w-28" />
                  <SkeletonInputButton />
                </div>
              </div>
            </div>
          </div>
          <div className="z-10">
            <div className="bg-base-100 rounded-3xl shadow-md shadow-secondary border border-base-300 mt-14 collapse collapse-arrow overflow-visible flex flex-col">
              <input
                type="checkbox"
                className="absolute -top-[38px] left-0 z-50 h-[2.75rem] w-[5.5rem] min-h-fit"
                defaultChecked
              />
              <div className="h-[5rem] w-[5.5rem] px-4 bg-base-300 absolute self-start rounded-[22px] -top-[38px] -left-[1px] -z-10 py-[0.65rem] collapse-title after:!top-[25%] shadow-lg shadow-base-300">
                <div className="flex items-center space-x-2 ">
                  <p className="my-0 text-sm">Write</p>
                </div>
              </div>
              <div className="collapse-content py-3 px-4 min-h-12 transition-all duration-200 space-y-4">
                <div className="space-y-5">
                  <SkeletonP className="mt-0 !h-4 w-28" />
                  <SkeletonInputButton />
                </div>
                <div className="space-y-5">
                  <SkeletonP className="mt-0 !h-4 w-28" />
                  <SkeletonInputButton />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonContractUI;
