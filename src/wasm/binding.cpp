#include <emscripten/bind.h>
#include <string>

extern "C" int transcode_aac(const char* input, const char* output, int64_t bit_rate);
extern "C" int transcoding(const char* input, const char* output, int64_t bit_rate);

int js_transcode_aac(const std::string& input, const std::string& output, int bit_rate) {
  return transcode_aac(input.c_str(), output.c_str(), bit_rate);
}

int js_transcoding(const std::string& input, const std::string& output, int bit_rate) {
  return transcoding(input.c_str(), output.c_str(), bit_rate);
}

EMSCRIPTEN_BINDINGS(audio) {
  emscripten::function("transcodeAac", js_transcode_aac);
  emscripten::function("transcoding", js_transcoding);
}
