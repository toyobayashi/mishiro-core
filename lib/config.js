const core = require('./core.js')

class Config {
  constructor () {
    this._callbackInterval = 100
    this._aacBitRate = 160
  }

  getCallbackInterval () {
    return this._callbackInterval
  }

  setCallbackInterval (num) {
    if (typeof num !== 'number') throw new TypeError(`setCallbackInterval(): The argument must be a number, but got {${typeof num}}.`)
    this._callbackInterval = num
  }

  getProgressCallback () {
    checkNativeModule()
    return core.getProgressCallback()
  }

  setProgressCallback (value) {
    checkNativeModule()
    if (typeof value !== 'boolean') throw new TypeError(`setProgressCallback(): The argument must be a boolean, but got {${typeof value}}.`)
    core.setProgressCallback(value)
  }

  list () {
    const res = {
      callbackInterval: this._callbackInterval
    }
    if (core) {
      res.progressCallback = core.getProgressCallback()
    }
    return res
  }
}

module.exports = new Config()

function checkNativeModule () {
  if (!core) throw new Error('failed to load core.node.')
}
