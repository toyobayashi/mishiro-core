import * as http from 'http'

export interface RequestOption {
  url: string
  method?: string
  timeout?: number
  headers?: any
  body?: string | Buffer,
  path?: string
  onData?: (prog: ProgressInfo) => void
}

export interface ProgressInfo {
  name?: string
  current: number
  max: number
  loading: number
}

export interface ServerResponse {
  data_headers: {
    required_res_ver?: string
    store_url?: string
    user_id: number | false
    viewer_id: number | false
    APP_VER: string
    sid: string
    REQUEST_ID: number
    servertime: number
    result_code: number
    [key: string]: any
  }
  data: any[] | {
    [key: string]: any
  }
}

export class Client {
  constructor (account: string, resVer?: string)
  user: string
  viewer: string
  udid: string
  sid: string
  resVer: string
  electronNet: boolean
  useElectronNet (value: boolean): void
  post (path: string, args: any, headerEx?: { [x: string]: string }): Promise<ServerResponse>
  check (): Promise<number>
  getProfile (viewer: string | number): Promise<ServerResponse>
  getGachaRate (gacha: string | number): Promise<ServerResponse>
  static readonly VIEWER_ID_KEY: string
  static readonly SID_KEY: string
  static cryptoGrapher: {
    encode (s: string): string
    decode (s: string): string
  }
  static cryptAES: {
    encryptRJ256 (data: string, iv: Buffer, key: string): Buffer
    decryptRJ256 (data: Buffer, iv: Buffer, key: string): string
  }
  static decryptBody (body: string, iv: Buffer): any
}

export class Downloader {
  tasks: any[][] | { name: string; hash: string; [x: string]: any }[]
  index: number
  req: http.ClientRequest | null
  isContinue: boolean
  rename: boolean
  electronNet: boolean
  useElectronNet (value: boolean): void
  downloadOne (u: string, p: string, onData?: (prog: ProgressInfo) => void): Promise<string>

  download (tasks: any[][], start?: (task: any[]) => void, onData?: (prog: ProgressInfo) => void, complete?: (task: any[]) => void, stop?: (task: any[]) => void): Promise<string[]>
  batchDownload (manifests: { name: string; hash: string; [x: string]: any }[], targetDir: string, start?: (task: { name: string; hash: string; [x: string]: any }, filepath: string) => void, onData?: (prog: ProgressInfo) => void, complete?: (task: { name: string; hash: string; [x: string]: any }, filepath: string) => void, stop?: (task: { name: string; hash: string; [x: string]: any }, filepath: string) => void): Promise<string[]>
  stop (stopCallback?: () => void): void

  downloadManifest (resVer: number | string, p: string, onData?: (prog: ProgressInfo) => void): Promise<string>
  downloadAsset (hash: string, p: string, onData?: (prog: ProgressInfo) => void): Promise<string>
  downloadSound (k: string, hash: string, p: string, onData?: (prog: ProgressInfo) => void): Promise<string>
  downloadDatabase (hash: string, p: string, onData?: (prog: ProgressInfo) => void, suffix?: string): Promise<string>
  downloadSpread (id: string, p: string, onData?: (prog: ProgressInfo) => void): Promise<string>
  downloadIcon (id: string, p: string, onData?: (prog: ProgressInfo) => void): Promise<string>
}

declare class FileReader {
  constructor (buf: Buffer)
  readUInt8 (): number
  readUInt16LE (): number
  readUInt32LE (): number
  copy (target: Buffer | Uint8Array, targetStart: number, thisSize: number): void
  seek (pos: number): void
  tell (): number
}

declare class Config {
  getCallbackInterval (): number
  setCallbackInterval (num: number): void
  list (): { [key: string]: any }
}

export namespace util {
  export class Lz4 {
    constructor (buf: Buffer)
    reader: FileReader
    decompress (): Buffer
    readAdditionalSize (): number
    static decompress (input: Buffer): Buffer
    static decompress (input: string, output?: string): string
  }
  export function unpackTexture2D (assetBundle: string, targetDir?: string): Promise<string[]>
}

declare type AcbResult = string[] & { dirname: string }

export namespace audio {
  export function acb2hca (acb: string, targetDir?: string): Promise<AcbResult>
  export function hca2wav (hca: string): Promise<string>
  export function wav2mp3 (wav: string, mp3?: string, onProgress?: (data: ProgressInfo) => void): Promise<string>
  export function hca2mp3 (hca: string, mp3?: string, onWav2Mp3Progress?: (data: ProgressInfo) => void): Promise<string>
  export function acb2wav (acb: string, singleComplete?: (completed: number, total: number, filename: string) => void): Promise<AcbResult>
  export function acb2mp3 (acb: string, singleComplete?: (completed: number, total: number, filename: string) => void, onWav2Mp3Progress?: (current: number, total: number, prog: ProgressInfo) => void): Promise<AcbResult>
}

export const config: Config
