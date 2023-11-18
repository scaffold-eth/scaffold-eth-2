
const EthCrypto = require('eth-crypto');

export const encrypt = async (stringToEncrypt: string, publicKey: string): Promise<string> => {
  const publicKeyBytes = EthCrypto.publicKey.compress(publicKey.replace('0x', ''));
  const encryptedObject = await EthCrypto.encryptWithPublicKey(
    publicKeyBytes,
    stringToEncrypt
  );
  return EthCrypto.cipher.stringify(encryptedObject);
};
