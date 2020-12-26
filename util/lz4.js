const core = require('../lib/core.js')
const fs = require('fs-extra')

class Lz4 {
  static decompress (input, output = '.unity3d') {
    if (!core) throw new Error('failed to load core.node.')
    if (Buffer.isBuffer(input)) {
      return core.lz4dec(input)
    }
    const buf = core.lz4dec(fs.readFileSync(input))
    fs.writeFileSync(input + output, buf)
    return input + output
  }
}

module.exports = Lz4
