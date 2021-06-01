#ifndef __LAME_ASYNC_WORKER_H__
#define __LAME_ASYNC_WORKER_H__

#define NAPI_EXPERIMENTAL // 10.7.0+ Napi::ThreadSafeFunction
#include <napi.h>
#include <string>

#include "EncodeData.h"

class LameAsyncWorker : public Napi::AsyncProgressQueueWorker<EncodeData> {
 public:
  LameAsyncWorker(const std::string& wavPath,
                  const std::string& mp3Path,
                  int bitRate,
                  int sampleRate,
                  int channels,
                  const Napi::Function& callback);
  LameAsyncWorker(const std::string& wavPath,
                  const std::string& mp3Path,
                  int bitRate,
                  int sampleRate,
                  int channels,
                  const Napi::Function& callback,
                  const Napi::Function& onProgress);
  void Execute(const ExecutionProgress& progress);
  void OnOK();
  void OnError(const Napi::Error&);
  void OnProgress(const EncodeData* data, size_t count);

 private:
  int _bitRate; // 16 24 32 40 48 56 64 80 96 112 128 160 192 224 256 320
  int _sampleRate;
  int _channels;
  std::string _wavPath;
  std::string _mp3Path;
  Napi::FunctionReference onProgress;
};

#endif // ! __LAME_ASYNC_WORKER_H__
