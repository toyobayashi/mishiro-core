#ifndef __THREAD_SAFE_ASYNC_WORKER_H__
#define __THREAD_SAFE_ASYNC_WORKER_H__

#define NAPI_EXPERIMENTAL // 10.7.0+ Napi::ThreadSafeFunction
#include <napi.h>

class ThreadSafeAsyncWorker {
public:
  virtual ~ThreadSafeAsyncWorker();

  ThreadSafeAsyncWorker(ThreadSafeAsyncWorker&& other);
  ThreadSafeAsyncWorker& operator =(ThreadSafeAsyncWorker&& other);
  ThreadSafeAsyncWorker(const ThreadSafeAsyncWorker&) = delete;
  ThreadSafeAsyncWorker& operator =(ThreadSafeAsyncWorker&) = delete;

  operator napi_async_work() const;

  Napi::Env Env() const;

  void Queue();
  void Cancel();
  void SuppressDestruct();

  // ObjectReference& Receiver();
  Napi::FunctionReference& Callback();
  Napi::FunctionReference& ProgressCallback();

protected:
  explicit ThreadSafeAsyncWorker(const Napi::Function& callback);
  explicit ThreadSafeAsyncWorker(const Napi::Function& callback, const Napi::Function& _progressCallback);
  // explicit ThreadSafeAsyncWorker(const Function& callback,
  //                       const char* resource_name);
  // explicit ThreadSafeAsyncWorker(const Function& callback,
  //                       const char* resource_name,
  //                       const Object& resource);
  // explicit ThreadSafeAsyncWorker(const Object& receiver,
  //                       const Function& callback);
  // explicit ThreadSafeAsyncWorker(const Object& receiver,
  //                       const Function& callback,
  //                       const char* resource_name);
  // explicit ThreadSafeAsyncWorker(const Object& receiver,
  //                       const Function& callback,
  //                       const char* resource_name,
  //                       const Object& resource);

  // explicit ThreadSafeAsyncWorker(Napi::Env env);
  // explicit ThreadSafeAsyncWorker(Napi::Env env,
  //                       const char* resource_name);
  // explicit ThreadSafeAsyncWorker(Napi::Env env,
  //                       const char* resource_name,
  //                       const Object& resource);

  virtual void Execute() = 0;
  virtual void OnProgress(void* data);
  virtual void OnOK();
  virtual void OnError(const Napi::Error& e);
  virtual void Destroy();
  // virtual std::vector<napi_value> GetResult(Napi::Env env);

  void SetError(const std::string& error);
  void EmitProgress(void* data);

private:
  static void OnExecute(napi_env env, void* this_pointer);
  static void OnWorkComplete(napi_env env,
                              napi_status status,
                              void* this_pointer);
  static void CallJS(napi_env env, napi_value jsCallback, void* this_pointer, void* data);

  napi_env _env;
  napi_async_work _work;
  napi_threadsafe_function _tsfn;
  // ObjectReference _receiver;
  Napi::FunctionReference _callback;
  Napi::FunctionReference _progressCallback;
  std::string _error;
  bool _suppress_destruct;
};






inline ThreadSafeAsyncWorker::~ThreadSafeAsyncWorker() {
  if (_work != nullptr) {
    napi_delete_async_work(_env, _work);
    _work = nullptr;
  }
  if (_tsfn != nullptr) {
    napi_release_threadsafe_function(_tsfn, napi_tsfn_release);
    _tsfn = nullptr;
  }
}

inline ThreadSafeAsyncWorker::ThreadSafeAsyncWorker(const Napi::Function& callback)
  : _env(callback.Env()), _tsfn(nullptr), _callback(Napi::Persistent(callback)), _progressCallback(), _suppress_destruct(false) {
  napi_value resource_id;
  napi_status status = napi_create_string_latin1(
      _env, "generic", NAPI_AUTO_LENGTH, &resource_id);
  NAPI_THROW_IF_FAILED_VOID(_env, status);

  status = napi_create_async_work(_env, Napi::Object::New(callback.Env()), resource_id, OnExecute,
                                  OnWorkComplete, this, &_work);
  NAPI_THROW_IF_FAILED_VOID(_env, status);
}

inline ThreadSafeAsyncWorker::ThreadSafeAsyncWorker(const Napi::Function& callback, const Napi::Function& progressCallback)
  : _env(callback.Env()), _callback(Napi::Persistent(callback)), _progressCallback(Napi::Persistent(progressCallback)), _suppress_destruct(false) {
  napi_value resource_id;
  napi_status status = napi_create_string_latin1(
      _env, "generic", NAPI_AUTO_LENGTH, &resource_id);
  NAPI_THROW_IF_FAILED_VOID(_env, status);

  status = napi_create_async_work(_env, Napi::Object::New(callback.Env()), resource_id, OnExecute,
                                  OnWorkComplete, this, &_work);
  NAPI_THROW_IF_FAILED_VOID(_env, status);

  status = napi_create_threadsafe_function(_env,
                                  _progressCallback.Value(), // The JavaScript function to call from another thread
                                  nullptr, // async resource
                                  Napi::String::New(_env, "N-API Thread-safe Call from Async Work Item"), // async resource name
                                  0, // Maximum size of the queue. 0 for no limit.
                                  1, // The initial number of threads, including the main thread, which will be making use of this function.
                                  NULL, // Optional data to be passed to thread_finalize_cb.
                                  NULL, // Optional function to call when the napi_threadsafe_function is being destroyed.
                                  this, // Optional data to attach to the resulting napi_threadsafe_function.
                                  CallJS, // Optional callback which calls the JavaScript function in response to a call on a different thread. This callback will be called on the main thread. If not given, the JavaScript function will be called with no parameters and with undefined as its this value.
                                  &_tsfn);
  NAPI_THROW_IF_FAILED_VOID(_env, status);
}

inline ThreadSafeAsyncWorker::ThreadSafeAsyncWorker(ThreadSafeAsyncWorker&& other) {
  _env = other._env;
  other._env = nullptr;
  _work = other._work;
  other._work = nullptr;
  _tsfn = other._tsfn;
  other._tsfn = nullptr;
  // _receiver = std::move(other._receiver);
  _callback = std::move(other._callback);
  _progressCallback = std::move(other._progressCallback);
  _error = std::move(other._error);
  _suppress_destruct = other._suppress_destruct;
}

inline ThreadSafeAsyncWorker& ThreadSafeAsyncWorker::operator =(ThreadSafeAsyncWorker&& other) {
  _env = other._env;
  other._env = nullptr;
  _work = other._work;
  other._work = nullptr;
  _tsfn = other._tsfn;
  other._tsfn = nullptr;
  // _receiver = std::move(other._receiver);
  _callback = std::move(other._callback);
  _progressCallback = std::move(other._progressCallback);
  _error = std::move(other._error);
  _suppress_destruct = other._suppress_destruct;
  return *this;
}

inline ThreadSafeAsyncWorker::operator napi_async_work() const {
  return _work;
}

inline Napi::Env ThreadSafeAsyncWorker::Env() const {
  return Napi::Env(_env);
}

inline void ThreadSafeAsyncWorker::Queue() {
  napi_status status = napi_queue_async_work(_env, _work);
  NAPI_THROW_IF_FAILED_VOID(_env, status);
}

inline void ThreadSafeAsyncWorker::Cancel() {
  napi_status status = napi_cancel_async_work(_env, _work);
  NAPI_THROW_IF_FAILED_VOID(_env, status);
}

inline void ThreadSafeAsyncWorker::SuppressDestruct() {
  _suppress_destruct = true;
}

inline Napi::FunctionReference& ThreadSafeAsyncWorker::Callback() {
  return _callback;
}

inline Napi::FunctionReference& ThreadSafeAsyncWorker::ProgressCallback() {
  return _progressCallback;
}

inline void ThreadSafeAsyncWorker::OnExecute(napi_env /*DO_NOT_USE*/, void* this_pointer) {
  ThreadSafeAsyncWorker* self = static_cast<ThreadSafeAsyncWorker*>(this_pointer);
  napi_status status;
  if (self->_tsfn != nullptr) {
    status = napi_acquire_threadsafe_function(self->_tsfn);
    if (status != napi_ok) {
      self->SetError("napi_acquire_threadsafe_function() failed.");
      return;
    }
  }
  
#ifdef NAPI_CPP_EXCEPTIONS
  try {
    self->Execute();
  } catch (const std::exception& e) {
    self->SetError(e.what());
  }
#else // NAPI_CPP_EXCEPTIONS
  self->Execute();
#endif // NAPI_CPP_EXCEPTIONS
  if (self->_tsfn != nullptr) {
    status = napi_release_threadsafe_function(self->_tsfn, napi_tsfn_release);
    if (status != napi_ok) {
      self->SetError("napi_release_threadsafe_function() failed.");
      return;
    }
  }
}

inline void ThreadSafeAsyncWorker::OnWorkComplete(
    napi_env /*env*/, napi_status status, void* this_pointer) {
  ThreadSafeAsyncWorker* self = static_cast<ThreadSafeAsyncWorker*>(this_pointer);
  if (status != napi_cancelled) {
    Napi::HandleScope scope(self->_env);
    Napi::details::WrapCallback([&] {
      if (self->_error.size() == 0) {
        self->OnOK();
      }
      else {
        self->OnError(Napi::Error::New(self->_env, self->_error));
      }
      return nullptr;
    });
  }
  if (!self->_suppress_destruct) {
    self->Destroy();
  }
}

inline void ThreadSafeAsyncWorker::Destroy() {
  delete this;
}

inline void ThreadSafeAsyncWorker::OnOK() {
  if (!_callback.IsEmpty()) {
    _callback.Call({});
  }
}

inline void ThreadSafeAsyncWorker::OnError(const Napi::Error& e) {
  if (!_callback.IsEmpty()) {
    _callback.Call(std::initializer_list<napi_value>{ e.Value() });
  }
}

inline void ThreadSafeAsyncWorker::SetError(const std::string& error) {
  _error = error;
}

inline void ThreadSafeAsyncWorker::EmitProgress(void* data) {
  if (_tsfn == nullptr) {
    return;
  }
  napi_status status = napi_call_threadsafe_function(_tsfn, data, napi_tsfn_blocking);
  if (status != napi_ok) {
    SetError("napi_call_threadsafe_function() failed.");
  }
}

inline void ThreadSafeAsyncWorker::CallJS(napi_env env, napi_value jsCallback, void* this_pointer, void* data) {
  if (env == nullptr && jsCallback == nullptr) {
    return;
  }

  ThreadSafeAsyncWorker* self = static_cast<ThreadSafeAsyncWorker*>(this_pointer);

#ifdef NAPI_CPP_EXCEPTIONS
  try {
    self->OnProgress(data);
  } catch (const std::exception& e) {
    self->SetError(e.what());
  }
#else // NAPI_CPP_EXCEPTIONS
  self->OnProgress(data);
#endif // NAPI_CPP_EXCEPTIONS
}

inline void ThreadSafeAsyncWorker::OnProgress(void* data) {
  if (!_progressCallback.IsEmpty()) {
    _progressCallback.Call({});
  }
}

#endif
