// To be used in JSON.stringify when a field might be bigint
import { AddressType } from "~~/types/utils";

// https://wagmi.sh/react/faq#bigint-serialization
export const replacer = (_key: string, value: unknown) => (typeof value === "bigint" ? value.toString() : value);

export const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

export const isZeroAddress = (address: AddressType) => address === ZERO_ADDRESS;
