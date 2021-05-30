/* eslint-disable no-undef */

exports.transcodeAac = function (input, output, bitRate = 160000) {
  Module.transcodeAac(input, output, bitRate)
}

/* exports.transcoding = function (input, output, bitRate = 128000) {
  Module.transcoding(input, output, bitRate)
} */
