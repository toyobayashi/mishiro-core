const path = require('path')
const fs = require('fs-extra')

fs.writeFileSync(path.join(__dirname, '../.npmrc'), `//registry.npmjs.org/:_authToken=\${NPMTOKEN}
registry=https://registry.npmjs.org/
always-auth=true
`, 'utf8')
