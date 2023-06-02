/**
 * @dev utility to parse string to wagmi's PayableOverrides.value.Returns BigInt if its convertible or returns -1 if there is error or invalid string
 * @param  str - any string
 * @return {bigint | number}
 */
export const parseTxnValue = (str: string): bigint | number | undefined => {
  if (!str) {
    return undefined;
  }
  try {
    if (isNaN(parseFloat(str))) {
      return -1;
    }
    return BigInt(str);
  } catch (error: any) {
    if (parseFloat(str)) {
      return parseFloat(str);
    } else {
      return -1;
    }
  }
};
