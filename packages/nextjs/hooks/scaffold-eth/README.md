# Scaffold-ETH 2 Hooks

This directory contains custom React hooks that are used throughout the Scaffold-ETH 2 application.

## Hooks

### useAddress

`useAddress` is a hook that handles the logic for fetching and resolving Ethereum addresses with ENS integration. UI-specific formatting and display logic remains in the component.

#### Usage

```tsx
import { useAddress } from "~~/hooks/scaffold-eth";

const MyComponent = ({ address }) => {
  const {
    checkSumAddress,
    ens,
    ensAvatar,
    isEnsNameLoading,
    blockExplorerAddressLink,
    isValidAddress,
    shortAddress,
    longAddress,
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
- `blockExplorerAddressLink` - Link to block explorer for the address
- `isValidAddress` - Whether the address is a valid Ethereum address
- `shortAddress` - Shortened address format (0x1234...5678)
- `longAddress` - Full address format

#### UI Helper Exports

The module also exports several UI utility functions and constants that can be used by components:

- `textSizeMap` - Tailwind classes for different text sizes
- `blockieSizeMap` - Size values for Blockie avatars
- `copyIconSizeMap` - Tailwind classes for copy icon sizes
- `getNextSize` - Helper function to get next size in a size map
- `getPrevSize` - Helper function to get previous size in a size map
