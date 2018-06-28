const path = require('path')
const { lz4dec, request } = require('../util/util.js')

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
      }, (err, _res, p) => {
        this.req = null
        if (err) {
          if (err.message === 'abort' || /^[4-9][0-9][0-9]$/.test(err.message)) resolve('')
          else reject(err)
        } else {
          resolve(p)
        }
      })
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

      if (start) start(this.tasks[this.index])
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

      if (start) start(this.tasks[this.index])
      if (ext === '.acb') {
        const p = path.join(targetDir, path.basename(name))

        try {
          await this.downloadSound(path.dirname(name), hash, p, onData)
        } catch (e) {
          errorList.push(p)
          this.isContinue = false
        }
      } else if (ext === '.unity3d') {
        const p = path.join(targetDir, path.basename(name, ext))

        try {
          await this.downloadAsset(hash, p, onData)
        } catch (e) {
          errorList.push(p)
          this.isContinue = false
        }
      } else if (ext === '.bdb' || ext === '.mdb') {
        const p = path.join(targetDir, path.basename(name, ext))

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

  stop (stopCallback) {
    this.isContinue = false
    if (this.tasks.length) this.tasks = []
    if (this.req) {
      this.req.abort()
      this.req = null
    }
    if (stopCallback) stopCallback()
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
