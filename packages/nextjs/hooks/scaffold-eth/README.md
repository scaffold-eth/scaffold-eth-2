# Scaffold-ETH 2 Hooks

This directory contains custom React hooks that are used throughout the Scaffold-ETH 2 application.

## Hooks

### useAddress

`useAddress` is a hook that handles the logic for displaying Ethereum addresses with ENS name resolution and various formatting options.

#### Usage

```tsx
import { useAddress } from "~~/hooks/scaffold-eth";

const MyComponent = ({ address }) => {
  const {
    checkSumAddress,
    ens,
    ensAvatar,
    displayAddress,
    displayEnsOrAddress,
    isValidAddress,
    // ...more properties
  } = useAddress({
    address,
    format: "short", // or "long"
    size: "base", // "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl"
    onlyEnsOrAddress: false,
  });

  // Use the values to render your UI
};
```

#### Options

- `address` - The Ethereum address to display
- `format` - "short" (0x1234...5678) or "long" (full address)
- `size` - Text size variant from "xs" to "3xl"
- `onlyEnsOrAddress` - If true, only displays ENS name or address without showing both

#### Return Values

The hook returns an object with the following properties:

- `checkSumAddress` - The checksummed address
- `ens` - ENS name if available
- `ensAvatar` - ENS avatar if available
- `isEnsNameLoading` - Loading state for ENS resolution
- `displayAddress` - Formatted address (short or long)
- `displayEnsOrAddress` - ENS name if available, otherwise formatted address
- `showSkeleton` - Whether to show loading skeleton
- `addressSize`, `ensSize`, `blockieSize` - Size variants for styling
- `blockExplorerAddressLink` - Link to block explorer for the address
- `isValidAddress` - Whether the address is a valid Ethereum address
