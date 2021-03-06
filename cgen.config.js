const cgen = require('@tybys/cgen')

module.exports = cgen.defineFunctionConfig(function (_options, { isDebug }) {
  const debugFlags = [
    '-sDISABLE_EXCEPTION_CATCHING=0',
    '-sSAFE_HEAP=1'
  ]

  const commonFlags = [
    '--bind',
    // '-sINITIAL_MEMORY=33554432',
    '-sALLOW_MEMORY_GROWTH=1',
    ...(isDebug ? debugFlags : [])
  ]

  return {
    project: 'audio',
    targets: [
      {
        name: 'audio',
        type: 'exe',
        sources: [
          './src/wasm/transcode_aac.c',
          // './src/wasm/transcoding.c',
          './src/wasm/binding.cpp'
        ],
        libs: [ // $EMSDK/upstream/emscripten/system/local/lib
          'avcodec',
          'avformat',
          'avutil',
          'swresample',
          'mp3lame'/* ,
          'avfilter',
          'swscale' */
        ],
        emwrap: {
          wrapScript: './src/wasm/wrap.js',
          exportsOnInit: ['FS', 'NODEFS']
        },
        compileOptions: [...commonFlags],
        linkOptions: [...commonFlags, '-lnodefs.js']
      }
    ]
  }
})
