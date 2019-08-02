#ifdef _WIN32
#include <Windows.h>
#endif

#include <cstdio>
#include "./LameAsyncWorker.h"
#include <lame.h>
#include "./wav.h"

using namespace Napi;

typedef struct EncodeData {
  double total;
  double loaded;
} EncodeData;

int LameAsyncWorker::_bitRate = 128;
bool LameAsyncWorker::_progressCallback = true;

void LameAsyncWorker::setProgressCallback(bool value) {
  _progressCallback = value;
}

bool LameAsyncWorker::getProgressCallback() {
  return _progressCallback;
}

void LameAsyncWorker::setBitRate(int rate) {
  // 16 24 32 40 48 56 64 80 96 112 128 160 192 224 256 320
  if (rate < 16) {
    rate = 16;
  } else if (rate > 320) {
    rate = 320;
  }
  LameAsyncWorker::_bitRate = rate;
}

int LameAsyncWorker::getBitRate() {
  return _bitRate;
}

LameAsyncWorker::LameAsyncWorker(const std::string& wavPath, const std::string& mp3Path, Function& callback): ThreadSafeAsyncWorker(callback) {
  _wavPath = wavPath;
  _mp3Path = mp3Path;
  _hasProgressCallback = false;
}

LameAsyncWorker::LameAsyncWorker(const std::string& wavPath, const std::string& mp3Path, Function& callback, Function& onProgress): ThreadSafeAsyncWorker(callback, onProgress) {
  _wavPath = wavPath;
  _mp3Path = mp3Path;
  _hasProgressCallback = true;
}

LameAsyncWorker::~LameAsyncWorker() {}

void LameAsyncWorker::Execute() {
  unsigned int read;
  unsigned int write;

#ifdef _WIN32
  int strlength = 0;
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

  Wav wavstruct;
  fread(&wavstruct, 1, sizeof(wavstruct), wav);

  long start = 4 * 1024;
  fseek(wav, 0L, SEEK_END);
  long wavsize = ftell(wav);
  fseek(wav, start, SEEK_SET);

#ifdef _WIN32
  wchar_t __wmp3Path[MAX_PATH] = { 0 };
  strlength = MultiByteToWideChar(CP_UTF8, 0, _mp3Path.c_str(), -1, NULL, 0);
  MultiByteToWideChar(CP_UTF8, 0, _mp3Path.c_str(), -1, __wmp3Path, strlength);
  FILE *mp3 = _wfopen(__wmp3Path, L"wb+");
#else
  FILE *mp3 = fopen(_mp3Path.c_str(), "wb+");
#endif
  
  if (!mp3) {
    fclose(wav);
    SetError("wav2mp3(): Open mp3 file failed.");
    return;
  }

  const int WAV_SIZE = 8192;
  const int MP3_SIZE = 8192;

  const int CHANNEL = (int)wavstruct.fmt.NumChannels;

  short int *wavBuffer = new short int[WAV_SIZE * CHANNEL];
  unsigned char *mp3Buffer = new unsigned char[MP3_SIZE];

  lame_t lame = lame_init();
  lame_set_in_samplerate(lame, (int)wavstruct.fmt.SampleRate);
  lame_set_num_channels(lame, CHANNEL);
  lame_set_mode(lame, CHANNEL == 1 ? MONO : (_bitRate < 160 ? JOINT_STEREO : STEREO));
  // lame_set_VBR(lame, vbr_default);
  lame_set_brate(lame, _bitRate);
  lame_init_params(lame);

  long loaded = start;
  do {
    read = fread(wavBuffer, sizeof(short int) * CHANNEL, WAV_SIZE, wav);
    loaded += read * sizeof(short int) * CHANNEL;
    if (read != 0) {
      if (CHANNEL == 1) {
        write = lame_encode_buffer(lame, wavBuffer, NULL, read, mp3Buffer, MP3_SIZE);
      } else {
        write = lame_encode_buffer_interleaved(lame, wavBuffer, read, mp3Buffer, MP3_SIZE);
      }
      
      if (_progressCallback && _hasProgressCallback) {
        EncodeData* data = new EncodeData;
        data->loaded = (double)loaded;
        data->total = (double)wavsize;
        EmitProgress(data);
      }

    } else {
      write = lame_encode_flush(lame, mp3Buffer, MP3_SIZE);
    }
    fwrite(mp3Buffer, sizeof(unsigned char), write, mp3);
  } while (read != 0);

  delete[] wavBuffer;
  delete[] mp3Buffer;
  // lame_mp3_tags_fid(lame, mp3);
  lame_close(lame);
  fclose(mp3);
  fclose(wav);
}

void LameAsyncWorker::OnProgress(void* data) {
  Napi::Env env = Env();
  HandleScope scope(env);
  EncodeData* value = (EncodeData*)data;
  Object res = Object::New(env);
  res["total"] = Number::New(env, value->total);
  res["loaded"] = Number::New(env, value->loaded);
  res["percentage"] = Number::New(env, 100 * value->loaded / value->total);
  ProgressCallback().Call({ res });
  delete value;
}

void LameAsyncWorker::OnOK() {
  HandleScope scope(Env());
  // callback(null)
  Callback().Call({ Env().Null() });
}
void LameAsyncWorker::OnError(const Napi::Error& err) {
  // callback(err)
  HandleScope scope(Env());
  Callback().Call({ err.Value() });
}
