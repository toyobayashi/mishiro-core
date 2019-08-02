#include "./LameAsyncWorker.h"

using namespace Napi;

static Value _wav2mp3(const CallbackInfo& info) {
  Env env = info.Env();

  std::string functionSignature = "wav2mp3(wavPath: string, mp3Path: string, onComplete: (err: Error | null) => void, onProgress?: (progress: { total: number; loaded: number; percentage: number }) => void)";

  if (info.Length() < 3) {
    TypeError::New(env, functionSignature + ": arguments.length < 3").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[0].IsString()) {
    TypeError::New(env, functionSignature + ": typeof wavPath !== 'string'").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[1].IsString()) {
    TypeError::New(env, functionSignature + ": typeof mp3Path !== 'string'").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[2].IsFunction()) {
    TypeError::New(env, functionSignature + ": typeof onComplete !== 'function'").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() > 3) {
    if (!info[3].IsFunction()) {
      TypeError::New(env, functionSignature + ": typeof onProgress !== 'function'").ThrowAsJavaScriptException();
      return env.Undefined();
    }
    LameAsyncWorker *w = new LameAsyncWorker(
      info[0].As<String>().Utf8Value(),
      info[1].As<String>().Utf8Value(),
      info[2].As<Function>(),
      info[3].As<Function>()
    );
    w->Queue();
  } else {
    LameAsyncWorker *w = new LameAsyncWorker(
      info[0].As<String>().Utf8Value(),
      info[1].As<String>().Utf8Value(),
      info[2].As<Function>()
    );
    w->Queue();
  }

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
