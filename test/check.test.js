const { describe, it } = require('mocha')
const assert = require('assert')
const cgss = require('..')

describe('Version Check', () => {
  it('have new version', async function () {
    this.timeout(10000)
    const client = new cgss.Clent('940464243:174481488:cf608be5-6d38-421a-8eb1-11a501132c0a')
    let resver = await client.check()
    assert.ok(resver)
  })
})
