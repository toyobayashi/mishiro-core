const path = require('path')
const tybysDownloader = require('@tybys/downloader')
const Lz4 = require('../util/lz4.js')
const { getProxyAgent } = require('../util/proxy.js')
const config = require('./config.js')

// const gameHostBase = 'http://storage.game.starlight-stage.jp/dl/resources'

const ResourceType = {
  ASSET: 0,
  SOUND: 1,
  DATABASE: 2,
  MOVIE: 3,
  0: 'ASSET',
  1: 'SOUND',
  2: 'DATABASE',
  3: 'MOVIE'
}

class Downloader {
  constructor () {
    this.autoDecLz4 = true
    this.proxy = ''
  }

  setProxy (uri) {
    this.proxy = uri || ''
  }

  getProxy () {
    return this.proxy
  }

  setAutoDecLz4 (v) {
    this.autoDecLz4 = !!v
  }

  getAutoDecLz4 () {
    return this.autoDecLz4
  }

  downloadOne (u, p, onData) {
    let start = 0

    const d = tybysDownloader.Downloader.download(u, {
      dir: path.dirname(p),
      out: path.basename(p),
      headers: {
        'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 7.0; Nexus 42 Build/XYZZ1Y)',
        'X-Unity-Version': '2018.3.8f1',
        'Accept-Encoding': 'gzip',
        'Connection': 'Keep-Alive'
      },
      agent: getProxyAgent(this.proxy)
    })

    d.on('progress', (progress) => {
      if (typeof onData === 'function') {
        if (progress.completedLength === 0 || progress.percent === 100) {
          onData({
            name: path.parse(d.path).base,
            current: progress.completedLength,
            max: progress.totalLength,
            loading: progress.percent
          })
        } else {
          const now = new Date().getTime()
          if (now - start > config.getCallbackInterval()) {
            start = now
            onData({
              name: path.parse(d.path).base,
              current: progress.completedLength,
              max: progress.totalLength,
              loading: progress.percent
            })
          }
        }
      }
    })

    const downloadPromise = d.whenStopped().then(() => {
      return d.path
    }).catch(err => {
      if (err.code != null) {
        if (err.code === tybysDownloader.DownloadErrorCode.ABORT) {
          return ''
        }
        if (err.code === tybysDownloader.DownloadErrorCode.FILE_EXISTS) {
          return d.path
        }
      }
      return Promise.reject(err)
    })
    downloadPromise.download = d

    return downloadPromise
  }

  downloadManifest (resVer, p, onData) {
    const promise = this.downloadOne(`${Downloader.RES_HOST_BASE}/dl/${resVer}/manifests/Android_AHigh_SHigh`, p, onData)
    const r = promise.then(p => p && Lz4.decompress(p, '.db'))
    r.download = promise.download
    return r
  }

  downloadAsset (hash, p, onData) {
    const promise = this.downloadOne(`${Downloader.RES_HOST_BASE}/dl/resources/AssetBundles/${hash.substr(0, 2)}/${hash}`, p, onData)
    const r = promise.then(p => {
      if (p && this.autoDecLz4) {
        return Lz4.decompress(p, '.unity3d')
      }
      return p
    })
    r.download = promise.download
    return r
  }

  static getUrl (type, hash) {
    switch (type) {
      case ResourceType.ASSET: return `${Downloader.RES_HOST_BASE}/dl/resources/AssetBundles/${hash.substr(0, 2)}/${hash}`
      case ResourceType.SOUND: return `${Downloader.RES_HOST_BASE}/dl/resources/Sound/${hash.substr(0, 2)}/${hash}`
      case ResourceType.MOVIE: return `${Downloader.RES_HOST_BASE}/dl/resources/Movie/${hash.substr(0, 2)}/${hash}`
      case ResourceType.DATABASE: return `${Downloader.RES_HOST_BASE}/dl/resources/Generic/${hash.substr(0, 2)}/${hash}`
      default: throw new Error('Unknown resource type')
    }
  }

  downloadOneRaw (type, hash, p, onData) {
    const url = Downloader.getUrl(type, hash)
    return this.downloadOne(url, p, onData)
  }

  downloadSound (k, hash, p, onData) {
    return this.downloadOne(`${Downloader.RES_HOST_BASE}/dl/resources/Sound/${hash.substr(0, 2)}/${hash}`, p, onData)
  }

  downloadMovie (hash, p, onData) {
    return this.downloadOne(`${Downloader.RES_HOST_BASE}/dl/resources/Movie/${hash.substr(0, 2)}/${hash}`, p, onData)
  }

  downloadDatabase (hash, p, onData, suffix = '.bdb') {
    const promise = this.downloadOne(`${Downloader.RES_HOST_BASE}/dl/resources/Generic/${hash.substr(0, 2)}/${hash}`, p, onData)
    const r = promise.then(p => {
      if (p && this.autoDecLz4) {
        return Lz4.decompress(p, suffix)
      }
      return p
    })
    r.download = promise.download
    return r
  }

  downloadSpread (id, p, onData) {
    return this.downloadOne(`${Downloader.IMG_HOST_BASE}/spread/${id}.png`, p, onData)
  }

  downloadIcon (id, p, onData) {
    return this.downloadOne(`${Downloader.IMG_HOST_BASE}/icon_card/${id}.png`, p, onData)
  }
}

Downloader.RES_HOST_BASE = 'https://asset-starlight-stage.akamaized.net'
Downloader.IMG_HOST_BASE = 'https://hidamarirhodonite.kirara.ca'

module.exports = {
  ResourceType,
  Downloader
}
