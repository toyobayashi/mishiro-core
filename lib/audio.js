const fs = require('fs-extra')
const path = require('path')
const Acb = require('acb')
const { HCADecoder } = require('hca-decoder')
const { Reader } = require('wav')
const { Encoder } = require('lame')

function acb2hca (acb, targetDir) {
  let utf = new Acb(acb)
  return utf.extract(targetDir)
    .then(() => {
      targetDir = targetDir || path.join(path.dirname(acb), `_acb_${path.basename(acb)}`)
      let fileList = utf.getFileList()
      let hcaList = fileList.map(({ Name }) => path.join(targetDir, Name))
      hcaList.dirname = targetDir
      return hcaList
    })
}

function hca2wav (hca) {
  return new Promise((resolve, reject) => {
    const decoder = new HCADecoder()
    decoder.decodeToWaveFile(hca, (err, wav) => {
      if (err) reject(err)
      else resolve(wav)
    })
  })
}

function wav2mp3 (wav, mp3) {
  if (!mp3) mp3 = path.join(path.dirname(wav), path.parse(wav).name + '.mp3')

  return new Promise((resolve, reject) => {
    let input = fs.createReadStream(wav)
    let output = fs.createWriteStream(mp3)

    output.on('close', () => {
      resolve(mp3)
    })

    let reader = new Reader()

    reader.on('format', format => {
      let encoder = new Encoder(format)
      reader.pipe(encoder).pipe(output)
    })

    reader.on('error', err => {
      reject(err)
    })

    input.pipe(reader)
  })
}

function hca2mp3 (hca, mp3) {
  if (!mp3) mp3 = path.join(path.dirname(hca), path.parse(hca).name + '.mp3')
  return hca2wav(hca)
    .then(wav => wav2mp3(wav, mp3))
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

function acb2mp3 (acbPath, singleComplete) {
  return acb2hca(acbPath)
    .then(hcas => {
      const total = hcas.length
      let completed = 0
      return Promise.all(
        hcas.map(hca => hca2wav(hca)
          .then(wav => wav2mp3(wav))
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
