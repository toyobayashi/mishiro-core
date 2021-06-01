{
  'variables': {
    'target_arch%': 'ia32', # built for a 32-bit CPU by default
  },
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
  },

  'targets': [
    {
      'target_name': 'fdk-aac',
      'product_prefix': 'lib',
      'type': 'static_library',
      'sources': [
	      "<!@(node -p \"require('fs').readdirSync('./libAACdec/src').filter(item=>require('path').extname(item)==='.cpp').map(f=>'libAACdec/src/'+f).join(' ')\")",
	      "<!@(node -p \"require('fs').readdirSync('./libAACenc/src').filter(item=>require('path').extname(item)==='.cpp').map(f=>'libAACenc/src/'+f).join(' ')\")",
	      "<!@(node -p \"require('fs').readdirSync('./libArithCoding/src').filter(item=>require('path').extname(item)==='.cpp').map(f=>'libArithCoding/src/'+f).join(' ')\")",
	      "<!@(node -p \"require('fs').readdirSync('./libDRCdec/src').filter(item=>require('path').extname(item)==='.cpp').map(f=>'libDRCdec/src/'+f).join(' ')\")",
	      "<!@(node -p \"require('fs').readdirSync('./libFDK/src').filter(item=>require('path').extname(item)==='.cpp').map(f=>'libFDK/src/'+f).join(' ')\")",
	      "<!@(node -p \"require('fs').readdirSync('./libMpegTPDec/src').filter(item=>require('path').extname(item)==='.cpp').map(f=>'libMpegTPDec/src/'+f).join(' ')\")",
	      "<!@(node -p \"require('fs').readdirSync('./libMpegTPEnc/src').filter(item=>require('path').extname(item)==='.cpp').map(f=>'libMpegTPEnc/src/'+f).join(' ')\")",
	      "<!@(node -p \"require('fs').readdirSync('./libPCMutils/src').filter(item=>require('path').extname(item)==='.cpp').map(f=>'libPCMutils/src/'+f).join(' ')\")",
	      "<!@(node -p \"require('fs').readdirSync('./libSACdec/src').filter(item=>require('path').extname(item)==='.cpp').map(f=>'libSACdec/src/'+f).join(' ')\")",
	      "<!@(node -p \"require('fs').readdirSync('./libSACenc/src').filter(item=>require('path').extname(item)==='.cpp').map(f=>'libSACenc/src/'+f).join(' ')\")",
	      "<!@(node -p \"require('fs').readdirSync('./libSBRdec/src').filter(item=>require('path').extname(item)==='.cpp').map(f=>'libSBRdec/src/'+f).join(' ')\")",
	      "<!@(node -p \"require('fs').readdirSync('./libSBRenc/src').filter(item=>require('path').extname(item)==='.cpp').map(f=>'libSBRenc/src/'+f).join(' ')\")",
	      "<!@(node -p \"require('fs').readdirSync('./libSYS/src').filter(item=>require('path').extname(item)==='.cpp').map(f=>'libSYS/src/'+f).join(' ')\")",
		    'wavreader.c'
      ],
      'defines': [
        'PIC',
        'HAVE_CONFIG_H',
      ],
      'include_dirs': [
        'libAACdec/include',
        'libAACenc/include',
        'libArithCoding/include',
        'libDRCdec/include',
        'libFDK/include',
        'libMpegTPDec/include',
        'libMpegTPEnc/include',
        'libPCMutils/include',
        'libSACdec/include',
        'libSACenc/include',
        'libSBRdec/include',
        'libSBRenc/include',
        'libSYS/include'
      ],
      'direct_dependent_settings': {
        'include_dirs': [
          'libAACdec/include',
          'libAACenc/include',
          'libArithCoding/include',
          'libDRCdec/include',
          'libFDK/include',
          'libMpegTPDec/include',
          'libMpegTPEnc/include',
          'libPCMutils/include',
          'libSACdec/include',
          'libSACenc/include',
          'libSBRdec/include',
          'libSBRenc/include',
          'libSYS/include'
        ],
      },
    }
  ]
}
