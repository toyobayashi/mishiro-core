#ifndef __LAME_ASYNC_WORKER_H__
#define __LAME_ASYNC_WORKER_H__

#define NAPI_EXPERIMENTAL // 10.7.0+ Napi::ThreadSafeFunction
#include <napi.h>
#include <string>

#include "EncodeData.h"

class LameAsyncWorker : public Napi::AsyncProgressQueueWorker<EncodeData> {
  public:
    LameAsyncWorker(const std::string&, const std::string&, const Napi::Function&);
    LameAsyncWorker(const std::string&, const std::string&, const Napi::Function&, const Napi::Function&);
    void Execute(const ExecutionProgress& progress);
    void OnOK();
    void OnError(const Napi::Error&);
    void OnProgress(const EncodeData* data, size_t count);
    static void setBitRate(int);
    static int getBitRate();
    static void setProgressCallback(bool);
    static bool getProgressCallback();
  private:
    std::string _wavPath;
    std::string _mp3Path;
    Napi::FunctionReference onProgress;
    static int _bitRate;
    static bool _progressCallback;
    // bool _hasProgressCallback;
};

#endif // ! __LAME_ASYNC_WORKER_H__
