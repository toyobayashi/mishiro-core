# mishiro-core

<!-- [![Build status](https://travis-ci.com/toyobayashi/mishiro-core.svg?branch=master)](https://travis-ci.com/toyobayashi/mishiro-core/) -->
[![Build](https://github.com/toyobayashi/mishiro-core/workflows/Build/badge.svg)](https://github.com/toyobayashi/mishiro-core/actions?query=workflow%3ABuild)

``` bash
$ npm install mishiro-core
```

## Require

* Node.js >= 10.8.0 || electron >= 4.0.0 (Node.js 10.11.0)
* Python 2.7
* [Windows] Visual Studio 2017/2019 with C++ build tools and .NET
* [Linux] make & gcc & g++
* [MacOS] Xcode Command Line Tools

## Usage

``` javascript
const { Downloader, Client, audio, util, config } = require('mishiro-core')

let downloader = new Downloader() // download game resources

const {
  acb2hca,
  acb2wav,
  acb2mp3,
  acb2aac,
  hca2wav,
  hca2mp3,
  hca2aac,
  wav2mp3,
  wav2aac,
  getHcaInfo,
  MP3Encoder,
  AACEncoder
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

## Test

``` bash
# use latest npm (6.10.2+ with node-gyp 5.x)
# npm 6.9.0 use internal node-gyp whose version is v3
# it's important to match the globally installed node-gyp version
# because the location where node-gyp v5 cache the node header
# is different from node-gyp v3
$ npm install -g npm

# install node-gyp (5+)
$ npm install -g node-gyp

# install node C++ header
$ node-gyp install # --target=<node version>

$ npm install # --no-package-lock

# npm run test-check
# npm run test-download
# npm run test-audio
$ npm test
```

## License
* MIT
