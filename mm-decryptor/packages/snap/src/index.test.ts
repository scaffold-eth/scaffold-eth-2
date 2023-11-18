import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { panel, text } from '@metamask/snaps-ui';

describe('onRpcRequest', () => {

  it('gets the public key', async () => {
    const { request, close } = await installSnap();

    const origin = 'Jest';
    const response = await request({
      method: 'getPublicKey',
      origin,
    });

    expect(response).toRespondWith('0x04fcbbf4c8055a8e04271d4e36dec9be5bdfdfe544fc7ccf8b80e71d11b080b09830e1776c66e99ffbe73accfd2d367e9631eac125d5983a6cfa2f4a514eb7c6f5');

    await close();
  });

  it('full flow', async () => {
    const { request, close } = await installSnap();
    const origin = 'Jest';
    const misteryMsg = "blobs are comming";
    const publicKeyResponse = await request({
      method: 'getPublicKey',
      origin,
    });
    let pubKey;
    if ('result' in publicKeyResponse.response) {
      pubKey = publicKeyResponse.response.result;
    }

    let encryptedMsg;
    if (typeof pubKey === "string") {
      const encryptedMsgResponse = await request({
        method: 'encrypt',
        params: {
          stringToEncrypt: misteryMsg,
          publicKey: pubKey,
        },
        origin,
      });
      if ('result' in encryptedMsgResponse.response) {
        encryptedMsg = encryptedMsgResponse.response.result;
      }
    }

    let decryptedMsgResponse;
    if (typeof encryptedMsg === "string") {
      decryptedMsgResponse = await request({
        method: 'decrypt',
        params: {
          encryptedString: encryptedMsg,
        },
        origin,
      });
    }
    expect(decryptedMsgResponse).toRespondWith(misteryMsg);

    await close();
  });

  it('decrypts', async () => {
    const { request, close } = await installSnap();

    const origin = 'Jest';
    const response = await request({
      method: 'decrypt',
      params: {
        encryptedString: "173f08151a73237a5b98db66c27ddf8902f1ab4969d3c8864180060ad2939f2206b6d02a5f1277864203fc221470ccef2b96ab9b139b611bc58c488344128355a59b3405a59044071a4f46dce1bca92bdc0b5b72cb9617eea909a649822d415ad2f6a63319e35e0b9e8158dde93f472f0f",
      },
      origin,
    });

    expect(response).toRespondWith('ay, nos an pillao');

    await close();
  });

  it('throws an error if the requested method does not exist', async () => {
    const { request, close } = await installSnap();

    const response = await request({
      method: 'foo',
    });

    expect(response).toRespondWithError({
      code: -32603,
      message: 'Method not found.',
      stack: expect.any(String),
    });

    await close();
  });
});
