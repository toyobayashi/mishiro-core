/* eslint-disable no-undef */

exports.transcodeAac = function (input, output, bitRate = 160000) {
  return Module.transcodeAac(input, output, bitRate) === 0
}

/* exports.transcoding = function (input, output, bitRate = 128000) {
  return Module.transcoding(input, output, bitRate) === 0
} */
