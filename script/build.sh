#!/bin/bash

npm install -g node-gyp@8
npm config set node_gyp "`npm prefix -g`/lib/node_modules/node-gyp/bin/node-gyp.js"
node-gyp install
npm install

# curl -O -L https://github.com/toyobayashi/wasm-ffmpeg/releases/download/n4.4-1/ffmpeg-wasm-n4.4-1.zip
# mkdir -p ./.local
# unzip ffmpeg-wasm-n4.4-1.zip -d ./.local
# cp -rpf ./.local/* $EMSDK/upstream/emscripten/system/local
# npm run build:wasm
# if [ "$?" -ne 0 ]; then exit $?; fi

# mkdir -p ./dist
# cp -rpf ./.cgenbuild/Release/audio.js ./dist/
# cp -rpf ./.cgenbuild/Release/audio.wasm ./dist/
