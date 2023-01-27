import { CopyIcon } from "./CopyIcon";
import { DiamondIcon } from "./DiamondIcon";
import { HareIcon } from "./HareIcon";

export const ContractInteraction = () => {
  return (
    <div className="flex bg-base-300 relative">
      <DiamondIcon className="absolute top-24" />
      <CopyIcon className="absolute bottom-0 left-36" />
      <HareIcon className="absolute right-0 bottom-24" />
    </div>
  );
};
