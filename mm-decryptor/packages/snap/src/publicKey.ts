import { getBIP44AddressKeyDeriver } from '@metamask/key-tree';
const EthCrypto = require('eth-crypto');

/**
 * Derive the single account we're using for this snap.
 * The path of the account is m/44'/1'/0'/0/0.
 */
export const getPublicKey = async (): Promise<string> => {
  // Get private key
  const ethereumNode = await snap.request({
    method: 'snap_getBip44Entropy',
    params: {
      coinType: 1, // 1 is for all Testnets
    },
  });
  const deriveEthereumPrivateKey = await getBIP44AddressKeyDeriver(
    ethereumNode,
  );
  const pk = await deriveEthereumPrivateKey(0);
  return pk.publicKey;
};
