const supportBigInt = typeof BigInt === 'function'

module.exports = class Reader {
  constructor (buf) {
    this.buf = buf
    this.pos = 0
    this.length = buf.length
  }
  read (size = 1) {
    if (this.pos + size > this.length) throw new Error(`${this.pos} + ${size} > ${this.length} over length`)
    let b = Buffer.from(this.buf.slice(this.pos, this.pos + size))
    this.pos += size
    return b
  }
  tell () {
    return this.pos
  }
  seek (at, where = 0) {
    if (at + where > this.length) throw new Error(`${at} + ${where} > ${this.length} over length`)
    this.pos = at + where
  }
  readInt8 () {
    if (this.pos + 1 > this.length) throw new Error(`${this.pos} + 1 > ${this.length} over length`)
    let n = this.buf.readInt8(this.pos)
    this.pos++
    return n
  }
  readUInt8 () {
    if (this.pos + 1 > this.length) throw new Error(`${this.pos} + 1 > ${this.length} over length`)
    let n = this.buf.readUInt8(this.pos)
    this.pos++
    return n
  }
  readInt16BE () {
    if (this.pos + 2 > this.length) throw new Error(`${this.pos} + 2 > ${this.length} over length`)
    let n = this.buf.readInt16BE(this.pos)
    this.pos += 2
    return n
  }
  readUInt16BE () {
    if (this.pos + 2 > this.length) throw new Error(`${this.pos} + 2 > ${this.length} over length`)
    let n = this.buf.readUInt16BE(this.pos)
    this.pos += 2
    return n
  }
  readInt16LE () {
    if (this.pos + 2 > this.length) throw new Error(`${this.pos} + 2 > ${this.length} over length`)
    let n = this.buf.readInt16LE(this.pos)
    this.pos += 2
    return n
  }
  readUInt16LE () {
    if (this.pos + 2 > this.length) throw new Error(`${this.pos} + 2 > ${this.length} over length`)
    let n = this.buf.readUInt16LE(this.pos)
    this.pos += 2
    return n
  }

  readInt32BE () {
    if (this.pos + 4 > this.length) throw new Error(`${this.pos} + 4 > ${this.length} over length`)
    let n = this.buf.readInt32BE(this.pos)
    this.pos += 4
    return n
  }
  readUInt32BE () {
    if (this.pos + 4 > this.length) throw new Error(`${this.pos} + 4 > ${this.length} over length`)
    let n = this.buf.readUInt32BE(this.pos)
    this.pos += 4
    return n
  }
  readInt32LE () {
    if (this.pos + 4 > this.length) throw new Error(`${this.pos} + 4 > ${this.length} over length`)
    let n = this.buf.readInt32LE(this.pos)
    this.pos += 4
    return n
  }
  readUInt32LE () {
    if (this.pos + 4 > this.length) throw new Error(`${this.pos} + 4 > ${this.length} over length`)
    let n = this.buf.readUInt32LE(this.pos)
    this.pos += 4
    return n
  }

  readUInt64BE () {
    if (this.pos + 8 > this.length) throw new Error(`${this.pos} + 8 > ${this.length} over length`)
    const buf = this.buf.slice(this.pos, this.pos + 8)

    let n
    if (supportBigInt) {
      n = BigInt(0)
      for (let i = BigInt(0); i < BigInt(buf.length); i++) {
        n += (BigInt(buf[i]) << ((BigInt(7) - i) * BigInt(8)))
      }
    } else {
      n = buf.readUIntBE(2, 6)
    }

    this.pos += 8
    return n
  }
  readInt64BE () {
    if (this.pos + 8 > this.length) throw new Error(`${this.pos} + 8 > ${this.length} over length`)

    let n
    if (supportBigInt) {
      n = this.readUInt64BE()
      n = BigInt.asIntN(64, n)
    } else {
      const buf = this.buf.slice(this.pos, this.pos + 8)
      const isMinus = (buf.readIntBE(0, 6) < 0)
      n = buf.readUIntBE(2, 6) * (isMinus ? -1 : 1)
    }

    this.pos += 8
    return n
  }
  readInt64LE () {
    if (this.pos + 8 > this.length) throw new Error(`${this.pos} + 8 > ${this.length} over length`)

    let n
    if (supportBigInt) {
      n = this.readUInt64LE()
      n = BigInt.asIntN(64, n)
    } else {
      const buf = this.buf.slice(this.pos, this.pos + 8)
      const isMinus = (buf.readIntBE(2, 6) < 0)
      n = buf.readUIntLE(0, 6) * (isMinus ? -1 : 1)
    }

    this.pos += 8
    return n
  }
  readUInt64LE () {
    if (this.pos + 8 > this.length) throw new Error(`${this.pos} + 8 > ${this.length} over length`)
    const buf = this.buf.slice(this.pos, this.pos + 8)

    let n
    if (supportBigInt) {
      n = BigInt(0)
      for (let i = BigInt(0); i < BigInt(buf.length); i++) {
        n += (BigInt(buf[i]) << (BigInt(i) * BigInt(8)))
      }
    } else {
      n = buf.readUIntLE(0, 6)
    }

    this.pos += 8
    return n
  }
  readDoubleBE () {
    if (this.pos + 8 > this.length) throw new Error(`${this.pos} + 8 > ${this.length} over length`)
    let n = this.buf.readDoubleBE(this.pos)
    this.pos += 8
    return n
  }
  readDoubleLE () {
    if (this.pos + 8 > this.length) throw new Error(`${this.pos} + 8 > ${this.length} over length`)
    let n = this.buf.readDoubleLE(this.pos)
    this.pos += 8
    return n
  }
  readFloatBE () {
    if (this.pos + 4 > this.length) throw new Error(`${this.pos} + 4 > ${this.length} over length`)
    let n = this.buf.readFloatBE(this.pos)
    this.pos += 4
    return n
  }
  readFloatLE () {
    if (this.pos + 4 > this.length) throw new Error(`${this.pos} + 4 > ${this.length} over length`)
    let n = this.buf.readFloatLE(this.pos)
    this.pos += 4
    return n
  }
  readUIntBE (byteLength) {
    if (this.pos + byteLength > this.length) throw new Error(`${this.pos} + ${byteLength} > ${this.length} over length`)
    let n = this.buf.readUIntBE(this.pos, byteLength)
    this.pos += byteLength
    return n
  }
  readUIntLE (byteLength) {
    if (this.pos + byteLength > this.length) throw new Error(`${this.pos} + ${byteLength} > ${this.length} over length`)
    let n = this.buf.readUIntLE(this.pos, byteLength)
    this.pos += byteLength
    return n
  }
}
