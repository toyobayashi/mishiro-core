#ifndef __LAME_ASYNC_WORKER_H__
#define __LAME_ASYNC_WORKER_H__

#include <napi.h>
#include <string>

class LameAsyncWorker : public Napi::AsyncWorker {
  public:
    LameAsyncWorker(const std::string&, const std::string&, Napi::Function&);
    ~LameAsyncWorker();
    void Execute();
    void OnOK();
    void OnError(const Napi::Error&);
    static void setBitRate(int);
    static int getBitRate();
  private:
    std::string _wavPath;
    std::string _mp3Path;
    Napi::ThreadSafeFunction _tsfn;
    static int _bitRate;
};

#endif // ! __LAME_ASYNC_WORKER_H__
