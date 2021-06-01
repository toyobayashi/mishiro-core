#ifdef _WIN32
#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif
#include <Windows.h>
#endif

#include <cstdio>
#include "./LameAsyncWorker.h"
#include <lame.h>
#include "./wav.h"
#include "InstanceData.h"

using namespace Napi;

LameAsyncWorker::LameAsyncWorker(const std::string& wavPath,
                                 const std::string& mp3Path,
                                 int bitRate,
                                 int sampleRate,
                                 int channels,
                                 const Napi::Function& callback): AsyncProgressQueueWorker(callback) {
  _bitRate = bitRate;
  _sampleRate = sampleRate;
  _channels = channels;
  _wavPath = wavPath;
  _mp3Path = mp3Path;
}

LameAsyncWorker::LameAsyncWorker(const std::string& wavPath,
                                 const std::string& mp3Path,
                                 int bitRate,
                                 int sampleRate,
                                 int channels,
                                 const Napi::Function& callback,
                                 const Napi::Function& onProgress): AsyncProgressQueueWorker(callback) {
  _bitRate = bitRate;
  _sampleRate = sampleRate;
  _channels = channels;
  _wavPath = wavPath;
  _mp3Path = mp3Path;
  this->onProgress = Napi::Persistent(onProgress);
}

void LameAsyncWorker::Execute(const ExecutionProgress& progress) {
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
  read = fread(&wavstruct, 1, sizeof(wavstruct), wav);

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

  const int WAV_SIZE = 128 * 1024;
  const int MP3_SIZE = 128 * 1024;

  const int CHANNEL = (int)wavstruct.fmt.NumChannels;
  const int channels = _channels == 0 ? CHANNEL : _channels;
  const int br = _bitRate == 0 ? 128 : _bitRate;
  const int samplerate = _sampleRate == 0 ? (int)wavstruct.fmt.SampleRate : _sampleRate;

  short int *wavBuffer = new short int[WAV_SIZE * channels];
  unsigned char *mp3Buffer = new unsigned char[MP3_SIZE];

  lame_t lame = lame_init();
  lame_set_in_samplerate(lame, samplerate);
  lame_set_num_channels(lame, channels);
  lame_set_mode(lame, channels == 1 ? MONO : (br < 160 ? JOINT_STEREO : STEREO));
  // lame_set_VBR(lame, vbr_default);
  lame_set_brate(lame, br);
  lame_init_params(lame);

  long loaded = start;
  bool _progressCallback = Env().GetInstanceData<AddonGlobalData>()->progressCallback;
  do {
    read = fread(wavBuffer, sizeof(short int) * channels, WAV_SIZE, wav);
    loaded += read * sizeof(short int) * channels;
    if (read != 0) {
      if (channels == 1) {
        write = lame_encode_buffer(lame, wavBuffer, NULL, read, mp3Buffer, MP3_SIZE);
      } else {
        write = lame_encode_buffer_interleaved(lame, wavBuffer, read, mp3Buffer, MP3_SIZE);
      }
      
      if (_progressCallback && !this->onProgress.IsEmpty()) {
        EncodeData data;
        data.loaded = (double)loaded;
        data.total = (double)wavsize;
        progress.Send(&data, 1);
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

void LameAsyncWorker::OnProgress(const EncodeData* data, size_t /* count */) {
  Napi::Env env = Env();
  HandleScope scope(env);
  Object res = Object::New(env);
  const EncodeData& value = data[0];
  res["total"] = Number::New(env, value.total);
  res["loaded"] = Number::New(env, value.loaded);
  res["percentage"] = Number::New(env, 100 * value.loaded / value.total);
  this->onProgress.Call({ res });
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
