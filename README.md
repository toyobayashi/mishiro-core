# mishiro-core

## Require

* Node.js >= 8.0.0
* Python 2.7
* [Windows] Visual Studio 2015/2017 and .NET 4.5.1
* [MacOS] Xcode Command Line Tools

## Usage

``` javascript
const { Downloader, Client, audio, util } = require('mishiro-core')

let downloader = new Downloader()

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
  lz4dec
} = util

const client = new Client('123456789:987654321:1a3b5c7d-1234-4bcd-9efa-8e6f4a2b7c5d')

client.check().then(resVer => console.log(resVer))

// see index.d.ts and test.
```

## License
* MIT
