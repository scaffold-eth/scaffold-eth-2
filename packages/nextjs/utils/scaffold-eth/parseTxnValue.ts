import { BigNumber } from "ethers";

/**
 * @dev utility to parse string to wagmi's PayableOverrides.value.Returns BigNumber if its convertible or returns -1 if there is error or invalid string
 * @param  str - any string
 * @return {BigNumber | number | undefined}
 */
export default function parseTxnValue(str: string): BigNumber | number | undefined {
  try {
    if (isNaN(parseFloat(str))) {
      if (str === "") return undefined;
      return -1;
    }
    return BigNumber.from(str);
  } catch (error: any) {
    if (parseFloat(str)) {
      return parseFloat(str);
    } else {
      return -1;
    }
  }
}
