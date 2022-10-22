# Zustand Store

The zustand store is split into slices

```ts
store: {
  slice1: {
    stuff: 'sdfds',
    sss: 'sdfsds'
    /** any data */
  },
  slice2: {
    stuff: 'sdfds',
    sss: 'sdfsds'
    /** any data */
  },
}
```

## Overview

- The slices are defined in the slice files.
- `store.ts` is where all the slices are put together to create the store
- `storeTypes.ts` are just types to help create and define the store

## To create a new slice

- create a new slice file and copy the pattern
- add the slice type to `storeTypes.ts` `TAppStore`
- add the slice to the create function in `store.ts`

## Access your data in react

Use the hook useAppStore

```ts
const tempState = useAppStore(state => state.tempSlice.tempState);
const setTempState = useAppStore(state => state.tempSlice.setTempState);

useEffect(() => {
  console.log("test state, in useTempTestContract: " + tempState.tempStuff);
}, [tempState?.tempStuff]);
```
