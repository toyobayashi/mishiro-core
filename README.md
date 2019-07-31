# mishiro-core

``` bash
$ npm install mishiro-core
```

## Require

* Node.js >= 10.7.0 || electron >= 4.0.0 (Node.js 10.11.0)
* Python 2.7
* [Windows] Visual Studio 2017/2019 with C++ build tools and .NET
* [MacOS] Xcode Command Line Tools

## Usage

``` javascript
const { Downloader, Client, audio, util, config } = require('mishiro-core')

let downloader = new Downloader() // download game resources

const {
  acb2hca,
  acb2wav,
  acb2mp3,
  hca2wav,
  hca2mp3,
  wav2mp3
} = audio // decode music

const {
  Lz4, // LZ4 decompression class
  unpackTexture2D // unpack pictures from unity3d assets bundle
} = util

const client = new Client('123456789:987654321:1a3b5c7d-1234-4bcd-9efa-8e6f4a2b7c5d')

// check game resource version
client.check().then(resVer => console.log(resVer))

// for more details, see index.d.ts and test.
```

## License
* MIT
