#ifdef _WIN32
#include <Windows.h>
#endif

#include <cstdio>
#include <cstdlib>
#include "./LameAsyncWorker.h"
#include <lame.h>

using namespace Napi;

LameAsyncWorker::LameAsyncWorker(const std::string& wavPath, const std::string& mp3Path, Function& callback): _wavPath(wavPath), _mp3Path(mp3Path), AsyncWorker(callback) {}

LameAsyncWorker::~LameAsyncWorker() {}

void LameAsyncWorker::Execute() {
  unsigned int read;
  unsigned int write;
  int strlength = 0;

#ifdef _WIN32
  wchar_t __wwavPath[MAX_PATH] = { 0 };
  strlength = MultiByteToWideChar(CP_UTF8, 0, _wavPath.c_str(), -1, NULL, 0);
  MultiByteToWideChar(CP_UTF8, 0, _wavPath.c_str(), -1, __wwavPath, strlength);
  FILE *wav = _wfopen(__wwavPath, L"rb");
#else
  FILE *wav = fopen(_wavPath.c_str(), "rb");
#endif
  
  if (!wav) {
    SetError("wav2mp3(): Open wav file failed.");
    return;
  }

  long start = 4 * 1024;
  fseek(wav, 0L, SEEK_END);
  long wavsize = ftell(wav);
  fseek(wav, start, SEEK_SET);

#ifdef _WIN32
  wchar_t __wmp3Path[MAX_PATH] = { 0 };
  strlength = MultiByteToWideChar(CP_UTF8, 0, _mp3Path.c_str(), -1, NULL, 0);
  MultiByteToWideChar(CP_UTF8, 0, _mp3Path.c_str(), -1, __wmp3Path, strlength);
  FILE *mp3 = _wfopen(__wmp3Path, L"wb");
#else
  FILE *mp3 = fopen(_mp3Path.c_str(), "wb");
#endif
  
  if (!mp3) {
    fclose(wav);
    SetError("wav2mp3(): Open mp3 file failed.");
    return;
  }

  const int WAV_SIZE = 8192;
  const int MP3_SIZE = 8192;

  const int CHANNEL = 2;

  short int *wav_buffer = (short int*)malloc(WAV_SIZE * CHANNEL * sizeof(short int));
  unsigned char *mp3_buffer = (unsigned char*)malloc(MP3_SIZE * sizeof(unsigned char));

  lame_t lame = lame_init();
  lame_set_in_samplerate(lame, 44100);
  lame_set_num_channels(lame, CHANNEL);
  // lame_set_mode(lame, MONO);
  // lame_set_VBR(lame, vbr_default);
  lame_set_brate(lame, 128);
  lame_init_params(lame);

  long total = start;
  do {
    read = fread(wav_buffer, sizeof(short int) * CHANNEL, WAV_SIZE, wav);
    total += read * sizeof(short int) * CHANNEL;
    if (read != 0) {
      write = lame_encode_buffer_interleaved(lame, wav_buffer, read, mp3_buffer, MP3_SIZE);
    } else {
      write = lame_encode_flush(lame, mp3_buffer, MP3_SIZE);
    }
    fwrite(mp3_buffer, sizeof(unsigned char), write, mp3);
  } while (read != 0);

  free(wav_buffer);
  free(mp3_buffer);
  // lame_mp3_tags_fid(lame, mp3);
  lame_close(lame);
  fclose(mp3);
  fclose(wav);
}

void LameAsyncWorker::OnOK() {
  HandleScope scope(Env());
  // callback(null, { finish: true })
  Callback().Call({ Env().Null() });
}
void LameAsyncWorker::OnError(const Napi::Error& err) {
  // callback(err, null)
  HandleScope scope(Env());
  Callback().Call({ err.Value() });
}
