{
  "variables": {
    "module_name": "core",
    "module_path": "./dist",
    "PRODUCT_DIR": "./build/Release"
  },
  'targets': [
    {
      'target_name': '<(module_name)',
      'sources': [
        'src/index.cpp',
        'src/LameAsyncWorker.cpp',
        'src/lz4dec.c',
      ],
      'includes': [
        './common.gypi'
      ],
      'dependencies': [
        'deps/lame/libmp3lame.gyp:mp3lame',
        'deps/lz4/lz4.gyp:lz4',
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
