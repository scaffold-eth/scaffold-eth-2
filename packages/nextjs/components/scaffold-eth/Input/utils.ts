export interface CommonInputProps<T = string> {
  value: T;
  onChange: (newValue: T) => void;
  name?: string;
  placeholder?: string;
}

export enum UintVariant {
  UINT8 = "uint8",
  UINT16 = "uint16",
  UINT24 = "uint24",
  UINT32 = "uint32",
  UINT40 = "uint40",
  UINT48 = "uint48",
  UINT56 = "uint56",
  UINT64 = "uint64",
  UINT72 = "uint72",
  UINT80 = "uint80",
  UINT88 = "uint88",
  UINT96 = "uint96",
  UINT104 = "uint104",
  UINT112 = "uint112",
  UINT120 = "uint120",
  UINT128 = "uint128",
  UINT136 = "uint136",
  UINT144 = "uint144",
  UINT152 = "uint152",
  UINT160 = "uint160",
  UINT168 = "uint168",
  UINT176 = "uint176",
  UINT184 = "uint184",
  UINT192 = "uint192",
  UINT200 = "uint200",
  UINT208 = "uint208",
  UINT216 = "uint216",
  UINT224 = "uint224",
  UINT232 = "uint232",
  UINT240 = "uint240",
  UINT248 = "uint248",
  UINT256 = "uint256",
}

export const NUMBER_REGEX = /^\.?\d+\.?\d*$/;
