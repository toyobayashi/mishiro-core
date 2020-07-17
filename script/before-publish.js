const path = require('path')
const fs = require('fs-extra')

if (process.env.NPMTOKEN) {
  fs.writeFileSync(path.join(__dirname, '../.npmrc'), `//registry.npmjs.org/:_authToken=${process.env.NPMTOKEN}
registry=https://registry.npmjs.org/
always-auth=true
`)
} else {
  process.exit(1)
}
