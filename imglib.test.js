// 01-spies.test.js
import {
  describe,
  it,
  mock,
  beforeEach,
} from 'node:test'
// 02-stubs.test.js
import assert from 'node:assert'
import ImgLibClient, { ALBUM_API } from './imglib.js'
import imgur from 'imgur';

describe('Imglib', () => {

  let client;

  beforeEach(async (context) => {
    // mock native fetch
    context.mock.method(
      global,
      'fetch'
    ).mock.mockImplementation(async (...args) => {
      console.log('looking for ', { args })
      if (args[0] === ALBUM_API) {
        return {
          json: () => Promise.resolve({
            data: [
              {
                title: 'Videos',
                id: 1,
              },
              {
                title: 'Pictures',
                id: 2,
              }
            ]
          })
        }
      }

      throw new Error('Not implemented')
    })

    mock.restoreAll();
    client = new ImgLibClient();
    await client.init();
  })

  it('client should be initialized', () => {
    assert.ok(client);
  })

  it.skip('should upload video', async (context) => {
    context.mock.method(imgur, 'module.exports').mock.mockImplementation(() => { })

    await client.uploadVideo('ok')
  })
})
