const crypto = require('crypto')
const msgpackLite = require('msgpack-lite')
// const request = require('request')
const got = require('got').default
const { getProxyAgent } = require('../util/proxy.js')

const chr = c => String.fromCharCode(c)
const ord = char => char.charCodeAt(0)
const sha1 = s => crypto.createHash('sha1').update(s).digest('hex')
const md5 = s => crypto.createHash('md5').update(s).digest('hex')
const createRandomNumberString = l => Array(l).fill(undefined).map(() => Math.floor(10 * Math.random())).join('')
const $04x = n => ('0000' + n.toString(16)).slice(-4)
const $xFFFF32 = () => Array(32).fill(undefined).map(() => Math.floor(65536 * Math.random()).toString(16)).join('')

// const msgpackLiteOptions = { codec: msgpackLite.createCodec({ useraw: true }) }
const msgpack = {
  encode: o => msgpackLite.encode(o/* , msgpackLiteOptions */),
  decode: o => msgpackLite.decode(o)
}

class ApiClient {
  constructor (account, resVer = '10085200') {
    this.user = account.split(':')[0]
    this.viewer = account.split(':')[1]
    this.udid = account.split(':')[2]
    this.sid = ''
    this.resVer = resVer
    this.proxy = ''
  }

  setProxy (uri) {
    this.proxy = uri || ''
  }

  getProxy () {
    return this.proxy
  }

  post (path, args, headerEx) {
    const viewerIV = createRandomNumberString(16)
    args.timezone = '09:00:00'
    args.viewer_id = viewerIV + b64encode(ApiClient.cryptAES.encryptRJ256(this.viewer, Buffer.from(viewerIV), b64decode(ApiClient.VIEWER_ID_KEY)))
    const plain = b64encode(msgpack.encode(args))
    const key = b64encode($xFFFF32()).substring(0, 32)
    const bodyIV = Buffer.from(this.udid.replace(/-/g, ''), 'hex')
    const plainBuffer = ApiClient.cryptAES.encryptRJ256(plain, bodyIV, key)
    const bodyBuffer = Buffer.concat([plainBuffer, Buffer.from(key, 'ascii')])
    const body = b64encode(bodyBuffer)
    const sid = this.sid || (this.viewer + this.udid)
    let headers = {
      'Expect': '100-continue',
      'DEVICE-ID': md5('Totally a real Android'),
      'IP-ADDRESS': 'localhost',
      'RES-VER': this.resVer,
      'PROCESSOR-TYPE': 'ARMv7 VFPv3 NEON VMH',
      'IDFA': '',
      'SID': md5(sid + b64decode(ApiClient.SID_KEY)),
      'DEVICE': '2',
      'KEYCHAIN': '',
      'APP-VER': '9.9.9',
      'PARAM': sha1(this.udid + this.viewer + path + plain),
      'X-Unity-Version': '2018.3.8f1',
      'CARRIER': 'samsung',
      'PLATFORM-OS-VERSION': 'Android OS 4.4.2 / API-19 (NRD90M/381180702)',
      'GRAPHICS-DEVICE-NAME': 'Adreno (TM) 510',
      'USER-ID': (args.cl_log_params && args.cl_log_params.userId) || ApiClient.cryptoGrapher.encode(this.user),
      'UDID': (args.cl_log_params && args.cl_log_params.udid) || ApiClient.cryptoGrapher.encode(this.udid),
      'DEVICE-NAME': 'samsung SM-G955N',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Dalvik/1.6.0 (Linux; U; Android 4.4.2; SM-G955N Build/NRD90M)',
      'Host': 'apis.game.starlight-stage.jp',
      'Connection': 'Keep-Alive',
      'Accept-Encoding': 'gzip'
    }
    if (headerEx) {
      headers = Object.assign({}, headers, headerEx)
    }

    return got.post('https://apis.game.starlight-stage.jp' + path, {
      responseType: 'text',
      decompress: true,
      timeout: {
        response: 10000
      },
      headers,
      body,
      agent: getProxyAgent(this.proxy)
    }).then(res => {
      if (res.statusCode === 403) {
        throw new Error('403 Forbidden')
      }
      const body = res.body
      const msg = ApiClient.decryptBody(body, bodyIV)
      this.sid = typeof msg === 'object' ? (msg.data_headers ? msg.data_headers.sid : undefined) : undefined
      return msg
    })

    // return new Promise((resolve, reject) => {
    //   request({
    //     method: 'POST',
    //     url: 'https://apis.game.starlight-stage.jp' + path,
    //     gzip: true,
    //     timeout: 10000,
    //     headers: headers,
    //     body: body
    //   }, (err, res, body) => {
    //     if (!err) {
    //       if (res.statusCode === 403) {
    //         reject(new Error('403 Forbidden'))
    //         return
    //       }
    //       let msg = ApiClient.decryptBody(body, bodyIV)
    //       this.sid = typeof msg === 'object' ? (msg.data_headers ? msg.data_headers.sid : void 0) : void 0
    //       resolve(msg)
    //     } else reject(err)
    //   })
    // })
  }

  check () {
    return this.post('/load/check', {
      campaign_data: '',
      campaign_user: 1337,
      campaign_sign: md5('All your APIs are belong to us'),
      app_type: 0
    }).then(res => {
      if (res.data_headers.result_code === 214) {
        const resVer = Number(res.data_headers.required_res_ver)
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
      createRandomNumberString(16)
    )
  },
  decode (s) {
    const l = parseInt(s.substr(0, 4), 16)
    let e = ''
    for (let i = 6; i < s.length; i += 4) {
      e += s[i]
    }
    e = e.substr(0, l)
    const arr = []
    for (let i = 0; i < e.length; i++) {
      arr.push(chr(ord(e[i]) - 10))
    }
    return arr.join('')
  }
}

ApiClient.cryptAES = {
  encryptRJ256 (s, iv, key) {
    iv = iv || ''
    const clearEncoding = 'ascii'
    const cipherEncoding = 'hex'
    const cipherChunks = []
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
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
    const clearEncoding = 'hex'
    const cipherEncoding = 'binary'
    const cipherChunks = []
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
    decipher.setAutoPadding(true)
    cipherChunks.push(decipher.update(s, cipherEncoding, clearEncoding))
    cipherChunks.push(decipher.final(clearEncoding))
    return Buffer.from(cipherChunks.join(''), 'hex').toString('ascii')
  }
}

ApiClient.decryptBody = function (body, iv) {
  const bin = Buffer.from(body || '', 'base64')
  const data = bin.slice(0, bin.length - 32)
  const key = bin.slice(bin.length - 32).toString('ascii')
  const plain = ApiClient.cryptAES.decryptRJ256(data, iv, key)

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
