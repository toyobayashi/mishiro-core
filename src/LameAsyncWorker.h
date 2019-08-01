#ifndef __LAME_ASYNC_WORKER_H__
#define __LAME_ASYNC_WORKER_H__

#define NAPI_EXPERIMENTAL // 10.7.0+ Napi::ThreadSafeFunction

#include <napi.h>
#include <string>

class LameAsyncWorker : public Napi::AsyncWorker {
  public:
    LameAsyncWorker(const std::string&, const std::string&, Napi::Function&, Napi::Function&);
    ~LameAsyncWorker();
    void Execute();
    void OnOK();
    void OnError(const Napi::Error&);
    static void setBitRate(int);
    static int getBitRate();
    static void setProgressCallback(bool);
    static bool getProgressCallback();
  private:
    std::string _wavPath;
    std::string _mp3Path;
    Napi::ThreadSafeFunction* _tsfn;
    static int _bitRate;
    static bool _progressCallback;
};

#endif // ! __LAME_ASYNC_WORKER_H__
