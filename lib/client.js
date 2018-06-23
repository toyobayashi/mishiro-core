const crypto = require('crypto')
const Rijndael = require('rijndael-js')
const msgpackLite = require('msgpack-lite')
const { request } = require('../util/util.js')

const chr = c => String.fromCharCode(c)
const ord = char => char.charCodeAt(0)
const sha1 = s => crypto.createHash('sha1').update(s).digest('hex')
const md5 = s => crypto.createHash('md5').update(s).digest('hex')
const createRandomNumberString = l => Array(l).fill(void 0).map(() => Math.floor(10 * Math.random())).join('')
const $04x = n => ('0000' + n.toString(16)).slice(-4)
const $xFFFF32 = () => Array(32).fill(void 0).map(() => Math.floor(65536 * Math.random()).toString(16)).join('')

const msgpackLiteOptions = { codec: msgpackLite.createCodec({ useraw: true }) }
const msgpack = {
  encode: o => msgpackLite.encode(o, msgpackLiteOptions),
  decode: o => msgpackLite.decode(o)
}

class ApiClient {
  constructor (account, resVer = '10040400') {
    this.user = account.split(':')[0]
    this.viewer = account.split(':')[1]
    this.udid = account.split(':')[2]
    this.sid = ''
    this.resVer = resVer
  }

  post (path, args) {
    let viewerIV = createRandomNumberString(32)
    args.timezone = '09:00:00'
    args.viewer_id = viewerIV + b64encode(ApiClient.cryptAES.encryptRJ256(this.viewer, viewerIV, b64decode(ApiClient.VIEWER_ID_KEY)))
    let plain = b64encode(msgpack.encode(args))
    let key = b64encode($xFFFF32()).substring(0, 32)
    let bodyIV = this.udid.replace(/-/g, '')
    let body = b64encode(ApiClient.cryptAES.encryptRJ256(plain, bodyIV, key) + key)
    let sid = this.sid || (this.viewer + this.udid)
    let headers = {
      'PARAM': sha1(this.udid + this.viewer + path + plain),
      'KEYCHAIN': '',
      'USER_ID': ApiClient.cryptoGrapher.encode(this.user),
      'CARRIER': 'google',
      'UDID': ApiClient.cryptoGrapher.encode(this.udid),
      'APP_VER': '9.9.9',
      'RES_VER': this.resVer,
      'IP_ADDRESS': '127.0.0.1',
      'DEVICE_NAME': 'Nexus 42',
      'X-Unity-Version': '5.1.2f1',
      'SID': md5(sid + b64decode(ApiClient.SID_KEY)),
      'GRAPHICS_DEVICE_NAME': '3dfx Voodoo2 (TM)',
      'DEVICE_ID': md5('Totally a real Android'),
      'PLATFORM_OS_VERSION': 'Android OS 13.3.7 / API-42 (XYZZ1Y/74726f6c6c)',
      'DEVICE': '2',
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 13.3.7; Nexus 42 Build/XYZZ1Y)'
    }
    return new Promise((resolve, reject) => {
      request({
        url: 'https://game.starlight-stage.jp' + path,
        method: 'POST',
        headers: headers,
        timeout: 10000,
        body: body
      }, (err, body) => {
        if (!err) {
          let bin = Buffer.from(body || '', 'base64')
          let data = bin.slice(0, bin.length - 32)
          let key = bin.slice(bin.length - 32).toString('ascii')
          let plain = ApiClient.cryptAES.decryptRJ256(data, bodyIV, key)

          let msg = msgpack.decode(Buffer.from(plain, 'base64'))
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
      console.log(res)
      if (res.data_headers.result_code === 214) {
        let resVer = Number(res.data_headers.required_res_ver)
        return resVer
      } else if (res.data_headers.result_code === 1) {
        return Number(this.resVer)
      } else {
        return 0
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
    let cipher = new Rijndael(key, 'cbc')
    let ciphertext = cipher.encrypt(s, 256, iv)
    let ascii = ''
    for (let i = 0; i < ciphertext.length; i++) {
      ascii += chr(ciphertext[i])
    }
    return ascii
  },
  decryptRJ256 (s, iv, key) {
    let cipher = new Rijndael(key, 'cbc')
    let plaintext = cipher.decrypt(s, 256, iv)
    let ascii = ''
    for (let i = 0; i < plaintext.length; i++) {
      ascii += chr(plaintext[i])
    }
    return ascii
  }
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
