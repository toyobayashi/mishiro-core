const cgss = require('..')
const { describe, it } = require('mocha')
const assert = require('assert')
const path = require('path')
const fs = require('fs-extra')

const LEFT = '\x1b[666D'
const dler = cgss.downloader
const audio = cgss.audio

describe('cgss.audio.acb2hca()', () => {
  it('card_200087.acb', async function () {
    this.timeout(Infinity)
    let acb = await dler.downloadSound('v', '930a090e0b5e6f10963382f1726b4862', path.join(__dirname, '../download', 'card_200087.acb'), (prog) => {
      progress(prog.name, prog.current, prog.max, prog.loading)
    })
    console.log()
    assert.ok(acb === path.join(__dirname, '../download', 'card_200087.acb'))
    let l = fs.readdirSync((await audio.acb2hca(acb)).dirname)
    for (let i = 0; i < l.length; i++) {
      assert.ok(path.parse(l[i]).ext === '.hca')
    }
  })

  it('bgm_commu_kawaii.acb', async function () {
    this.timeout(Infinity)
    let acb = await dler.downloadSound('b', '90d50018ddf85619af28ce8496ba77d2', path.join(__dirname, '../download', 'bgm_commu_kawaii.acb'), (prog) => {
      progress(prog.name, prog.current, prog.max, prog.loading)
    })
    console.log()
    assert.ok(acb === path.join(__dirname, '../download', 'bgm_commu_kawaii.acb'))
    let l = fs.readdirSync((await audio.acb2hca(acb)).dirname)
    for (let i = 0; i < l.length; i++) {
      assert.ok(path.parse(l[i]).ext === '.hca')
    }
  })

  it('bgm_commu_ashita.acb', async function () {
    this.timeout(Infinity)
    let acb = await dler.downloadSound('b', 'ad2cb44a45bcd6355dd009a6f55ddeaa', path.join(__dirname, '../download', 'bgm_commu_ashita.acb'), (prog) => {
      progress(prog.name, prog.current, prog.max, prog.loading)
    })
    console.log()
    assert.ok(acb === path.join(__dirname, '../download', 'bgm_commu_ashita.acb'))
    let l = fs.readdirSync((await audio.acb2hca(acb)).dirname)
    for (let i = 0; i < l.length; i++) {
      assert.ok(path.parse(l[i]).ext === '.hca')
    }
  })
})

describe('cgss.audio.hca2wav()', () => {
  it('bgm_commu_kawaii.hca', async function () {
    this.timeout(Infinity)
    let wav = await audio.hca2wav(path.join(__dirname, '../download/_acb_bgm_commu_kawaii.acb', 'bgm_commu_kawaii.hca'))
    assert.ok(path.parse(wav).base === 'bgm_commu_kawaii.wav')
    assert.ok(fs.existsSync(wav))
  })
})

describe('cgss.audio.wav2mp3()', () => {
  it('bgm_commu_kawaii.wav', async function () {
    this.timeout(Infinity)
    let mp3 = await audio.wav2mp3(path.join(__dirname, '../download/_acb_bgm_commu_kawaii.acb', 'bgm_commu_kawaii.wav'))
    assert.ok(path.parse(mp3).base === 'bgm_commu_kawaii.mp3')
    assert.ok(fs.existsSync(mp3))
  })
})

describe('cgss.audio.hca2mp3()', () => {
  it('bgm_commu_ashita.hca', async function () {
    this.timeout(Infinity)
    let mp3 = await audio.hca2mp3(path.join(__dirname, '../download/_acb_bgm_commu_ashita.acb', 'bgm_commu_ashita.hca'))
    assert.ok(path.parse(mp3).base === 'bgm_commu_ashita.mp3')
    assert.ok(fs.existsSync(mp3))
  })
})

describe('cgss.audio.acb2wav()', () => {
  it('card_100008.acb', async function () {
    this.timeout(Infinity)
    let acb = await dler.downloadSound('v', '6ba473da94c95be87da9e23fc0f3b8ce', path.join(__dirname, '../download', 'card_100008.acb'), (prog) => {
      progress(prog.name, prog.current, prog.max, prog.loading)
    })
    console.log()
    assert.ok(acb === path.join(__dirname, '../download', 'card_100008.acb'))
    let l = await audio.acb2wav(acb, (c, t, n) => console.log(c, t, n))
    assert.ok(l.indexOf('') === -1)
    for (let i = 0; i < l.length; i++) {
      assert.ok(path.parse(l[i]).ext === '.wav')
      assert.ok(fs.existsSync(l[i]))
    }
  })

  it('bgm_commu_ankira.acb', async function () {
    this.timeout(Infinity)
    let acb = await dler.downloadSound('b', 'f1fcfc8fb9c22d8c1cabc677a45d16f3', path.join(__dirname, '../download', 'bgm_commu_ankira.acb'), (prog) => {
      progress(prog.name, prog.current, prog.max, prog.loading)
    })
    console.log()
    assert.ok(acb === path.join(__dirname, '../download', 'bgm_commu_ankira.acb'))
    let l = await audio.acb2wav(acb)
    assert.ok(l.indexOf('') === -1)
    for (let i = 0; i < l.length; i++) {
      assert.ok(path.parse(l[i]).ext === '.wav')
      assert.ok(fs.existsSync(l[i]))
    }
  })
})

describe('cgss.audio.acb2mp3()', () => {
  it('card_100071.acb', async function () {
    this.timeout(Infinity)
    let acb = await dler.downloadSound('v', 'd7c1febffb83f9973d76a557056dd727', path.join(__dirname, '../download', 'card_100071.acb'), (prog) => {
      progress(prog.name, prog.current, prog.max, prog.loading)
    })
    console.log()
    assert.ok(acb === path.join(__dirname, '../download', 'card_100071.acb'))
    let l = await audio.acb2mp3(acb, (c, t, n) => console.log(c, t, n))
    assert.ok(l.indexOf('') === -1)
    for (let i = 0; i < l.length; i++) {
      assert.ok(path.parse(l[i]).ext === '.mp3')
      assert.ok(fs.existsSync(l[i]))
    }
  })
})

function printf (str) {
  process.stdout.write(str)
}

function repeat (str, n) {
  return Array.from({length: n}, () => str).join('')
}

function progress (name, _current, _max, loading) {
  printf(LEFT + `${name} [${repeat('=', Math.round(loading / 100 * 30) - 1)}>${repeat(' ', Math.round((100 - loading) / 100 * 30))}]  `)
}
