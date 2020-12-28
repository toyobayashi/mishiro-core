const cgss = require('..')
const { describe, it } = require('mocha')
const assert = require('assert')
const path = require('path')
const fs = require('fs')

const LEFT = '\x1b[666D'
const dler = new cgss.Downloader()

const { Writable } = require('stream')
const { createHash } = require('crypto')

class HashResult extends Writable {
  constructor (o) {
    super(o)
    this._value = ''
    Object.defineProperty(this, 'promise', {
      enumerable: true,
      configurable: true,
      writable: false,
      value: new Promise((resolve, reject) => {
        this._defer = { resolve, reject }
        this.once('error', reject)
      })
    })
  }

  _write (chunk, _encoding, cb) {
    this._value = chunk.toString('hex')
    cb()
  }

  _final (cb) {
    this._defer.resolve(this._value)
    cb()
  }
}

function md5File (path) {
  try {
    return fs.createReadStream(path).pipe(createHash('md5')).pipe(new HashResult()).promise
  } catch (err) {
    return Promise.reject(err)
  }
}

describe('cgss.downloader', () => {
  it('cgss.downloader.downloadManifest()', async function () {
    this.timeout(Infinity)
    const manifest = await dler.downloadManifest(10058100, path.join(__dirname, '../download', 'manifest'), (prog) => {
      progress(prog.name, prog.current, prog.max, prog.loading)
    })
    assert.ok(manifest === path.join(__dirname, '../download', 'manifest.db'))
    assert.ok(fs.existsSync(manifest))
  })

  it('cgss.downloader.downloadDatabase()', async function () {
    this.timeout(Infinity)
    const f = await dler.downloadDatabase('e087363817ffa9784d78adf04c755342', path.join(__dirname, '../download', 'musicscores_m075'), (prog) => {
      progress(prog.name, prog.current, prog.max, prog.loading)
    })
    assert.ok(f === path.join(__dirname, '../download', 'musicscores_m075.bdb'))
    assert.ok(fs.existsSync(f))
  })

  it('cgss.downloader.downloadAsset()', async function () {
    this.timeout(Infinity)
    const lz4 = path.join(__dirname, '../download', 'card_bg_100057')
    const f = await dler.downloadAsset('91f43f3eb37091cb4545b1c03954bb36', lz4, (prog) => {
      progress(prog.name, prog.current, prog.max, prog.loading)
    })
    const md5 = await md5File(lz4)
    assert.ok(md5 === '91f43f3eb37091cb4545b1c03954bb36')
    assert.ok(f === path.join(__dirname, '../download', 'card_bg_100057.unity3d'))
    assert.ok(fs.existsSync(f))
    const unity3dMD5 = await md5File(f)
    assert.ok(unity3dMD5 === 'bf5e68f0bc78139175ab90e595cf2844')
    const results = await cgss.util.unpackTexture2D(f, path.join(__dirname, '../download'))
    assert.ok(results.length > 0)
  })

  it('cgss.downloader.downloadSound()', async function () {
    this.timeout(Infinity)
    const f = await dler.downloadSound('l', 'eed82055ef1e23001be564ccc0431408', path.join(__dirname, '../download', 'song_1001.acb'), (prog) => {
      progress(prog.name, prog.current, prog.max, prog.loading)
    })
    assert.ok(f === path.join(__dirname, '../download', 'song_1001.acb'))
    assert.ok(fs.existsSync(f))
  })

  it('cgss.downloader.downloadOneRaw()', async function () {
    this.timeout(Infinity)
    const f = await dler.downloadOneRaw(cgss.ResourceType.MOVIE, '9c59b78e05382f721a8803d9aed06640', path.join(__dirname, '../download', 'movie9909.usm'), (prog) => {
      progress(prog.name, prog.current, prog.max, prog.loading)
    })
    assert.ok(f === path.join(__dirname, '../download', 'movie9909.usm'))
    assert.ok(fs.existsSync(f))
    const unity3dMD5 = await md5File(f)
    assert.ok(unity3dMD5 === '9c59b78e05382f721a8803d9aed06640')
    const dir = await cgss.movie.demuxAsync(f)
    const ls = fs.readdirSync(dir)
    console.log(ls)
    assert.ok(ls.length !== 0)
  })

  it('cgss.downloader.downloadSpread()', async function () {
    this.timeout(Infinity)
    const f = await dler.downloadSpread(100043, path.join(__dirname, '../download', 'card_bg_100043.png'), (prog) => {
      progress(prog.name, prog.current, prog.max, prog.loading)
    })
    assert.ok(f === path.join(__dirname, '../download', 'card_bg_100043.png'))
    assert.ok(fs.existsSync(f))
  })

  it('cgss.downloader.downloadIcon()', async function () {
    this.timeout(Infinity)
    const f = await dler.downloadIcon(100043, path.join(__dirname, '../download', 'card_100043_m.png'), (prog) => {
      progress(prog.name, prog.current, prog.max, prog.loading)
    })
    assert.ok(f === path.join(__dirname, '../download', 'card_100043_m.png'))
    assert.ok(fs.existsSync(f))
  })
})

function printf (str) {
  process.stdout.write(str)
}

function repeat (str, n) {
  return Array.from({ length: n }, () => str).join('')
}

function progress (name, current, max, loading) {
  printf(LEFT + `${name} [${repeat('=', Math.round(loading / 100 * 30) - 1)}>${repeat(' ', Math.round((100 - loading) / 100 * 30))}]  `)
}
