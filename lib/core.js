let core
try {
  core = require('../dist/core.node')
} catch (_) {
  core = null
}

module.exports = core
