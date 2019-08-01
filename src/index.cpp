#include "./LameAsyncWorker.h"

using namespace Napi;

static Value _wav2mp3(const CallbackInfo& info) {
  Env env = info.Env();

  if (info.Length() != 4) {
    Error::New(env, "wav2mp3(): arguments.length !== 4").ThrowAsJavaScriptException();
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

  if (!info[3].IsFunction()) {
    Error::New(env, "wav2mp3(): typeof arguments[3] !== 'function'").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  Function callback = info[2].As<Function>();
  Function onProgress = info[3].As<Function>();
  LameAsyncWorker *w = new LameAsyncWorker(info[0].As<String>().Utf8Value(), info[1].As<String>().Utf8Value(), callback, onProgress);
  w->Queue();

  return env.Undefined();
}

static Value _setBitRate(const CallbackInfo& info) {
  Env env = info.Env();

  if (info.Length() != 1) {
    Error::New(env, "setBitRate(): arguments.length !== 1").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[0].IsNumber()) {
    Error::New(env, "setBitRate(): typeof arguments[0] !== 'number'").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  LameAsyncWorker::setBitRate(info[0].As<Number>().Int32Value());
  return env.Undefined();
}

static Value _getBitRate(const CallbackInfo& info) {
  Env env = info.Env();

  return Number::New(env, (double)LameAsyncWorker::getBitRate());
}

static Value _setProgressCallback(const CallbackInfo& info) {
  Env env = info.Env();

  if (info.Length() != 1) {
    Error::New(env, "setProgressCallback(): arguments.length !== 1").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[0].IsBoolean()) {
    Error::New(env, "setProgressCallback(): typeof arguments[0] !== 'boolean'").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  LameAsyncWorker::setProgressCallback(info[0].As<Boolean>().Value());
  return env.Undefined();
}

static Value _getProgressCallback(const CallbackInfo& info) {
  Env env = info.Env();

  return Boolean::New(env, LameAsyncWorker::getProgressCallback());
}

static Object _index(Env env, Object exports) {
  exports["wav2mp3"] = Function::New(env, _wav2mp3, "wav2mp3");
  exports["setBitRate"] = Function::New(env, _setBitRate, "setBitRate");
  exports["getBitRate"] = Function::New(env, _getBitRate, "getBitRate");
  exports["setProgressCallback"] = Function::New(env, _setProgressCallback, "setProgressCallback");
  exports["getProgressCallback"] = Function::New(env, _getProgressCallback, "getProgressCallback");
  // module.exports = { wav2mp3, setBitRate, getBitRate }
  return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, _index)
