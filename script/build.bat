@echo off

call npm.cmd install -g node-gyp@8

for /f "delims=" %%P in ('npm prefix -g') do call npm.cmd config set node_gyp "%%P\node_modules\node-gyp\bin\node-gyp.js"

call node-gyp.cmd install

call npm.cmd install

@REM powershell.exe -nologo -noprofile -command "& { $client=new-object System.Net.WebClient; $client.DownloadFile('https://github.com/toyobayashi/wasm-ffmpeg/releases/download/n4.4-1/ffmpeg-wasm-n4.4-1.zip', 'ffmpeg-wasm.n4.4-1.zip'); }"
@REM powershell.exe -nologo -noprofile -command "& { param([String]$sourceArchiveFileName, [String]$destinationDirectoryName); Add-Type -A 'System.IO.Compression.FileSystem'; Add-Type -A 'System.Text.Encoding'; [IO.Compression.ZipFile]::ExtractToDirectory($sourceArchiveFileName, $destinationDirectoryName, [System.Text.Encoding]::UTF8); exit !$?; }" -sourceArchiveFileName "ffmpeg-wasm.n4.4-1.zip" -destinationDirectoryName ".local"
@REM xcopy .local "%EMSDK%\upstream\emscripten\system\local" /Y /E

@REM call npm.cmd run build:wasm
@REM if %ERRORLEVEL% neq 0 exit /B %ERRORLEVEL%

@REM if not exist dist mkdir dist
@REM copy /Y .cgenbuild\Release\audio.js dist\
@REM copy /Y .cgenbuild\Release\audio.wasm dist\
