import { getSnaps } from './snap';

/**
 * Tries to detect if one of the injected providers is MetaMask and checks if snaps is available in that MetaMask version.
 *
 * @returns True if the MetaMask version supports Snaps, false otherwise.
 */
export const detectSnaps = async () => {
  if (window.ethereum?.detected) {
    for (const provider of window.ethereum.detected) {
      try {
        // Detect snaps support
        await getSnaps(provider);

        // enforces MetaMask as provider
        if (window.ethereum.setProvider) {
          window.ethereum.setProvider(provider);
        }

        return true;
      } catch {
        // no-op
      }
    }
  }

  if (window.ethereum?.providers) {
    for (const provider of window.ethereum.providers) {
      try {
        // Detect snaps support
        await getSnaps(provider);

        window.ethereum = provider;

        return true;
      } catch {
        // no-op
      }
    }
  }

  try {
    await getSnaps();

    return true;
  } catch {
    return false;
  }
};

/**
 * Detect if the wallet injecting the ethereum object is MetaMask Flask.
 *
 * @returns True if the MetaMask version is Flask, false otherwise.
 */
export const isFlask = async () => {
  const provider = window.ethereum;

  try {
    const clientVersion = await provider?.request({
      method: 'web3_clientVersion',
    });

    const isFlaskDetected = (clientVersion as string[])?.includes('flask');

    return Boolean(provider && isFlaskDetected);
  } catch {
    return false;
  }
};
