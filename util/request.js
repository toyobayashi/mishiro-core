const http = require('http')
const https = require('https')
const fs = require('fs-extra')
const url = require('url')
const path = require('path')

const protocol = {
  'http:': http,
  'https:': https
}

function request (options, callback) {
  let u = url.parse(options.url)
  let m = options.method || 'GET'
  let t = options.timeout || 5000
  let h = options.headers
  let b = options.body
  let p = options.path
  let onData = options.onData

  let _protocol = u.protocol
  let _path = u.path
  let _host = u.host

  let ws = null
  let rename = true
  let fileLength = 0
  let contentLength = -1
  if (p) {
    fs.mkdirsSync(path.dirname(p))
    if (fs.existsSync(p)) {
      callback(null, null, p)
      return
    }
    if (fs.existsSync(p + '.tmp')) {
      const f = fs.readFileSync(p + '.tmp')
      fileLength = f.length
    }
    if (fileLength > 0) {
      if (h) h.Range = 'bytes=' + fileLength + '-'
      else h = { Range: 'bytes=' + fileLength + '-' }
    }
  }
  let req = protocol[_protocol || 'http'].request({
    method: m,
    host: _host,
    path: _path,
    headers: h,
    timeout: t
  }, res => {
    if (res.statusCode >= 400) {
      callback(new Error(res.statusCode.toString()))
      return
    }
    let chunks = []
    let size = 0
    contentLength = Number(res.headers['content-length'])
    if (p) {
      ws = fs.createWriteStream(p + '.tmp', { flags: 'a+' })
      ws.on('close', () => {
        if (rename) {
          fs.renameSync(p + '.tmp', p)
          callback(null, null, p)
        }
      })
      res.pipe(ws)
    }
    res.on('data', chunk => {
      size += chunk.length
      if (p) {
        if (onData) {
          onData({
            name: path.parse(p).base,
            current: fileLength + size,
            max: fileLength + contentLength,
            loading: 100 * (fileLength + size) / (fileLength + contentLength)
          })
        }
      } else {
        chunks.push(chunk)
      }
    })
    res.on('end', () => {
      if (!p) {
        let buf = Buffer.alloc(size)
        let pos = 0
        for (const chunk of chunks) {
          chunk.copy(buf, pos)
          pos += chunk.length
        }
        let body = buf.toString()
        callback(null, body)
      }
    })
  })
  req.on('abort', () => {
    rename = false
    callback(new Error('abort'))
  })
  req.on('error', err => {
    callback(err)
  })
  if (m === 'POST') req.write(b)
  req.end()

  return req
}

module.exports = request
