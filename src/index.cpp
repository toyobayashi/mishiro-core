// 包含DemoAsyncWorker类的头文件，实现将在后面给出
#include "./LameAsyncWorker.h"

using namespace Napi;

static Value _wav2mp3(const CallbackInfo& info) {
  Env env = info.Env();

  if (info.Length() != 3) {
    Error::New(env, "wav2mp3(): arguments.length !== 3").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[0].IsString()) {
    Error::New(env, "wav2mp3(): typeof arguments[0] !== 'string'").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[1].IsString()) {
    Error::New(env, "wav2mp3(): typeof arguments[1] !== 'string'").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[2].IsFunction()) {
    Error::New(env, "wav2mp3(): typeof arguments[2] !== 'function'").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  Function callback = info[2].As<Function>();
  LameAsyncWorker *w = new LameAsyncWorker(info[0].As<String>().Utf8Value(), info[1].As<String>().Utf8Value(), callback);
  w->Queue();

  return env.Undefined();
}

Object init(Env env, Object exports) {
  Function module = Function::New(env, _wav2mp3);
  return module;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, init)
