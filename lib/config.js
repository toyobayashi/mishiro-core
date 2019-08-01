let lame = null
try {
  lame = require('../dist/lame.node')
} catch (_) {}

class Config {
  constructor () {
    this._callbackInterval = 100
  }

  getCallbackInterval () {
    return this._callbackInterval
  }

  setCallbackInterval (num) {
    if (typeof num !== 'number') throw new TypeError(`setCallbackInterval(): The argument must be a number, but got {${typeof num}}.`)
    this._callbackInterval = num
  }

  getBitRate () {
    checkNativeModule()
    return lame.getBitRate()
  }

  setBitRate (rate) {
    checkNativeModule()
    if (typeof rate !== 'number') throw new TypeError(`setBitRate(): The argument must be a number, but got {${typeof rate}}.`)
    lame.setBitRate(rate)
  }

  getProgressCallback () {
    checkNativeModule()
    return lame.getProgressCallback()
  }

  setProgressCallback (value) {
    checkNativeModule()
    if (typeof value !== 'boolean') throw new TypeError(`setProgressCallback(): The argument must be a boolean, but got {${typeof value}}.`)
    lame.setProgressCallback(value)
  }

  list () {
    const res = {
      callbackInterval: this._callbackInterval
    }
    if (lame) {
      res.bitRate = lame.getBitRate()
      res.progressCallback = lame.getProgressCallback()
    }
    return res
  }
}

module.exports = new Config()

function checkNativeModule () {
  if (!lame) throw new Error('failed to load lame.node.')
}
