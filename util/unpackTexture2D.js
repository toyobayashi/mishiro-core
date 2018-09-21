const { Reader } = require('acb')
const Jimp = require('jimp')
const fs = require('fs-extra')
const { join, dirname } = require('path')

class UnityReader extends Reader {
  constructor (buf) {
    super(buf)
    this.alignOff = 0
  }

  align (n) {
    this.pos = ((this.pos - this.alignOff + n - 1) & ~(n - 1)) + this.alignOff
  }
  readStr () {
    let str = []
    while (true) {
      let b = this.read()[0]
      if (b === 0) break
      else str.push(b)
    }
    return Buffer.from(str).toString('ascii')
  }
}

class Def {
  constructor (name, typeName, size, flags, array = false) {
    this.children = []
    this.name = name
    this.typeName = typeName
    this.size = size
    this.flags = flags
    this.array = array
  }

  read (reader) {
    if (this.array) {
      let size = this.children[0].read(reader)
      if (size >= 10000000) throw new Error('Size over 10000000.')
      if (this.children[1].typeName === 'UInt8' || this.children[1].typeName === 'char') {
        return reader.read(size)
      } else {
        let result = []
        for (let i = 0; i < size; i++) {
          result.push(this.children[1].read(reader))
        }
        return result
      }
    } else if (this.children.length) {
      let v = {}
      let len = 0
      for (const i of this.children) {
        v[i.name] = i.read(reader)
        len++
      }
      if (len === 1 && this.typeName === 'string') {
        return v.Array
      }
      return v
    } else {
      // let x = reader.tell()
      reader.align(this.size < 4 ? this.size : 4)
      let d = reader.read(this.size)
      if (this.typeName === 'int') {
        d = d.readInt32LE()
      } else if (this.typeName === 'int64') {
        // throw new Error('int64')
        d.readUIntLE(1)
        d = d.readUIntLE(7)
      } else if (this.typeName === 'char') {
        d = Buffer.from(d[0]).toString('ascii')
      } else if (this.typeName === 'bool') {
        d = d[0]
      } else if (this.typeName === 'float') {
        d = d.readFloatLE()
      }
      return d
    }
  }

  __getitem__ (i) {
    return this.children[i]
  }

  push (d) {
    this.children.push(d)
  }
}

const baseStrings = {
  0: 'AABB',
  5: 'AnimationClip',
  19: 'AnimationCurve',
  49: 'Array',
  55: 'Base',
  60: 'BitField',
  76: 'bool',
  81: 'char',
  86: 'ColorRGBA',
  106: 'data',
  138: 'FastPropertyName',
  155: 'first',
  161: 'float',
  167: 'Font',
  172: 'GameObject',
  183: 'Generic Mono',
  208: 'GUID',
  222: 'int',
  241: 'map',
  245: 'Matrix4x4f',
  262: 'NavMeshSettings',
  263: 'MonoBehaviour',
  277: 'MonoScript',
  299: 'm_Curve',
  349: 'm_Enabled',
  374: 'm_GameObject',
  427: 'm_Name',
  490: 'm_Script',
  519: 'm_Type',
  526: 'm_Version',
  543: 'pair',
  548: 'PPtr<Component>',
  564: 'PPtr<GameObject>',
  581: 'PPtr<Material>',
  616: 'PPtr<MonoScript>',
  633: 'PPtr<Object>',
  688: 'PPtr<Texture>',
  702: 'PPtr<Texture2D>',
  718: 'PPtr<Transform>',
  741: 'Quaternionf',
  753: 'Rectf',
  778: 'second',
  795: 'size',
  800: 'SInt16',
  814: 'int64',
  840: 'string',
  874: 'Texture2D',
  884: 'Transform',
  894: 'TypelessData',
  907: 'UInt16',
  928: 'UInt8',
  934: 'unsigned int',
  981: 'vector',
  988: 'Vector2f',
  997: 'Vector3f',
  1006: 'Vector4f'
}

class Asset {
  constructor (buf) {
    this.s = new UnityReader(buf)
    let t = this.s.readStr()
    let streamVer = this.s.readUInt32BE()
    this.unityVersion = this.s.readStr()
    this.unityRevision = this.s.readStr()

    let hdrSize

    if (t === 'UnityRaw') {
      let size = this.s.readUInt32BE()
      hdrSize = this.s.readUInt32BE()
      let count1 = this.s.readUInt32BE()
      let count2 = this.s.readUInt32BE()

      this.s.read(count2 * 8)

      if (streamVer >= 2) {
        this.s.read(4)
      }
      if (streamVer >= 3) {
        let dataHdrSize = this.s.readUInt32BE()
        hdrSize += dataHdrSize
      }
    } else if (t === 'UnityFS') {
      this.s.read(8) // size
      let compressionHrdSize = this.s.readUInt32BE()
      let dataHdrSize = this.s.readUInt32BE()
      let flags = this.s.readUInt32BE()
      hdrSize = this.s.tell()
      if ((flags & 0x80) === 0x00) {
        hdrSize += compressionHrdSize
      }
    } else {
      throw new Error(`Unsupported resource type ${t}`)
    }

    this.s.seek(hdrSize)
    this.off = this.s.alignOff = this.s.tell()
    this.tableSize = this.s.readUInt32BE()
    this.dataEnd = this.s.readUInt32BE()
    this.fileGen = this.s.readUInt32BE()
    this.dataOffset = this.s.readUInt32BE()

    this.s.read(4)
    this.version = this.s.readStr()
    this.platform = this.s.readUInt32LE()
    this.classIds = []
    this.defs = this.decodeDefs()
    this.objs = this.decodeData()
  }

  decodeData () {
    let count = this.s.readUInt32LE()
    let objs = []
    if (count >= 1024) throw new Error('count >= 1024')

    for (let i = 0; i < count; i++) {
      this.s.align(4)
      let off, classId
      if (this.fileGen >= 17) {
        let dhdr = this.s.read(20)
        off = dhdr.slice(8).readUInt32LE()
        let typeId = dhdr.slice(16).readUInt32LE()
        classId = this.classIds[typeId]
      } else {
        let dhdr = this.s.read(25)
        off = dhdr.slice(8).readUInt32LE()
        classId = dhdr.slice(20).readUInt16LE()
      }

      let save = this.s.tell()
      this.s.seek(off + this.dataOffset + this.off)

      objs.push(this.defs[classId].read(this.s))
      this.s.seek(save)
    }
    return objs
  }

  decodeDefs () {
    let areDefs = this.s.readUInt8()
    let count = this.s.readUInt32LE()
    let o = {}
    for (let i = 0; i < count; i++) {
      let attr = this.decodeAttrtab()
      o[attr[0]] = attr[1]
    }
    return o
  }

  decodeAttrtab () {
    let code, attrCnt, stabLen
    // console.log(this)
    if (this.fileGen >= 17) {
      // let hdr = this.s.read(31)
      code = this.s.readUInt32LE()
      this.s.read(19)
      attrCnt = this.s.readUInt32LE()
      stabLen = this.s.readUInt32LE()
    } else {
      code = this.s.readUInt32LE()
      this.s.read(16)
      attrCnt = this.s.readUInt32LE()
      stabLen = this.s.readUInt32LE()
    }

    let attrs = this.s.read(attrCnt * 24)
    let stab = this.s.read(stabLen)
    let defs = []

    if (attrCnt >= 1024) throw new Error('attrCnt >= 1024')

    for (let i = 0; i < attrCnt; i++) {
      let sliceattrs = attrs.slice(i * 24, i * 24 + 24)
      let a1 = sliceattrs[0]
      let a2 = sliceattrs[1]
      let level = sliceattrs[2]
      let a4 = sliceattrs[3]
      let typeOff = sliceattrs.slice(4).readUInt32LE()
      let nameOff = sliceattrs.slice(8).readUInt32LE()
      let size = sliceattrs.slice(12).readUInt32LE()
      let idx = sliceattrs.slice(16).readUInt32LE()
      let flags = sliceattrs.slice(20).readUInt32LE()

      let name, typeName
      if ((nameOff & 0x80000000)) {
        name = baseStrings[nameOff & 0x7fffffff]
      } else {
        let tmp = stab.slice(nameOff)
        let str = []
        let j = 0
        while (true) {
          if (tmp[j] !== 0) {
            str.push(tmp[j])
            j++
          } else break
        }
        name = Buffer.from(str).toString('ascii')
      }

      if ((typeOff & 0x80000000)) {
        typeName = baseStrings[typeOff & 0x7fffffff]
      } else {
        let tmp = stab.slice(typeOff)
        let str = []
        let j = 0
        while (true) {
          if (tmp[j] !== 0) {
            str.push(tmp[j])
            j++
          } else break
        }
        typeName = Buffer.from(str).toString('ascii')
      }

      let d = defs

      if (level >= 16) throw new Error('level >= 16')
      for (let k = 0; k < level; k++) {
        if (k === 0) d = d[d.length - 1]
        else d = d.__getitem__(d.children.length - 1)
      }
      if (size === 0xffffffff) size = undefined
      d.push(new Def(name, typeName, size, flags, a4))
    }

    if (defs.length !== 1) throw new Error('defs.length !== 1')
    this.classIds.push(code)
    return [code, defs[0]]
  }
}

const DIFFERENTIAL = [0, 1, 2, 3, -4, -3, -2, -1]
const TABLE = [
  [ -8, -2, 2, 8 ],
  [ -17, -5, 5, 17 ],
  [ -29, -9, 9, 29 ],
  [ -42, -13, 13, 42 ],
  [ -60, -18, 18, 60 ],
  [ -80, -24, 24, 80 ],
  [ -106, -33, 33, 106 ],
  [ -183, -47, 47, 183 ]
]
const PIXEL_INDEX = [2, 3, 1, 0]
const SUBBLOCK = [
  [ 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1 ],
  [ 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1 ]
]

function clamp (i) {
  if (i < 0) return 0
  if (i > 255) return 255
  return i
}

function UnpackETC1 (upper, lower) {
  let flipbit = (upper) & 1
  let diffbit = (upper >> 1) & 1
  let cw = [ (upper >> 5) & 7, (upper >> 2) & 7 ]
  let baseColor = []

  let r1, g1, b1, r2, g2, b2

  if (diffbit === 0) {
    b2 = (upper >> 8) & 15; b2 = b2 << 4 | b2
    b1 = (upper >> 12) & 15; b1 = b1 << 4 | b1
    g2 = (upper >> 16) & 15; g2 = g2 << 4 | g2
    g1 = (upper >> 20) & 15; g1 = g1 << 4 | g1
    r2 = (upper >> 24) & 15; r2 = r2 << 4 | r2
    r1 = (upper >> 28) & 15; r1 = r1 << 4 | r1
  } else {
    let db = (upper >> 8) & 7; db = DIFFERENTIAL[db]
    b1 = (upper >> 11) & 31; b2 = (b1 + db) & 31
    let dg = (upper >> 16) & 7; dg = DIFFERENTIAL[dg]
    g1 = (upper >> 19) & 31; g2 = (g1 + dg) & 31
    let dr = (upper >> 24) & 7; dr = DIFFERENTIAL[dr]
    r1 = (upper >> 27) & 31; r2 = (r1 + dr) & 31

    r1 = r1 << 3 | (r1 >> 2)
    r2 = r2 << 3 | (r2 >> 2)
    g1 = g1 << 3 | (g1 >> 2)
    g2 = g2 << 3 | (g2 >> 2)
    b1 = b1 << 3 | (b1 >> 2)
    b2 = b2 << 3 | (b2 >> 2)
  }

  baseColor = [ [r1, g1, b1], [r2, g2, b2] ]

  // 4x4
  let block = []

  let high = (lower >> 16) & 0xffff
  let low = lower & 0xffff

  for (let i = 0; i < 16; i++) {
    let subblock = SUBBLOCK[flipbit][i]
    let base = baseColor[subblock]

    let bit = (i >> 2) | ((i & 3) << 2)
    let lsb = (low >> bit) & 1
    let msb = (high >> bit) & 1
    let index = PIXEL_INDEX[msb * 2 + lsb]
    let diff = TABLE[cw[subblock]][index]

    block[i] = [ base[0] + diff, base[1] + diff, base[2] + diff ]
    block[i] = block[i].map(clamp)
  }

  return block
}

const A8 = 1
const A4_R4_G4_B4 = 2
const R8_G8_B8 = 3
const R8_G8_B8_A8 = 4
const A8_R8_G8_B8 = 5
const R5_G6_B5 = 7
const R4_G4_B4_A4 = 13
// const PVRTC_RGB2 = 30;
// const PVRTC_RGBA2 = 31;
// const PVRTC_RGB4 = 32;
// const PVRTC_RGBA4 = 33;
const ETC1_RGB = 34

const TEX_FORMAT_ALPHA = [ A8, A4_R4_G4_B4, R8_G8_B8_A8, A8_R8_G8_B8, R4_G4_B4_A4 ]
const TEX_FORMAT_NONALPHA = [ R8_G8_B8, R5_G6_B5, ETC1_RGB ]
const TEX_FORMAT = [].concat(TEX_FORMAT_NONALPHA, TEX_FORMAT_NONALPHA)

// ==============================================================================

function convertTexture2D (texture) {
  let width = texture.m_Width
  let height = texture.m_Height
  let format = texture.m_TextureFormat
  let data = texture['image data']

  let img = new Jimp(width, height)
  let x = 0
  let y = 0

  if (TEX_FORMAT_NONALPHA.indexOf(format) >= 0) img.rgba(false)
  else if (TEX_FORMAT_ALPHA.indexOf(format) >= 0) img.rgba(true)
  else throw new Error('Unsupported format ' + format)

  // ====================================
  // Handle special formats first

  if (format === ETC1_RGB) {
    for (let o = 0; o < data.length; o += 8) {
      let upper = data.readUInt32BE(o)
      let lower = data.readUInt32BE(o + 4)
      let block = UnpackETC1(upper, lower)

      for (let i = 0; i < 16; i++) {
        let dx = i % 4
        let dy = ~~(i / 4)
        img.setPixelColor(Jimp.rgbaToInt(...block[i], 255), x + dx, y + dy)
      }

      if (width <= x + 4) { x = 0; y += 4 } else x += 4
    }

    return img
  }

  //= ===================================
  // And the others

  for (let o = 0; o < data.length;) {
    let r = 0
    let g = 0
    let b = 0
    let a = 255

    if (format === A8) {
      a = data.readUInt8(o)
      o += 1
    } else if (format === A4_R4_G4_B4) {
      // aaaarrrr ggggbbbb
      let v = data.readUInt16LE(o); o += 2
      b = (v & 15) << 4
      g = ((v >> 4) & 15) << 4
      r = ((v >> 8) & 15) << 4
      a = ((v >> 12) & 15) << 4
    } else if (format === R8_G8_B8) {
      // rrrrrrrr gggggggg bbbbbbbb
      r = data.readUInt8(o)
      g = data.readUInt8(o + 1)
      b = data.readUInt8(o + 2)
      o += 3
    } else if (format === R8_G8_B8_A8) {
      // rrrrrrrr gggggggg bbbbbbbb aaaaaaaa
      r = data.readUInt8(o)
      g = data.readUInt8(o + 1)
      b = data.readUInt8(o + 2)
      a = data.readUInt8(o + 3)
      o += 4
    } else if (format === A8_R8_G8_B8) {
      // aaaaaaaa rrrrrrrr gggggggg bbbbbbbb
      a = data.readUInt8(o)
      r = data.readUInt8(o + 1)
      g = data.readUInt8(o + 2)
      b = data.readUInt8(o + 3)
      o += 4
    } else if (format === R5_G6_B5) {
      // rrrrrggg gggbbbbb
      let v = data.readUInt16LE(o); o += 2
      b = (v & 31) << 3
      g = ((v >> 5) & 63) << 2
      r = ((v >> 11) & 31) << 3
    } else if (format === R4_G4_B4_A4) {
      // rrrrgggg bbbbaaaa
      let v = data.readUInt16LE(o); o += 2
      a = (v & 15) << 4
      b = ((v >> 4) & 15) << 4
      g = ((v >> 8) & 15) << 4
      r = ((v >> 12) & 15) << 4
    }

    img.setPixelColor(Jimp.rgbaToInt(r, g, b, a), x, y)
    x++
    if (x >= width) { x = 0; y++ }
  }

  return img
}

function writeImg (img, filename) {
  return new Promise((resolve, reject) => {
    img.write(filename, (err, image) => {
      if (err) return reject(err)
      resolve(filename)
    })
  })
}

function unpackTexture2D (assetBundle, targetDir = dirname(assetBundle)) {
  let asset = new Asset(fs.readFileSync(assetBundle))
  let promisearr = []
  for (const obj of asset.objs) {
    if (obj['image data']) {
      let img = convertTexture2D(obj)
      img.flip(false, true)
      let filename = obj.m_Name + '.' + img.getExtension()
      promisearr.push(writeImg(img, join(targetDir, filename)))
    }
  }
  return Promise.all(promisearr)
}

module.exports = unpackTexture2D
