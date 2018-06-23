const { lz4dec, download } = require('../util/util.js')

const gameHostBase = 'http://storage.game.starlight-stage.jp/dl/resources'
const imgHostBase = 'https://truecolor.kirara.ca'

exports.downloadManifest = (resVer, p, onData) => download(`http://storage.game.starlight-stage.jp/dl/${resVer}/manifests/Android_AHigh_SHigh`, p, onData).then(p => lz4dec(p, 'db'))

exports.downloadAsset = (hash, p, onData) => download(`${gameHostBase}/High/AssetBundles/Android/${hash}`, p, onData).then(p => lz4dec(p, 'unity3d'))

exports.downloadSound = (k, hash, p, onData) => download(`${gameHostBase}/High/Sound/Common/${k}/${hash}`, p, onData)

exports.downloadDatabase = (hash, p, suffix = 'bdb', onData) => download(`${gameHostBase}/Generic/${hash}`, p, onData).then(p => lz4dec(p, suffix))

exports.downloadSpread = (id, p, onData) => download(`${imgHostBase}/spread/${id}.png`, p, onData)

exports.downloadIcon = (id, p, onData) => download(`${imgHostBase}/icon_card/${id}.png`, p, onData)
