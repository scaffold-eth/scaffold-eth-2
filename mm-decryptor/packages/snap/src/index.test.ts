import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';
import { panel, text } from '@metamask/snaps-ui';

describe('onRpcRequest', () => {


  it('decrypts', async () => {
    const { request, close } = await installSnap();

    const origin = 'Jest';
    const response = await request({
      method: 'decrypt',
      origin,
    });

    expect(response).toRespondWithError({
      code: -32603,
      message: 'ay, nos an pillao',
      stack: expect.any(String),
    });

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
