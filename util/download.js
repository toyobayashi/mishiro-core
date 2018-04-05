const request = require('./request.js')

function download (u, p, onData) {
  return new Promise((resolve, reject) => {
    this.req = request({
      url: u,
      path: p,
      onData: onData,
      headers: {
        'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 7.0; Nexus 42 Build/XYZZ1Y)',
        'X-Unity-Version': '5.1.2f1',
        'Accept-Encoding': 'gzip',
        'Connection': 'Keep-Alive'
      }
    }, (err, res, p) => {
      if (err) {
        if (err.message === 'abort' || /^[4-9][0-9][0-9]$/.test(err.message)) resolve(false)
        else reject(err)
      } else {
        resolve(p)
      }
    })
  })
}

module.exports = download
