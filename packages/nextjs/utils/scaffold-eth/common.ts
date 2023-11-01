import type { MergeDeepRecord } from "type-fest/source/merge-deep";

// To be used in JSON.stringify when a field might be bigint
// https://wagmi.sh/react/faq#bigint-serialization
export const replacer = (_key: string, value: unknown) => (typeof value === "bigint" ? value.toString() : value);

export const deepMerge = <D extends Record<PropertyKey, any>, S extends Record<PropertyKey, any>>(
  destination: D,
  source: S,
) => {
  const result: Record<PropertyKey, any> = {};
  const allKeys = Array.from(new Set([...Object.keys(source), ...Object.keys(destination)]));
  for (const key of allKeys) {
    result[key] = { ...destination[key], ...source[key] };
  }
  return result as MergeDeepRecord<D, S, { arrayMergeMode: "replace" }>;
};
