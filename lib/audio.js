// const fs = require('fs-extra')
const path = require('path')
const Acb = require('acb')
let HCADecoder = null
const lame = require('./lame.js')
try {
  HCADecoder = require('hca-decoder').HCADecoder
} catch (_) {}
const config = require('./config')

// const { Reader } = require('wav')
// const { Encoder } = require('lame')

function acb2hca (acb, targetDir) {
  const utf = new Acb(acb)
  return utf.extract(targetDir)
    .then(() => {
      targetDir = targetDir || path.join(path.dirname(acb), `_acb_${path.basename(acb)}`)
      const fileList = utf.getFileList()
      const hcaList = fileList.map(({ Name }) => path.join(targetDir, Name))
      hcaList.dirname = targetDir
      return hcaList
    })
}

function hca2wav (hca) {
  if (!HCADecoder) return Promise.reject(new Error('failed to load hca.node.'))
  return new Promise((resolve, reject) => {
    const decoder = new HCADecoder()
    decoder.decodeToWaveFile(hca, (err, wav) => {
      if (err) reject(err)
      else resolve(wav)
    })
  })
}

function wav2mp3 (wav, mp3, onProgress) {
  if (!mp3) mp3 = path.join(path.dirname(wav), path.parse(wav).name + '.mp3')

  return new Promise((resolve, reject) => {
    if (lame) {
      let start = 0
      lame.wav2mp3(wav, mp3, function (err) {
        if (err) {
          reject(err)
          return
        }
        resolve(mp3)
      }, function (data) {
        if (typeof onProgress === 'function') {
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
        }
      })
    } else {
      reject(new Error('failed to load lame.node.'))
    }
  })
}

function hca2mp3 (hca, mp3, onProgress) {
  if (!mp3) mp3 = path.join(path.dirname(hca), path.parse(hca).name + '.mp3')
  return hca2wav(hca)
    .then(wav => wav2mp3(wav, mp3, onProgress))
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

function acb2mp3 (acbPath, singleComplete, onWav2Mp3Progress) {
  return acb2hca(acbPath)
    .then(hcas => {
      const total = hcas.length
      let completed = 0
      return Promise.all(
        hcas.map(hca => hca2wav(hca)
          .then(wav => wav2mp3(wav, null, typeof onWav2Mp3Progress === 'function' ? (prog) => {
            onWav2Mp3Progress(completed, total, prog)
          } : null))
          .then(mp3 => {
            if (typeof singleComplete === 'function') singleComplete(++completed, total, mp3)
            return mp3
          })
        )
      ).then(mp3s => {
        mp3s.dirname = hcas.dirname
        return mp3s
      })
    })
}

module.exports = {
  acb2hca,
  acb2wav,
  acb2mp3,
  hca2wav,
  hca2mp3,
  wav2mp3
}
