# SecretFans snap

This snap takes care of the encryption and decryption going on for secret fans app! But it could really be sued by any other app that needs to perform public/private key encryption and decryption
It has 3 main fucitonalities

## Get public key

Expose the public ket from the derivation path `m/44'/1'/0'/0/0`. This public key will be shared by the owner in order for others to encrypt messages uppon

### Interface

```js
{
  method: 'getPublicKey',
};
```

## Encrypt

Encrypts a message towards a public key

### Interface

```js
{
  method: 'encrypt',
  params: {
    stringToEncrypt: "msg to encrypt",
    publicKey: "0x....",
  }
}
```

## Decrypt

Decrypts an ecrypted message using the private key derived from `m/44'/1'/0'/0/0`

### Interface

```js
{
  method: 'decrypt',
  params: {
    encryptedString: "********",
  }
}
```
