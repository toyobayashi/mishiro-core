@echo off

call npm.cmd install -g node-gyp@5

for /f "delims=" %%P in ('npm prefix -g') do call npm.cmd config set node_gyp "%%P\node_modules\node-gyp\bin\node-gyp.js"

call node-gyp.cmd install

call npm.cmd install
