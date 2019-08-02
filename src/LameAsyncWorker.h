#ifndef __LAME_ASYNC_WORKER_H__
#define __LAME_ASYNC_WORKER_H__

#define NAPI_EXPERIMENTAL // 10.7.0+ Napi::ThreadSafeFunction

#include "ThreadSafeAsyncWorker.h"
#include <string>

class LameAsyncWorker : public ThreadSafeAsyncWorker {
  public:
    LameAsyncWorker(const std::string&, const std::string&, const Napi::Function&);
    LameAsyncWorker(const std::string&, const std::string&, const Napi::Function&, const Napi::Function&);
    ~LameAsyncWorker();
    void Execute();
    void OnProgress(void* data);
    void OnOK();
    void OnError(const Napi::Error&);
    static void setBitRate(int);
    static int getBitRate();
    static void setProgressCallback(bool);
    static bool getProgressCallback();
  private:
    std::string _wavPath;
    std::string _mp3Path;
    static int _bitRate;
    static bool _progressCallback;
    bool _hasProgressCallback;
};

#endif // ! __LAME_ASYNC_WORKER_H__
