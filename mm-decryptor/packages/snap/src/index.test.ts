import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { panel, text } from '@metamask/snaps-ui';

describe('onRpcRequest', () => {


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
