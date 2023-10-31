import type { MergeDeepRecord } from "type-fest/source/merge-deep";

// To be used in JSON.stringify when a field might be bigint
// https://wagmi.sh/react/faq#bigint-serialization
export const replacer = (_key: string, value: unknown) => (typeof value === "bigint" ? value.toString() : value);

export const deepMerge = <D extends Record<PropertyKey, any>, S extends Record<PropertyKey, any>>(
  destination: D,
  source: S,
) => {
  const result: Record<PropertyKey, any> = {};
  for (const key in destination) {
    if (key in source) {
      if (typeof destination[key] === "object" && typeof source[key] === "object" && !Array.isArray(source[key])) {
        result[key] = deepMerge(destination[key], source[key]);
      } else {
        result[key] = source[key];
      }
    } else {
      result[key] = destination[key];
    }
  }
  for (const key in source) {
    if (!(key in destination)) {
      result[key] = source[key];
    }
  }
  return result as MergeDeepRecord<D, S, { arrayMergeMode: "replace" }>;
};
