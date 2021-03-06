const cgss = require('..')
const { describe, it } = require('mocha')
const assert = require('assert')
const path = require('path')
const fs = require('fs-extra')

const LEFT = '\x1b[666D'
const dler = new cgss.Downloader()
const audio = cgss.audio

cgss.config.setCallbackInterval(500)
cgss.config.setProgressCallback(true)
console.log(cgss.config.list())

const mp3Encoder = new audio.MP3Encoder()
mp3Encoder.bitRate = 192

describe('cgss.audio.acb2hca()', () => {
  it('card_200087.acb', async function () {
    this.timeout(Infinity)
    const acb = await dler.downloadSound('v', 'd63cbac8a78f70c8459036b5fef1c9e2', path.join(__dirname, '../download', 'card_200087.acb'), (prog) => {
      progress(prog.name, prog.current, prog.max, prog.loading)
    })
    console.log()
    assert.ok(acb === path.join(__dirname, '../download', 'card_200087.acb'))
    if (fs.existsSync(path.join(__dirname, '../download', '_acb_card_200087.acb'))) {
      fs.removeSync(path.join(__dirname, '../download', '_acb_card_200087.acb'))
    }
    const l = fs.readdirSync((await audio.acb2hca(acb)).dirname)
    for (let i = 0; i < l.length; i++) {
      assert.ok(path.parse(l[i]).ext === '.hca')
    }
  })

  it('bgm_commu_kawaii.acb', async function () {
    this.timeout(Infinity)
    const acb = await dler.downloadSound('b', 'e42d4394f86aafdc6a46e1d344a07ea9', path.join(__dirname, '../download', 'bgm_commu_kawaii.acb'), (prog) => {
      progress(prog.name, prog.current, prog.max, prog.loading)
    })
    console.log()
    assert.ok(acb === path.join(__dirname, '../download', 'bgm_commu_kawaii.acb'))
    if (fs.existsSync(path.join(__dirname, '../download', '_acb_bgm_commu_kawaii.acb'))) {
      fs.removeSync(path.join(__dirname, '../download', '_acb_bgm_commu_kawaii.acb'))
    }
    const l = fs.readdirSync((await audio.acb2hca(acb)).dirname)
    for (let i = 0; i < l.length; i++) {
      assert.ok(path.parse(l[i]).ext === '.hca')
    }
  })

  it('bgm_commu_ashita.acb', async function () {
    this.timeout(Infinity)
    const acb = await dler.downloadSound('b', 'e2f82032ef9512b467554fa45c9e1dfd', path.join(__dirname, '../download', 'bgm_commu_ashita.acb'), (prog) => {
      progress(prog.name, prog.current, prog.max, prog.loading)
    })
    console.log()
    assert.ok(acb === path.join(__dirname, '../download', 'bgm_commu_ashita.acb'))
    if (fs.existsSync(path.join(__dirname, '../download', '_acb_bgm_commu_ashita.acb'))) {
      fs.removeSync(path.join(__dirname, '../download', '_acb_bgm_commu_ashita.acb'))
    }
    const l = fs.readdirSync((await audio.acb2hca(acb)).dirname)
    for (let i = 0; i < l.length; i++) {
      assert.ok(path.parse(l[i]).ext === '.hca')
    }
  })
})

describe('cgss.audio.hca2wav()', () => {
  it('bgm_commu_kawaii.hca', async function () {
    this.timeout(Infinity)
    const wav = await audio.hca2wav(path.join(__dirname, '../download/_acb_bgm_commu_kawaii.acb', 'bgm_commu_kawaii.hca'))
    assert.ok(path.parse(wav).base === 'bgm_commu_kawaii.wav')
    assert.ok(fs.existsSync(wav))
  })
})

describe('cgss.audio.wav2mp3()', () => {
  it('bgm_commu_kawaii.wav -> mp3', async function () {
    this.timeout(Infinity)
    let callCount = 0
    const mp3 = await mp3Encoder.encode(
      path.join(__dirname, '../download/_acb_bgm_commu_kawaii.acb', 'bgm_commu_kawaii.wav'),
      null,
      function (data) {
        callCount++
        console.log(data)
      }
    )
    assert.ok(path.parse(mp3).base === 'bgm_commu_kawaii.mp3')
    assert.ok(fs.existsSync(mp3))
    assert.ok(cgss.config.getProgressCallback() ? (callCount !== 0) : (callCount === 0))
  })
})

describe('cgss.audio.wav2aac()', () => {
  it('bgm_commu_kawaii.wav -> aac', async function () {
    this.timeout(Infinity)
    let callCount = 0
    const aac = await audio.wav2aac(
      path.join(__dirname, '../download/_acb_bgm_commu_kawaii.acb', 'bgm_commu_kawaii.wav'),
      null,
      function (data) {
        callCount++
        console.log(data)
      }
    )
    assert.ok(fs.existsSync(aac))
    assert.ok(cgss.config.getProgressCallback() ? (callCount !== 0) : (callCount === 0))
  })
})

describe('cgss.audio.hca2mp3()', () => {
  it('bgm_commu_ashita.hca -> mp3', async function () {
    this.timeout(Infinity)
    let callCount = 0
    const mp3 = await audio.hca2mp3(path.join(__dirname, '../download/_acb_bgm_commu_ashita.acb', 'bgm_commu_ashita.hca'), '', function (data) {
      callCount++
      console.log(data)
    })
    assert.ok(path.parse(mp3).base === 'bgm_commu_ashita.mp3')
    assert.ok(fs.existsSync(mp3))
    assert.ok(cgss.config.getProgressCallback() ? (callCount !== 0) : (callCount === 0))
  })
})

describe('cgss.audio.hca2aac()', () => {
  it('bgm_commu_ashita.hca -> aac', async function () {
    this.timeout(Infinity)
    let callCount = 0
    const aac = await audio.hca2aac(path.join(__dirname, '../download/_acb_bgm_commu_ashita.acb', 'bgm_commu_ashita.hca'), '', function (data) {
      callCount++
      console.log(data)
    })
    assert.ok(path.parse(aac).base === 'bgm_commu_ashita.aac')
    assert.ok(fs.existsSync(aac))
    assert.ok(cgss.config.getProgressCallback() ? (callCount !== 0) : (callCount === 0))
  })
})

describe('cgss.audio.acb2wav()', () => {
  it('card_100008.acb', async function () {
    this.timeout(Infinity)
    const acb = await dler.downloadSound('v', 'caf120711c3b5e6ffea0ad50246f1747', path.join(__dirname, '../download', 'card_100008.acb'), (prog) => {
      progress(prog.name, prog.current, prog.max, prog.loading)
    })
    console.log()
    assert.ok(acb === path.join(__dirname, '../download', 'card_100008.acb'))
    const l = await audio.acb2wav(acb/* , (c, t, n) => console.log(c, t, n) */)
    assert.ok(l.indexOf('') === -1)
    for (let i = 0; i < l.length; i++) {
      assert.ok(path.parse(l[i]).ext === '.wav')
      assert.ok(fs.existsSync(l[i]))
    }
  })

  it('bgm_commu_ankira.acb', async function () {
    this.timeout(Infinity)
    const acb = await dler.downloadSound('b', 'd67d2ab75f2a90eb5024146921da6cf2', path.join(__dirname, '../download', 'bgm_commu_ankira.acb'), (prog) => {
      progress(prog.name, prog.current, prog.max, prog.loading)
    })
    console.log()
    assert.ok(acb === path.join(__dirname, '../download', 'bgm_commu_ankira.acb'))
    const l = await audio.acb2wav(acb)
    assert.ok(l.indexOf('') === -1)
    for (let i = 0; i < l.length; i++) {
      assert.ok(path.parse(l[i]).ext === '.wav')
      assert.ok(fs.existsSync(l[i]))
    }
  })
})

describe('cgss.audio.acb2mp3()', () => {
  it('card_100071.acb -> mp3', async function () {
    this.timeout(Infinity)
    const acb = await dler.downloadSound('v', 'cd6af2ed9fa3a70f92ebee9946e8300e', path.join(__dirname, '../download', 'card_100071.acb'), (prog) => {
      progress(prog.name, prog.current, prog.max, prog.loading)
    })
    console.log()
    assert.ok(acb === path.join(__dirname, '../download', 'card_100071.acb'))
    const l = await audio.acb2mp3(acb, (c, t, _n) => {
      console.log('Completed: ' + c + ' / ' + t)
    }, /* process.platform === 'win32' ?  */(c, t, p) => console.log(c, t, p)/*  : null */)
    assert.ok(l.indexOf('') === -1)
    for (let i = 0; i < l.length; i++) {
      assert.ok(path.parse(l[i]).ext === '.mp3')
      assert.ok(fs.existsSync(l[i]))
    }
    assert.ok(typeof l.dirname === 'string')
  })
})

describe('cgss.audio.acb2aac()', () => {
  it('card_100520.acb -> aac', async function () {
    this.timeout(Infinity)
    const acb = await dler.downloadSound('v', 'cad5e95c638d54709960fb5d95e31e45', path.join(__dirname, '../download', 'card_100520.acb'), (prog) => {
      progress(prog.name, prog.current, prog.max, prog.loading)
    })
    console.log()
    assert.ok(acb === path.join(__dirname, '../download', 'card_100520.acb'))
    const l = await audio.acb2aac(acb, (c, t, _n) => {
      console.log('Completed: ' + c + ' / ' + t)
    }, (c, t, p) => {
      console.log(c, t, p)
    })
    assert.ok(l.indexOf('') === -1)
    for (let i = 0; i < l.length; i++) {
      assert.ok(path.parse(l[i]).ext === '.aac')
      assert.ok(fs.existsSync(l[i]))
    }
    assert.ok(typeof l.dirname === 'string')
  })
})

function fprintfstderr (str) {
  process.stderr.write(str)
}

function repeat (str, n) {
  return Array.from({ length: n }, () => str).join('')
}

function progress (name, _current, _max, loading) {
  fprintfstderr(LEFT + `${name} [${repeat('=', Math.round(loading / 100 * 30) - 1)}>${repeat(' ', Math.round((100 - loading) / 100 * 30))}]  `)
}
