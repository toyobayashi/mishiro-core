const fs = require('fs-extra')
const path = require('path')
const request = require('request')
const { lz4dec } = require('../util/util.js')

const gameHostBase = 'http://storage.game.starlight-stage.jp/dl/resources'
const imgHostBase = 'https://truecolor.kirara.ca'

class Downloader {
  constructor () {
    this.tasks = []
    this.req = null
    this.index = -1
    this.isContinue = true
  }

  downloadOne (u, p, onData) {
    return new Promise((resolve, reject) => {
      fs.mkdirsSync(path.dirname(p))
      if (fs.existsSync(p)) return resolve(p)

      const headers = {
        'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 7.0; Nexus 42 Build/XYZZ1Y)',
        'X-Unity-Version': '5.4.5p1',
        'Accept-Encoding': 'gzip',
        'Connection': 'Keep-Alive'
      }
      let fileLength = 0
      if (fs.existsSync(p + '.tmp')) {
        fileLength = fs.statSync(p + '.tmp').size
        if (fileLength > 0) {
          headers.Range = 'bytes=' + fileLength + '-'
        }
      }

      let rename = true
      let size = 0
      this.req = request.get({
        url: u,
        headers: headers,
        encoding: null
      })
      this.req.on('response', (res) => {
        const contentLength = Number(res.headers['content-length'])
        let start = new Date().getTime()
        this.req.on('data', (chunk) => {
          size += chunk.length
          const now = new Date().getTime()
          if ((typeof onData === 'function') && (now - start > 100)) {
            start = now
            onData({
              name: path.parse(p).base,
              current: fileLength + size,
              max: fileLength + contentLength,
              loading: 100 * (fileLength + size) / (fileLength + contentLength)
            })
          }
        })
      })
      this.req.on('abort', () => {
        rename = false
        resolve('')
      })
      this.req.on('error', err => {
        rename = false
        reject(err)
      })
      this.req.pipe(fs.createWriteStream(p + '.tmp', { flags: 'a+' }).on('close', () => {
        if (rename) {
          fs.renameSync(p + '.tmp', p)
          resolve(p)
        }
      }).on('error', (err) => {
        if (err) {
          rename = false
          reject(err)
        }
      }))
    })
  }

  async download (tasks, start, onData, complete, stop) {
    this.tasks = tasks
    this.index = 0
    this.isContinue = true

    let errorList = []

    for (this.index = 0; this.index < this.tasks.length; this.index++) {
      let url = this.tasks[this.index][0]
      let filepath = this.tasks[this.index][1]

      if (start && !fs.existsSync(filepath)) start(this.tasks[this.index])
      try {
        await this.downloadOne(url, filepath, onData)
      } catch (e) {
        errorList.push(filepath)
        this.isContinue = false
      }

      if (this.isContinue) {
        if (complete) complete(this.tasks[this.index])
      } else {
        if (stop) stop(this.tasks[this.index])
      }
    }
    this.tasks = []
    this.index = -1
    this.isContinue = true
    this.req = null
    return errorList
  }

  async batchDownload (manifests, targetDir, start, onData, complete, stop) {
    this.tasks = manifests
    this.index = 0
    this.isContinue = true

    let errorList = []

    for (this.index = 0; this.index < this.tasks.length; this.index++) {
      const { name, hash } = this.tasks[this.index]
      const ext = path.extname(name)
      const p = path.join(targetDir, path.basename(name, ext !== '.acb' ? ext : ''))

      if (start && !fs.existsSync(p)) start(this.tasks[this.index], p)
      if (ext === '.acb') {
        try {
          await this.downloadSound(path.dirname(name), hash, p, onData)
        } catch (e) {
          errorList.push(p)
          this.isContinue = false
        }
      } else if (ext === '.unity3d') {
        try {
          await this.downloadAsset(hash, p, onData)
        } catch (e) {
          errorList.push(p)
          this.isContinue = false
        }
      } else if (ext === '.bdb' || ext === '.mdb') {
        try {
          await this.downloadDatabase(hash, p, onData, ext)
        } catch (e) {
          errorList.push(p)
          this.isContinue = false
        }
      } else {
        continue
      }

      if (this.isContinue) {
        if (complete) complete(this.tasks[this.index], p)
      } else {
        if (stop) stop(this.tasks[this.index], p)
      }
    }

    this.tasks = []
    this.index = -1
    this.isContinue = true
    this.req = null
    return errorList
  }

  stop (stopCallback) {
    this.isContinue = false
    if (this.tasks.length) {
      this.tasks = []
    } else {
      if (stopCallback) stopCallback()
    }
    if (this.req) {
      this.req.abort()
      this.req = null
    }
  }

  downloadManifest (resVer, p, onData) {
    return this.downloadOne(`http://storage.game.starlight-stage.jp/dl/${resVer}/manifests/Android_AHigh_SHigh`, p, onData).then(p => p && lz4dec(p, '.db'))
  }

  downloadAsset (hash, p, onData) {
    return this.downloadOne(`${gameHostBase}/High/AssetBundles/Android/${hash}`, p, onData).then(p => p && lz4dec(p, '.unity3d'))
  }

  downloadSound (k, hash, p, onData) {
    return this.downloadOne(`${gameHostBase}/High/Sound/Common/${k}/${hash}`, p, onData)
  }

  downloadDatabase (hash, p, onData, suffix = '.bdb') {
    return this.downloadOne(`${gameHostBase}/Generic/${hash}`, p, onData).then(p => p && lz4dec(p, suffix))
  }

  downloadSpread (id, p, onData) {
    return this.downloadOne(`${imgHostBase}/spread/${id}.png`, p, onData)
  }

  downloadIcon (id, p, onData) {
    return this.downloadOne(`${imgHostBase}/icon_card/${id}.png`, p, onData)
  }
}

module.exports = Downloader
