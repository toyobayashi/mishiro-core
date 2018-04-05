# cgss.js

## usage

``` javascript
const cgss = require('cgss')
const Client = cgss.Client
const {
  downloadManifest,
  downloadAsset,
  downloadSound,
  downloadDatabase,
  downloadSpread,
  downloadIcon
} = cgss.downloader
const {
  acb2hca,
  hca2wav,
  acb2wav
} = cgss.audio

const client = new cgss.Client('123456789:987654321:1a3b5c7d-1234-4bcd-9efa-8e6f4a2b7c5d')

client.check().then(resVer => console.log(resVer))

// see test.
```

## License
* MIT
