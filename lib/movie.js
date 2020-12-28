const path = require('path')
/** @type {import('fs')} */
const fs = process.versions.electron ? require('original-fs') : require('fs')
const { USMDecrypter } = require('usm-decrypter')

function demuxAsync (usmFile, outdir) {
  return new Promise((resolve, reject) => {
    outdir = outdir || path.join(path.dirname(usmFile), path.parse(usmFile).name + '.demux')
    fs.mkdirSync(outdir, { recursive: true })
    const usm = new USMDecrypter()
    usm.demux(usmFile, outdir, function (err, p) {
      if (err) {
        reject(err)
        fs.rmdirSync(outdir)
        return
      }
      resolve(p)
    })
  })
}

exports.demuxAsync = demuxAsync
