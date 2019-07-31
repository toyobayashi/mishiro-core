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

  list () {
    const res = {
      callbackInterval: this._callbackInterval
    }
    if (lame) {
      res.bitRate = lame.getBitRate()
    }
    return res
  }
}

module.exports = new Config()

function checkNativeModule () {
  if (!lame) throw new Error('failed to load lame.node.')
}
