const path = require('path')
/** @type {import('fs')} */
const fs = process.versions.electron ? require('original-fs') : require('fs')
/** @type {typeof import('usm-decrypter').USMDecrypter} */
let USMDecrypter = null
try {
  USMDecrypter = require('usm-decrypter').USMDecrypter
} catch (_) {}

function demuxAsync (usmFile, outdir) {
  return new Promise((resolve, reject) => {
    if (!USMDecrypter) return reject(new Error('failed to load usm.node.'))
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
