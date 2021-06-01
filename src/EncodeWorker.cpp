#ifdef _WIN32
#ifndef WIN32_LEAN_AND_MEAN
#define WIN32_LEAN_AND_MEAN
#endif
#include <Windows.h>
#endif

#include "EncodeWorker.hpp"
#include <cstdio>
#include <string.h>
#include <algorithm>

#include "../deps/fdk-aac/wavreader.h"
#include "aacdecoder_lib.h"
#include "aacenc_lib.h"
#include "InstanceData.h"

EncodeWorker::EncodeWorker(const std::string& inputFileName,
                           const std::string& outputFileName,
                           int bitRate,
                           int sampleRate,
                           int channels,
                           const Napi::Function& callback)
    : AsyncProgressQueueWorker(callback),
      _wavPath(inputFileName),
      _aacPath(outputFileName),
      _bitRate(bitRate),
      _sampleRate(sampleRate),
      _channels(channels),
      pWav(nullptr),
      onProgress() {}

EncodeWorker::EncodeWorker(const std::string& inputFileName,
                           const std::string& outputFileName,
                           int bitRate,
                           int sampleRate,
                           int channels,
                           const Napi::Function& callback,
                           const Napi::Function& progressCallback)
    : AsyncProgressQueueWorker(callback),
      _wavPath(inputFileName),
      _aacPath(outputFileName),
      _bitRate(bitRate),
      _sampleRate(sampleRate),
      _channels(channels),
      pWav(nullptr),
      onProgress(Napi::Persistent(progressCallback)) {}

void EncodeWorker::Execute(const ExecutionProgress& progress) {
  void* inBuffer[] = {inputBuffer, ancillaryBuffer, &metaDataSetup};
  INT inBufferIds[] = {IN_AUDIO_DATA, IN_ANCILLRY_DATA,
                              IN_METADATA_SETUP};
  INT inBufferSize[] = {sizeof(inputBuffer), sizeof(ancillaryBuffer),
                                sizeof(metaDataSetup)};
  INT inBufferElSize[] = {sizeof(INT_PCM), sizeof(UCHAR),
                                  sizeof(AACENC_MetaData)};
  void* outBuffer[] = {outputBuffer};
  INT outBufferIds[] = {OUT_BITSTREAM_DATA};
  INT outBufferSize[] = {sizeof(outputBuffer)};
  INT outBufferElSize[] = {sizeof(UCHAR)};

  // char percents[200];
  float /* percent, */ old_percent = -1.0;
  float bread = 0 /* , fileread */;
  int header_type = 0;
  int bitrate = 0;
  float length = 0;

#ifdef _WIN32
  int strlength = 0;
#endif

  FILE* outf = NULL;
  inBufDesc.numBufs = sizeof(inBuffer) / sizeof(void*);
  inBufDesc.bufs = (void**)&inBuffer;
  inBufDesc.bufferIdentifiers = inBufferIds;

  inBufDesc.bufSizes = inBufferSize;
  inBufDesc.bufElSizes = inBufferElSize;

  outBufDesc.numBufs = sizeof(outBuffer) / sizeof(void*);
  outBufDesc.bufs = (void**)&outBuffer;
  outBufDesc.bufferIdentifiers = outBufferIds;
  outBufDesc.bufSizes = outBufferSize;
  outBufDesc.bufElSizes = outBufferElSize;

  inargs.numAncBytes = 0;
  inargs.numInSamples = 0;
  HANDLE_AACENCODER hAacEncoder = NULL; /* encoder handle */
  if ((ErrorStatus = aacEncOpen(&hAacEncoder, 0, 0)) != AACENC_OK) {
    SetError("Something went wrong\n");
    return;
  }

#ifdef _WIN32
  wchar_t __wwavPath[MAX_PATH] = { 0 };
  strlength = MultiByteToWideChar(CP_UTF8, 0, _wavPath.c_str(), -1, nullptr, 0);
  MultiByteToWideChar(CP_UTF8, 0, _wavPath.c_str(), -1, __wwavPath, strlength);
  char __wavPath[MAX_PATH] = { 0 };
  strlength = WideCharToMultiByte(CP_ACP, 0, __wwavPath, -1, nullptr, 0, nullptr, nullptr);
  WideCharToMultiByte(CP_ACP, 0, __wwavPath, -1, __wavPath, strlength, nullptr, nullptr);
  pWav = wav_read_open(__wavPath);
#else
  pWav = wav_read_open(_wavPath.c_str());
#endif

  if (pWav == nullptr) {
    SetError(std::string("Couldn't open the file ") + _wavPath);
    aacEncClose(&hAacEncoder);
    return;
  }

  int wavSampleRate = 0;
  int wavNumChannels = 0;
  unsigned int dataLength = 0;
  int r = wav_get_header(pWav, nullptr, &wavNumChannels, &wavSampleRate,
                         nullptr, &dataLength);
  if (r == 0) {
    SetError(std::string("Couldn't read the file ") + _wavPath);
    wav_read_close(pWav);
    aacEncClose(&hAacEncoder);
    return; 
  }

  ErrorStatus = aacEncoder_SetParam(hAacEncoder, AACENC_AOT, 5);
  ErrorStatus = aacEncoder_SetParam(hAacEncoder, AACENC_BITRATEMODE, 0);

  if (_bitRate != 0) {
    ErrorStatus = aacEncoder_SetParam(hAacEncoder, AACENC_BITRATE, (UINT)(_bitRate * 1000));
  } else {
    ErrorStatus = aacEncoder_SetParam(hAacEncoder, AACENC_BITRATE, 160000);
  }

  if (_sampleRate != 0) {
    ErrorStatus =
        aacEncoder_SetParam(hAacEncoder, AACENC_SAMPLERATE, _sampleRate);
  } else {
    ErrorStatus =
        aacEncoder_SetParam(hAacEncoder, AACENC_SAMPLERATE, wavSampleRate);
  }

  if (_channels != 0) {
    ErrorStatus =
        aacEncoder_SetParam(hAacEncoder, AACENC_CHANNELMODE, _channels);
  } else {
    ErrorStatus =
        aacEncoder_SetParam(hAacEncoder, AACENC_CHANNELMODE, wavNumChannels);
  }

  ErrorStatus = aacEncEncode(hAacEncoder, NULL, NULL, NULL, NULL);
  ErrorStatus = aacEncInfo(hAacEncoder, &encInfo);

#ifdef _WIN32
  wchar_t __waacPath[MAX_PATH] = { 0 };
  strlength = MultiByteToWideChar(CP_UTF8, 0, _aacPath.c_str(), -1, NULL, 0);
  MultiByteToWideChar(CP_UTF8, 0, _aacPath.c_str(), -1, __waacPath, strlength);
  outf = _wfopen(__waacPath, L"wb+");
#else
  outf = fopen(_aacPath.c_str(), "wb+");
#endif

  long loaded = 0;
  bool _progressCallback = Env().GetInstanceData<AddonGlobalData>()->progressCallback;
  do {
    int numRead = wav_read_data(
        pWav, (unsigned char*)&inputBuffer[inargs.numInSamples],
        FDKmin(encInfo.inputChannels * encInfo.frameLength,
               sizeof(inputBuffer) / sizeof(INT_PCM) - inargs.numInSamples) *
            SAMPLE_BITS / 8);
    loaded += numRead;
    inargs.numInSamples += numRead / 2;

    bread += (inargs.numInSamples * 2);
    if (inargs.numInSamples == 0) {
      goto ENC_END;
    }

    ErrorStatus =
        aacEncEncode(hAacEncoder, &inBufDesc, &outBufDesc, &inargs, &outargs);

    if (outargs.numInSamples > 0) {
      FDKmemmove(
          inputBuffer, &inputBuffer[outargs.numInSamples],
          sizeof(INT_PCM) * (inargs.numInSamples - outargs.numInSamples));
      inargs.numInSamples -= outargs.numInSamples;
    }

    if (outargs.numOutBytes > 0) {
      fwrite(outputBuffer, 1, outargs.numOutBytes, outf);
    }

    if (_progressCallback && !this->onProgress.IsEmpty()) {
      EncodeData data;
      data.loaded = (double)loaded;
      data.total = (double)dataLength;
      progress.Send(&data, 1);
    }
  } while (ErrorStatus == AACENC_OK);

ENC_END:
  fclose(outf);
  wav_read_close(pWav);
  aacEncClose(&hAacEncoder);
}

void EncodeWorker::OnProgress(const EncodeData* data, size_t /* count */) {
  Napi::Env env = Env();
  Napi::HandleScope scope(env);
  Napi::Object res = Napi::Object::New(env);
  const EncodeData& value = data[0];
  res["total"] = Napi::Number::New(env, value.total);
  res["loaded"] = Napi::Number::New(env, value.loaded);
  res["percentage"] = Napi::Number::New(env, 100 * value.loaded / value.total);
  this->onProgress.Call({res});
}

void EncodeWorker::OnOK() {
  Napi::HandleScope scope(Env());
  // callback(null)
  Callback().Call({Env().Null()});
}
void EncodeWorker::OnError(const Napi::Error& err) {
  // callback(err)
  Napi::HandleScope scope(Env());
  Callback().Call({err.Value()});
}
