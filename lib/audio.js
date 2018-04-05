const fs = require('fs')
const path = require('path')
const extractACB = require('../util/acb.js')
const hcadec = require('../util/hca.js')

exports.acb2hca = acbPath => extractACB(acbPath)

exports.hca2wav = hcaPath => hcadec(hcaPath)

exports.acb2wav = function (acbPath) {
  return extractACB(acbPath).then((hcadir) => {
    let hcas = fs.readdirSync(hcadir)
    let task = []
    for (let i = 0; i < hcas.length; i++) {
      const hca = path.join(hcadir, hcas[i])
      task.push(hcadec(hca).then(wavfile => {
        if (wavfile) fs.unlink(hca, () => { })
        return wavfile
      }))
    }
    return Promise.all(task)
  })
}
