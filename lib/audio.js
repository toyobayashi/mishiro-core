const path = require('path')
const { Acb } = require('acb')
/** @type {typeof import('hca-decoder').HCADecoder} */
let HCADecoder = null
const core = require('./core.js')
try {
  HCADecoder = require('hca-decoder').HCADecoder
} catch (_) {}
const config = require('./config')

// const { ObjectId } = require('@tybys/oid')
// const init = require('../dist/audio.js').default
// const init = require('../.cgenbuild/Debug/audio.js').default

function acb2hca (acb, targetDir) {
  const utf = new Acb(acb)
  return utf.extract(targetDir)
    .then(() => {
      targetDir = targetDir || path.join(path.dirname(acb), `_acb_${path.basename(acb)}`)
      const fileList = utf.getFileList()
      const hcaList = fileList.map(({ name }) => path.join(targetDir, name))
      hcaList.dirname = targetDir
      return hcaList
    })
}

function hca2wav (hca, wav, loop = 0, mode = 16) {
  if (!HCADecoder) return Promise.reject(new Error('failed to load hca.node.'))
  return new Promise((resolve, reject) => {
    const decoder = new HCADecoder()
    if (typeof hca === 'string') {
      wav = wav || path.join(path.dirname(hca), path.parse(hca).name + '.wav')
    } else {
      if (typeof wav !== 'string') {
        reject(new TypeError('Invalid wav path'))
        return
      }
    }
    decoder.decodeToWaveFile(hca, wav, 1, mode, loop, (err, wav) => {
      if (err) reject(err)
      else resolve(wav)
    })
  })
}

class MP3Encoder {
  constructor () {
    this.bitRate = 128
    this.sampleRate = 0
    this.channels = 0
  }

  encode (wav, mp3, onProgress) {
    if (!core) return Promise.reject(new Error('failed to load core.node.'))
    if (!mp3) mp3 = path.join(path.dirname(wav), path.parse(wav).name + '.mp3')

    return new Promise((resolve, reject) => {
      if (typeof onProgress === 'function') {
        let start = 0
        core.wav2mp3(wav, mp3, this.bitRate, this.sampleRate, this.channels, function (err) {
          if (err) {
            reject(err)
            return
          }
          resolve(mp3)
        }, function (data) {
          if (data.loaded === data.total && data.percentage === 100) {
            onProgress({
              name: path.basename(mp3),
              max: data.total,
              current: data.loaded,
              loading: data.percentage
            })
          } else {
            const now = new Date().getTime()
            if (now - start > config.getCallbackInterval()) {
              start = now
              onProgress({
                name: path.basename(mp3),
                max: data.total,
                current: data.loaded,
                loading: data.percentage
              })
            }
          }
        })
      } else {
        core.wav2mp3(wav, mp3, this.bitRate, this.sampleRate, this.channels, function (err) {
          if (err) {
            reject(err)
            return
          }
          resolve(mp3)
        })
      }
    })
  }
}

function wav2mp3 (wav, mp3, onProgress) {
  return new MP3Encoder().encode(wav, mp3, onProgress)
}

// const wasmModuleInit = { printErr () {} }

class AACEncoder {
  constructor () {
    this.bitRate = 160
    this.sampleRate = 0
    this.channels = 0
  }

  encode (wav, aac, onProgress) {
    if (!core) return Promise.reject(new Error('failed to load core.node.'))
    if (!aac) aac = path.join(path.dirname(wav), path.parse(wav).name + '.aac')

    return new Promise((resolve, reject) => {
      if (typeof onProgress === 'function') {
        let start = 0
        core.wav2aac(wav, aac, this.bitRate, this.sampleRate, this.channels, function (err) {
          if (err) {
            reject(err)
            return
          }
          resolve(aac)
        }, function (data) {
          if (data.loaded === data.total && data.percentage === 100) {
            onProgress({
              name: path.basename(aac),
              max: data.total,
              current: data.loaded,
              loading: data.percentage
            })
          } else {
            const now = new Date().getTime()
            if (now - start > config.getCallbackInterval()) {
              start = now
              onProgress({
                name: path.basename(aac),
                max: data.total,
                current: data.loaded,
                loading: data.percentage
              })
            }
          }
        })
      } else {
        core.wav2aac(wav, aac, this.bitRate, this.sampleRate, this.channels, function (err) {
          if (err) {
            reject(err)
            return
          }
          resolve(aac)
        })
      }
    })
  }
}

function wav2aac (wav, aac, onProgress) {
  // return init(wasmModuleInit).then(({ FS, NODEFS, Module }) => {
  //   const tempid = new ObjectId().toHexString()
  //   const tempdir = path.posix.join('/', tempid)
  //   FS.mkdir(tempdir)
  //   FS.mount(NODEFS, { root: path.dirname(wav) }, tempdir)
  //   const r = Module.transcodeAac(
  //     path.posix.join(tempdir, path.basename(wav)),
  //     path.posix.join(tempdir, path.parse(wav).name + '.aac'),
  //     config.getAacBitRate() * 1000
  //   )
  //   FS.unmount(tempdir)
  //   if (r === 0) return path.join(path.dirname(wav), path.parse(wav).name + '.aac')
  //   return Promise.reject(new Error('failed to encode aac'))
  // })
  return new AACEncoder().encode(wav, aac, onProgress)
}

function hca2mp3 (hca, mp3, onProgress) {
  if (!mp3) mp3 = path.join(path.dirname(hca), path.parse(hca).name + '.mp3')
  return hca2wav(hca, path.join(path.dirname(mp3), path.parse(mp3).name + '.wav'))
    .then(wav => wav2mp3(wav, mp3, onProgress))
}

function hca2aac (hca, aac, onProgress) {
  if (!aac) aac = path.join(path.dirname(hca), path.parse(hca).name + '.aac')
  return hca2wav(hca, path.join(path.dirname(aac), path.parse(aac).name + '.wav'))
    .then(wav => wav2aac(wav, aac, onProgress))
}

function acb2wav (acbPath, singleComplete) {
  return acb2hca(acbPath)
    .then(hcas => {
      const total = hcas.length
      let completed = 0
      return Promise.all(
        hcas.map(hca => hca2wav(hca)
          .then(wav => {
            if (typeof singleComplete === 'function') singleComplete(++completed, total, wav)
            return wav
          })
        )
      ).then(wavs => {
        wavs.dirname = hcas.dirname
        return wavs
      })
    })
}

async function acb2mp3 (acbPath, singleComplete, onWav2Mp3Progress) {
  const hcas = await acb2hca(acbPath)
  const total = hcas.length
  let completed = 0
  const mp3s = []
  mp3s.dirname = hcas.dirname
  for (let i = 0; i < total; i++) {
    const hca = hcas[i]
    const wav = await hca2wav(hca)
    const mp3 = await wav2mp3(wav, null, typeof onWav2Mp3Progress === 'function'
      ? (prog) => {
          onWav2Mp3Progress(completed, total, prog)
        }
      : null)
    completed++
    if (typeof singleComplete === 'function') singleComplete(completed, total, mp3)
    mp3s.push(mp3)
  }

  return mp3s
}

async function acb2aac (acbPath, singleComplete, onWav2AacProgress) {
  const hcas = await acb2hca(acbPath)
  const total = hcas.length
  let completed = 0
  const aacs = []
  aacs.dirname = hcas.dirname
  for (let i = 0; i < total; i++) {
    const hca = hcas[i]
    const wav = await hca2wav(hca)
    const aac = await wav2aac(wav, null, typeof onWav2AacProgress === 'function'
      ? (prog) => {
          onWav2AacProgress(completed, total, prog)
        }
      : null)
    completed++
    if (typeof singleComplete === 'function') singleComplete(completed, total, aac)
    aacs.push(aac)
  }

  return aacs
}

module.exports = {
  acb2hca,
  acb2wav,
  acb2mp3,
  acb2aac,
  hca2wav,
  hca2mp3,
  hca2aac,
  wav2mp3,
  wav2aac,
  MP3Encoder,
  AACEncoder
}
