import { blo } from "blo";
import { Address } from "viem";

export const AddressInputSuffix = ({ value }: { value: Address }) => {
  // Don't want to use nextJS Image here (and adding remote patterns for the URL)
  // eslint-disable-next-line @next/next/no-img-element
  return value && <img alt="" className="!rounded-full" src={blo(value as `0x${string}`)} width="35" height="35" />;
};
