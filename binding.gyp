{
  "variables": {
    "module_name": "core",
    "module_path": "./dist"
  },
  'targets': [
    {
      'target_name': '<(module_name)',
      'sources': [
        'src/index.cpp',
        'src/LameAsyncWorker.cpp',
        'src/EncodeWorker.cpp',
        'src/lz4dec.c',
      ],
      'includes': [
        './common.gypi'
      ],
      'defines': [
        "NODE_API_NO_EXTERNAL_BUFFERS_ALLOWED",
      ],
      'dependencies': [
        'deps/lame/libmp3lame.gyp:mp3lame',
        'deps/lz4/lz4.gyp:lz4',
        'deps/fdk-aac/fdk-aac.gyp:fdk-aac'
      ],
    },
    {
      "target_name": "action_after_build",
      "type": "none",
      "dependencies": [ "<(module_name)" ],
      "copies": [
        {
          "files": [ "<(PRODUCT_DIR)/<(module_name).node" ],
          "destination": "<(module_path)"
        }
      ]
    }
  ]
}
