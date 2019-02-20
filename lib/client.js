const crypto = require('crypto')
const msgpackLite = require('msgpack-lite')
const request = require('request')

const chr = c => String.fromCharCode(c)
const ord = char => char.charCodeAt(0)
const sha1 = s => crypto.createHash('sha1').update(s).digest('hex')
const md5 = s => crypto.createHash('md5').update(s).digest('hex')
const createRandomNumberString = l => Array(l).fill(void 0).map(() => Math.floor(10 * Math.random())).join('')
const $04x = n => ('0000' + n.toString(16)).slice(-4)
const $xFFFF32 = () => Array(32).fill(void 0).map(() => Math.floor(65536 * Math.random()).toString(16)).join('')

// const msgpackLiteOptions = { codec: msgpackLite.createCodec({ useraw: true }) }
const msgpack = {
  encode: o => msgpackLite.encode(o/* , msgpackLiteOptions */),
  decode: o => msgpackLite.decode(o)
}

class ApiClient {
  constructor (account, resVer = '10051310') {
    this.user = account.split(':')[0]
    this.viewer = account.split(':')[1]
    this.udid = account.split(':')[2]
    this.sid = ''
    this.resVer = resVer
  }

  post (path, args) {
    let viewerIV = createRandomNumberString(16)
    args.timezone = '09:00:00'
    args.viewer_id = viewerIV + b64encode(ApiClient.cryptAES.encryptRJ256(this.viewer, Buffer.from(viewerIV), b64decode(ApiClient.VIEWER_ID_KEY)))
    let plain = b64encode(msgpack.encode(args))
    let key = b64encode($xFFFF32()).substring(0, 32)
    let bodyIV = Buffer.from(this.udid.replace(/-/g, ''), 'hex')
    const plainBuffer = ApiClient.cryptAES.encryptRJ256(plain, bodyIV, key)
    const bodyBuffer = Buffer.concat([plainBuffer, Buffer.from(key, 'ascii')])
    let body = b64encode(bodyBuffer)
    let sid = this.sid || (this.viewer + this.udid)
    let headers = {
      'USER-ID': (args.cl_log_params && args.cl_log_params.userId) || ApiClient.cryptoGrapher.encode(this.user),
      'DEVICE-NAME': 'Nexus 42',
      'APP-VER': '9.9.9',
      'DEVICE-ID': md5('Totally a real Android'),
      'GRAPHICS-DEVICE-NAME': '3dfx Voodoo2 (TM)',
      'IDFA': '',
      'SID': md5(sid + b64decode(ApiClient.SID_KEY)),
      'DEVICE': '2',
      'KEYCHAIN': '',
      'PLATFORM-OS-VERSION': 'Android OS 13.3.7 / API-42 (XYZZ1Y/74726f6c6c)',
      'PARAM': sha1(this.udid + this.viewer + path + plain),
      'X-Unity-Version': '2017.4.2f2',
      'CARRIER': 'google',
      'RES-VER': this.resVer,
      'UDID': (args.cl_log_params && args.cl_log_params.udid) || ApiClient.cryptoGrapher.encode(this.udid),
      'IP-ADDRESS': '127.0.0.1',
      'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 13.3.7; Nexus 42 Build/XYZZ1Y)',
      'Content-Type': 'application/x-www-form-urlencoded'
    }
    return new Promise((resolve, reject) => {
      request({
        method: 'POST',
        url: 'https://apis.game.starlight-stage.jp' + path,
        gzip: true,
        timeout: 10000,
        headers: headers,
        body: body
      }, (err, _res, body) => {
        if (!err) {
          let msg = ApiClient.decryptBody(body, bodyIV)
          this.sid = typeof msg === 'object' ? (msg.data_headers ? msg.data_headers.sid : void 0) : void 0
          resolve(msg)
        } else reject(err)
      })
    })
  }

  check () {
    return this.post('/load/check', {
      campaign_data: '',
      campaign_user: 1337,
      campaign_sign: md5('All your APIs are belong to us'),
      app_type: 0
    }).then(res => {
      if (res.data_headers.result_code === 214) {
        let resVer = Number(res.data_headers.required_res_ver)
        return resVer
      } else if (res.data_headers.result_code === 1) {
        return Number(this.resVer)
      } else {
        throw new Error(res.data_headers.result_code)
      }
    })
  }

  getProfile (viewer) {
    return this.post('/profile/get_profile', { friend_id: viewer.toString() })
  }

  getGachaRate (gacha) {
    return this.post('/gacha/get_rate', { gacha_id: gacha.toString() })
  }
}

ApiClient.VIEWER_ID_KEY = 'cyU1Vk5RKEgkJkJxYjYjMys3OGgyOSFGdDR3U2cpZXg='
ApiClient.SID_KEY = 'ciFJQG50OGU1aT0='

ApiClient.cryptoGrapher = {
  encode (s) {
    return (
      $04x(s.length) +
      s.split('').map(c => createRandomNumberString(2) + chr(ord(c) + 10) + createRandomNumberString(1)).join('') +
      createRandomNumberString(32)
    )
  },
  decode (s) {
    let l = parseInt(s.substr(0, 4), 16)
    let e = ''
    for (let i = 6; i < s.length; i += 4) {
      e += s[i]
    }
    e = e.substr(0, l)
    let arr = []
    for (let i = 0; i < e.length; i++) {
      arr.push(chr(ord(e[i]) - 10))
    }
    return arr.join('')
  }
}

ApiClient.cryptAES = {
  encryptRJ256 (s, iv, key) {
    iv = iv || ''
    var clearEncoding = 'ascii'
    var cipherEncoding = 'hex'
    var cipherChunks = []
    var cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
    cipher.setAutoPadding(true)
    cipherChunks.push(cipher.update(s, clearEncoding, cipherEncoding))
    cipherChunks.push(cipher.final(cipherEncoding))
    return Buffer.from(cipherChunks.join(''), 'hex')
  },
  decryptRJ256 (s, iv, key) {
    if (!s) {
      return ''
    }
    iv = iv || ''
    var clearEncoding = 'hex'
    var cipherEncoding = 'binary'
    var cipherChunks = []
    var decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    decipher.setAutoPadding(true)
    cipherChunks.push(decipher.update(s, cipherEncoding, clearEncoding))
    cipherChunks.push(decipher.final(clearEncoding))
    return Buffer.from(cipherChunks.join(''), 'hex').toString('ascii')
  }
}

ApiClient.decryptBody = function (body, iv) {
  let bin = Buffer.from(body || '', 'base64')
  let data = bin.slice(0, bin.length - 32)
  let key = bin.slice(bin.length - 32).toString('ascii')
  let plain = ApiClient.cryptAES.decryptRJ256(data, iv, key)

  return msgpack.decode(Buffer.from(plain, 'base64'))
}

function b64encode (s) {
  if (typeof s === 'string') return Buffer.from(s, 'ascii').toString('base64')
  else if (Buffer.isBuffer(s)) return s.toString('base64')
  throw new TypeError('b64encode (s: string | Buffer)')
}

function b64decode (s) {
  return Buffer.from(s, 'base64').toString('ascii')
}

module.exports = ApiClient
