#include "LameAsyncWorker.h"
#include "EncodeWorker.hpp"
#include "lz4dec.h"
#include "InstanceData.h"

using namespace Napi;

static Value _wav2mp3(const CallbackInfo& info) {
  Env env = info.Env();

  std::string functionSignature = "wav2mp3(wavPath: string, mp3Path: string, bitRate: number, sampleRate: number, channels: number, onComplete: (err: Error | null) => void, onProgress?: (progress: { total: number; loaded: number; percentage: number }) => void)";

  if (info.Length() < 6) {
    TypeError::New(env, functionSignature + ": arguments.length < 6").ThrowAsJavaScriptException();
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

  if (!info[2].IsNumber()) {
    Napi::TypeError::New(env, functionSignature + ": typeof bitRate !== 'number'").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[3].IsNumber()) {
    Napi::TypeError::New(env, functionSignature + ": typeof sampleRate !== 'number'").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[4].IsNumber()) {
    Napi::TypeError::New(env, functionSignature + ": typeof channels !== 'number'").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[5].IsFunction()) {
    TypeError::New(env, functionSignature + ": typeof onComplete !== 'function'").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() > 6) {
    if (!info[6].IsFunction()) {
      TypeError::New(env, functionSignature + ": typeof onProgress !== 'function'").ThrowAsJavaScriptException();
      return env.Undefined();
    }
    LameAsyncWorker *w = new LameAsyncWorker(
      info[0].As<String>().Utf8Value(),
      info[1].As<String>().Utf8Value(),
      info[2].As<Napi::Number>().Int32Value(),
      info[3].As<Napi::Number>().Int32Value(),
      info[4].As<Napi::Number>().Int32Value(),
      info[5].As<Function>(),
      info[6].As<Function>()
    );
    w->Queue();
  } else {
    LameAsyncWorker *w = new LameAsyncWorker(
      info[0].As<String>().Utf8Value(),
      info[1].As<String>().Utf8Value(),
      info[2].As<Napi::Number>().Int32Value(),
      info[3].As<Napi::Number>().Int32Value(),
      info[4].As<Napi::Number>().Int32Value(),
      info[5].As<Function>()
    );
    w->Queue();
  }

  return env.Undefined();
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

  AddonGlobalData* data = env.GetInstanceData<AddonGlobalData>();
  data->progressCallback = info[0].As<Boolean>().Value();
  return env.Undefined();
}

static Value _getProgressCallback(const CallbackInfo& info) {
  Env env = info.Env();
  AddonGlobalData* data = env.GetInstanceData<AddonGlobalData>();
  return Boolean::New(env, data->progressCallback);
}

static Value _lz4dec(const CallbackInfo& info) {
  Env env = info.Env();

  if (info.Length() != 1) {
    Error::New(env, "lz4dec(buf): arguments.length !== 1").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[0].IsBuffer()) {
    Error::New(env, "lz4dec(): Buffer.isBuffer(arguments[0]) === false").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  Buffer<uint8_t> buffer = info[0].As<Buffer<uint8_t>>();
  const uint8_t* buf = buffer.Data();
  size_t buflen = buffer.Length();
  uint32_t uncompressed_size = lz4_get_uncompressed_size(buf, buflen);
  if (uncompressed_size == 0) {
    Error::New(env, "lz4dec(): lz4_get_uncompressed_size failed").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  uint8_t* uncompressed_data = new uint8_t[uncompressed_size];
  const int decompressed_size = lz4_dec_buffer(buf, buflen, uncompressed_data, uncompressed_size);
  if (decompressed_size <= 0) {
    delete[] uncompressed_data;
    Error::New(env, "lz4dec(): lz4_dec_buffer failed").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  Buffer<uint8_t> ret = Buffer<uint8_t>::New(env, uncompressed_data, decompressed_size, [](Env env, uint8_t* data) {
    delete[] data;
  });
  return ret;
}

static Napi::Value _wav2aac(const Napi::CallbackInfo& info) {
  Napi::Env env = info.Env();

  std::string functionSignature = "wav2aac(wavPath: string, aacPath: string, bitRate: number, sampleRate: number, channels: number, onComplete: (err: Error | null) => void, onProgress?: (progress: { total: number; loaded: number; percentage: number }) => void)";

  if (info.Length() < 6) {
    Napi::TypeError::New(env, functionSignature + ": arguments.length < 6").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[0].IsString()) {
    Napi::TypeError::New(env, functionSignature + ": typeof wavPath !== 'string'").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[1].IsString()) {
    Napi::TypeError::New(env, functionSignature + ": typeof aacPath !== 'string'").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[2].IsNumber()) {
    Napi::TypeError::New(env, functionSignature + ": typeof bitRate !== 'number'").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[3].IsNumber()) {
    Napi::TypeError::New(env, functionSignature + ": typeof sampleRate !== 'number'").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[4].IsNumber()) {
    Napi::TypeError::New(env, functionSignature + ": typeof channels !== 'number'").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (!info[5].IsFunction()) {
    Napi::TypeError::New(env, functionSignature + ": typeof onComplete !== 'function'").ThrowAsJavaScriptException();
    return env.Undefined();
  }

  if (info.Length() > 6) {
    if (!info[6].IsFunction()) {
      Napi::TypeError::New(env, functionSignature + ": typeof onProgress !== 'function'").ThrowAsJavaScriptException();
      return env.Undefined();
    }
    EncodeWorker *w = new EncodeWorker(
      info[0].As<Napi::String>().Utf8Value(),
      info[1].As<Napi::String>().Utf8Value(),
      info[2].As<Napi::Number>().Int32Value(),
      info[3].As<Napi::Number>().Int32Value(),
      info[4].As<Napi::Number>().Int32Value(),
      info[5].As<Napi::Function>(),
      info[6].As<Napi::Function>()
    );
    w->Queue();
  } else {
    EncodeWorker *w = new EncodeWorker(
      info[0].As<Napi::String>().Utf8Value(),
      info[1].As<Napi::String>().Utf8Value(),
      info[2].As<Napi::Number>().Int32Value(),
      info[3].As<Napi::Number>().Int32Value(),
      info[4].As<Napi::Number>().Int32Value(),
      info[5].As<Napi::Function>()
    );
    w->Queue();
  }

  return env.Undefined();
}

static void _deleteAddonData(Env env, AddonGlobalData* data) {
  delete data;
}

static Object _index(Env env, Object exports) {
  AddonGlobalData* globalData = env.GetInstanceData<AddonGlobalData>();
  if (globalData == nullptr) {
    AddonGlobalData* data = new AddonGlobalData;
    data->progressCallback = true;
    env.SetInstanceData<AddonGlobalData, _deleteAddonData>(data);
  }
  exports["wav2mp3"] = Function::New(env, _wav2mp3, "wav2mp3");
  exports["wav2aac"] = Function::New(env, _wav2aac, "wav2aac");
  exports["setProgressCallback"] = Function::New(env, _setProgressCallback, "setProgressCallback");
  exports["getProgressCallback"] = Function::New(env, _getProgressCallback, "getProgressCallback");
  exports["lz4dec"] = Function::New(env, _lz4dec, "lz4dec");
  return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, _index)
