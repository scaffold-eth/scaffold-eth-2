export type CommonInputProps<T = string> = {
  value: T;
  onChange: (newValue: T) => void;
  name?: string;
  placeholder?: string;
  disabled?: boolean;
};

export enum IntegerVariant {
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
  INT8 = "int8",
  INT16 = "int16",
  INT24 = "int24",
  INT32 = "int32",
  INT40 = "int40",
  INT48 = "int48",
  INT56 = "int56",
  INT64 = "int64",
  INT72 = "int72",
  INT80 = "int80",
  INT88 = "int88",
  INT96 = "int96",
  INT104 = "int104",
  INT112 = "int112",
  INT120 = "int120",
  INT128 = "int128",
  INT136 = "int136",
  INT144 = "int144",
  INT152 = "int152",
  INT160 = "int160",
  INT168 = "int168",
  INT176 = "int176",
  INT184 = "int184",
  INT192 = "int192",
  INT200 = "int200",
  INT208 = "int208",
  INT216 = "int216",
  INT224 = "int224",
  INT232 = "int232",
  INT240 = "int240",
  INT248 = "int248",
  INT256 = "int256",
}

export const SIGNED_NUMBER_REGEX = /^-?\d+\.?\d*$/;
export const UNSIGNED_NUMBER_REGEX = /^\.?\d+\.?\d*$/;

export const isValidInteger = (dataType: IntegerVariant, value: bigint | string, strict = true) => {
  const isSigned = dataType.startsWith("i");
  const bitcount = Number(dataType.substring(isSigned ? 3 : 4));

  let valueAsBigInt;
  try {
    valueAsBigInt = BigInt(value);
  } catch (e) {}
  if (typeof valueAsBigInt !== "bigint") {
    if (strict) {
      return false;
    }
    if (!value || typeof value !== "string") {
      return true;
    }
    return isSigned ? SIGNED_NUMBER_REGEX.test(value) || value === "-" : UNSIGNED_NUMBER_REGEX.test(value);
  } else if (!isSigned && valueAsBigInt < 0) {
    return false;
  }
  const hexString = valueAsBigInt.toString(16);
  const significantHexDigits = hexString.match(/.*x0*(.*)$/)?.[1] ?? "";
  if (
    significantHexDigits.length * 4 > bitcount ||
    (isSigned && significantHexDigits.length * 4 === bitcount && parseInt(significantHexDigits.slice(-1)?.[0], 16) < 8)
  ) {
    return false;
  }
  return true;
};

// Treat any dot-separated string as a potential ENS name
const ensRegex = /.+\..+/;
export const isENS = (address = "") => ensRegex.test(address);
