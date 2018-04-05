const { dec } = require('bindings')('hca.node')
const path = require('path')

function hcadec (hca) {
  return new Promise((resolve, reject) => {
    dec(hca, result => {
      if (result) resolve(path.join(path.parse(hca).dir, path.parse(hca).name + '.wav'))
      else reject(new Error(`Failed to decode ${path.parse(hca).base}`))
    })
  })
}

module.exports = hcadec
