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

  list () {
    return JSON.parse(JSON.stringify(this))
  }
}

module.exports = new Config()
