{
  'variables': { 'target_arch%': 'ia32' }, # default for node v0.6.x

  'target_defaults': {
    'default_configuration': 'Debug',
    'configurations': {
      'Debug': {
        'defines': [ 'DEBUG', '_DEBUG' ],
        'msvs_settings': {
          'VCCLCompilerTool': {
            'RuntimeLibrary': 1, # static debug
          },
        },
      },
      'Release': {
        'defines': [ 'NDEBUG' ],
        'msvs_settings': {
          'VCCLCompilerTool': {
            'RuntimeLibrary': 0, # static release
          },
        },
      }
    },
    'msvs_settings': {
      'VCLinkerTool': {
        'GenerateDebugInformation': 'true',
      },
    },

    'defines': [
    ],
    'include_dirs': [
      'lib',
    ],
    'conditions': [
      ['OS=="win"', {
        'defines': [
        ]
      }]
    ],
  },

  'targets': [

    # libmp3lame
    {
      'target_name': 'lz4',
      'product_prefix': 'lib',
      'type': 'static_library',
      'sources': [
        'lib/lz4.c',
        'lib/lz4frame.c',
        'lib/lz4hc.c',
        'lib/xxhash.c',
      ],
      'direct_dependent_settings': {
        'include_dirs': [
          'lib',
        ],
      },
    }
  ]
}
