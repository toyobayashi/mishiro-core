# mishiro-core

## usage

``` javascript
const { downloader, Client, audio, util } = require('mishiro-core')

const {
  downloadManifest,
  downloadAsset,
  downloadSound,
  downloadDatabase,
  downloadSpread,
  downloadIcon
} = downloader

const {
  acb2hca,
  acb2wav,
  acb2mp3,
  hca2wav,
  hca2mp3,
  wav2mp3
} = audio

const {
  request,
  download,
  lz4dec
} = util

const client = new Client('123456789:987654321:1a3b5c7d-1234-4bcd-9efa-8e6f4a2b7c5d')

client.check().then(resVer => console.log(resVer))

// see test.
```

## License
* MIT
