#ifndef __ENCODE_WORKER_HPP__
#define __ENCODE_WORKER_HPP__

#include <napi.h>
#include <string>
#include "aacenc_lib.h"

#include "EncodeData.h"

class EncodeWorker : public Napi::AsyncProgressQueueWorker<EncodeData> {
 public:
  EncodeWorker(const std::string& inputFileName,
               const std::string& outputFileName,
               int bitRate,
               int sampleRate,
               int channels,
               const Napi::Function& callback);
  EncodeWorker(const std::string& inputFileName,
               const std::string& outputFileName,
               int bitRate,
               int sampleRate,
               int channels,
               const Napi::Function& callback,
               const Napi::Function& progressCallback);
  void Execute(const ExecutionProgress& progress);
  void OnOK();
  void OnError(const Napi::Error&);
  void OnProgress(const EncodeData* data, size_t count);
  static void setBitRate(int);
  static int getBitRate();
  static void setProgressCallback(bool);
  static bool getProgressCallback();

 private:
  int _bitRate;
  int _sampleRate;
  int _channels;

  int frame_cnt;
  void* pWav;

  AACENC_ERROR ErrorStatus;
  AACENC_InfoStruct encInfo;

  AACENC_BufDesc inBufDesc;
  AACENC_BufDesc outBufDesc;
  AACENC_InArgs inargs;
  AACENC_OutArgs outargs;
  INT_PCM inputBuffer[8 * 2048];
  UCHAR ancillaryBuffer[50];
  AACENC_MetaData metaDataSetup;
  UCHAR outputBuffer[8192];
  UCHAR conf;

  std::string _wavPath;
  std::string _aacPath;
  Napi::FunctionReference onProgress;
};

#endif  // ! __ENCODE_WORKER_HPP__
