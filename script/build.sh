#!/bin/bash

npm install -g node-gyp@5
npm config set node_gyp "`npm prefix -g`/lib/node_modules/node-gyp/bin/node-gyp.js"
node-gyp install
npm install
