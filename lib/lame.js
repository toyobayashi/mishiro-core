let lame
try {
  lame = require('../dist/lame.node')
} catch (_) {
  lame = null
}

module.exports = lame
