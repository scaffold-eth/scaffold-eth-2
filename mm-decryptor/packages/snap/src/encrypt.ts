
const EthCrypto = require('eth-crypto');

export const encrypt = async (stringToEncrypt: string, publicKey: string): Promise<string> => {
  const publicKeyBytes = EthCrypto.publicKey.compress(publicKey.result.replace('0x', ''));
  const encryptedObject = await EthCrypto.encryptWithPublicKey(
    publicKeyBytes,
    stringToEncrypt
  );
  return EthCrypto.cipher.stringify(encryptedObject);
};
