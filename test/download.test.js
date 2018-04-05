const cgss = require('..')
const { describe, it } = require('mocha')
const assert = require('assert')
const path = require('path')
const fs = require('fs')

const LEFT = '\x1b[666D'
const dler = cgss.downloader

describe('cgss.downloader', () => {
  it('cgss.downloader.downloadManifest()', async function () {
    this.timeout(Infinity)
    const manifest = await dler.downloadManifest(10037500, path.join(__dirname, '../download', 'manifest'), (prog) => {
      progress(prog.name, prog.current, prog.max, prog.loading)
    })
    assert.ok(manifest === path.join(__dirname, '../download', 'manifest.db'))
    assert.ok(fs.existsSync(manifest))
  })

  it('cgss.downloader.downloadDatabase()', async function () {
    this.timeout(Infinity)
    const f = await dler.downloadDatabase('cf54947bce776e2426b5f6c25f1c1210', path.join(__dirname, '../download', 'master'), 'mdb', (prog) => {
      progress(prog.name, prog.current, prog.max, prog.loading)
    })
    assert.ok(f === path.join(__dirname, '../download', 'master.mdb'))
    assert.ok(fs.existsSync(f))
  })

  it('cgss.downloader.downloadDatabase()', async function () {
    this.timeout(Infinity)
    const f = await dler.downloadDatabase('e087363817ffa9784d78adf04c755342', path.join(__dirname, '../download', 'musicscores_m075'), void 0, (prog) => {
      progress(prog.name, prog.current, prog.max, prog.loading)
    })
    assert.ok(f === path.join(__dirname, '../download', 'musicscores_m075.bdb'))
    assert.ok(fs.existsSync(f))
  })

  it('cgss.downloader.downloadAsset()', async function () {
    this.timeout(Infinity)
    const f = await dler.downloadAsset('5997d81e5d770b358f94a9d2b9cfcc6a', path.join(__dirname, '../download', 'card_bg_100057'), (prog) => {
      progress(prog.name, prog.current, prog.max, prog.loading)
    })
    assert.ok(f === path.join(__dirname, '../download', 'card_bg_100057.unity3d'))
    assert.ok(fs.existsSync(f))
  })

  it('cgss.downloader.downloadSound()', async function () {
    this.timeout(Infinity)
    const f = await dler.downloadSound('l', '2860f75809927c94c3eaecdd842853ac', path.join(__dirname, '../download', 'song_1001.acb'), (prog) => {
      progress(prog.name, prog.current, prog.max, prog.loading)
    })
    assert.ok(f === path.join(__dirname, '../download', 'song_1001.acb'))
    assert.ok(fs.existsSync(f))
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
