// https://blog.erickwendel.com.br/step-by-step-guide-migrating-from-jest-to-nodejs-native-test-runner#heading-quick-break
import {
  describe,
  it,
  mock,
  beforeEach,
} from 'node:test'
import assert from 'node:assert'


function run({ fn, times }) {
  for (let i = 0; i < times; i++) {
    fn({ current: i * 5 })
  }
}

describe('Spies Test Suite', () => {
  it('should verify calls in a mock', () => {
    const spy = mock.fn()
    run({ fn: spy, times: 2 })

    assert.strictEqual(spy.mock.callCount(), 2)
    const calls = spy.mock.calls
    assert.deepStrictEqual(calls[0].arguments[0], { current: 0 })
    assert.deepStrictEqual(calls[1].arguments[0], { current: 5 })
  })
})

class Service {
  static async getTalks({ skip, limit }) {
    const items = await fetch('https://tml-api.herokuapp.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `
        {
          getTalks (skip: ${skip}, limit: ${limit}) {
            totalCount,
            talks {
              _id
              title
            }
          }
        }
        `
      })
    })
    return (await items.json()).data.getTalks.talks
  }
}

function mapResponse(data) {
  return data
    .map(({ _id, title }, index) => `[${index}] id: ${_id}, title: ${title}`)
    .join('\n')
}

async function run2({ skip = 0, limit = 10 }) {
  const talks = mapResponse(await Service.getTalks({ skip, limit }))
  return talks
}

describe('Stub Test Suite', () => {
  // only needed if you're not using the context variable
  // in the it() calls
  beforeEach(() => mock.restoreAll())

  it('should stub APIs', async (context) => {
    context.mock.method(
      Service,
      Service.getTalks.name,
    ).mock.mockImplementation(async () => [
      {
        _id: '63865750c839dbaacd8116e1',
        title: 'The Journey About How I Fixed a Bug in the Node.js Core That Affected Thousands of Packages'
      }
    ])

    const result = await run2({ limit: 1 })
    const expected = `[0] id: 63865750c839dbaacd8116e1, title: The Journey About How I Fixed a Bug in the Node.js Core That Affected Thousands of Packages`

    assert.deepStrictEqual(Service.getTalks.mock.callCount(), 1)
    const calls = Service.getTalks.mock.calls

    assert.deepStrictEqual(calls[0].arguments[0], { skip: 0, limit: 1 })
    assert.strictEqual(result, expected)
  })
})
