import { IDownload } from '@tybys/downloader'

export declare interface ProgressInfo {
  name?: string
  current: number
  max: number
  loading: number
}

export declare interface ServerResponse {
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

export declare class Client {
  constructor (account: string, resVer?: string)
  user: string
  viewer: string
  udid: string
  sid: string
  resVer: string
  proxy: string

  getProxy (): string
  setProxy (proxy: string): void
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

export declare enum ResourceType {
  ASSET = 0,
  SOUND = 1,
  DATABASE = 2,
  MOVIE = 3
}

export declare interface DownloadPromise<T> extends Promise<T> {
  download: IDownload
}

export declare class Downloader {
  static RES_HOST_BASE: string
  static IMG_HOST_BASE: string
  static getUrl (type: ResourceType, hash: string): string
  autoDecLz4: boolean
  proxy: string

  getProxy (): string
  setProxy (proxy: string): void
  setAutoDecLz4 (v: boolean): void
  getAutoDecLz4 (): boolean
  downloadOne (u: string, p: string, onData?: (prog: ProgressInfo) => void): DownloadPromise<string>
  downloadOneRaw (type: ResourceType, hash: string, p: string, onData?: (prog: ProgressInfo) => void): DownloadPromise<string>

  downloadManifest (resVer: number | string, p: string, onData?: (prog: ProgressInfo) => void): DownloadPromise<string>
  downloadAsset (hash: string, p: string, onData?: (prog: ProgressInfo) => void): DownloadPromise<string>
  downloadSound (k: string, hash: string, p: string, onData?: (prog: ProgressInfo) => void): DownloadPromise<string>
  downloadMovie (hash: string, p: string, onData?: (prog: ProgressInfo) => void): DownloadPromise<string>
  downloadDatabase (hash: string, p: string, onData?: (prog: ProgressInfo) => void, suffix?: string): DownloadPromise<string>
  downloadSpread (id: string, p: string, onData?: (prog: ProgressInfo) => void): DownloadPromise<string>
  downloadIcon (id: string, p: string, onData?: (prog: ProgressInfo) => void): DownloadPromise<string>
}

export declare interface IConfig {
  getCallbackInterval (): number
  setCallbackInterval (num: number): void
  getProgressCallback (): boolean
  setProgressCallback (value: boolean): void
  list (): {
    callbackInterval: number
    progressCallback?: boolean
  }
}

export declare namespace util {
  export class Lz4 {
    static decompress (input: Buffer): Buffer
    static decompress (input: string, output?: string): string
  }
  export function unpackTexture2D (assetBundle: string, targetDir?: string): Promise<string[]>
}

export declare type AcbResult = string[] & { dirname: string }

export declare namespace audio {
  export function acb2hca (acb: string, targetDir?: string): Promise<AcbResult>
  export function hca2wav (hca: string): Promise<string>
  export function wav2mp3 (wav: string, mp3?: string, onProgress?: (data: ProgressInfo) => void): Promise<string>
  export function wav2aac (wav: string, mp3?: string, onProgress?: (data: ProgressInfo) => void): Promise<string>
  export function hca2mp3 (hca: string, mp3?: string, onWav2Mp3Progress?: (data: ProgressInfo) => void): Promise<string>
  export function hca2aac (hca: string, mp3?: string, onWav2Mp3Progress?: (data: ProgressInfo) => void): Promise<string>
  export function acb2wav (acb: string, singleComplete?: (completed: number, total: number, filename: string) => void): Promise<AcbResult>
  export function acb2mp3 (acb: string, singleComplete?: (completed: number, total: number, filename: string) => void, onWav2Mp3Progress?: (current: number, total: number, prog: ProgressInfo) => void): Promise<AcbResult>
  export function acb2aac (acb: string, singleComplete?: (completed: number, total: number, filename: string) => void, onWav2Mp3Progress?: (current: number, total: number, prog: ProgressInfo) => void): Promise<AcbResult>
  export class MP3Encoder {
    bitRate: number
    sampleRate: number
    channels: number
    encode (wav: string, mp3?: string, onProgress?: (data: ProgressInfo) => void): Promise<string>
  }
  export class AACEncoder {
    bitRate: number
    sampleRate: number
    channels: number
    encode (wav: string, mp3?: string, onProgress?: (data: ProgressInfo) => void): Promise<string>
  }
}

export declare namespace movie {
  export function demuxAsync (usmFile: string, outdir?: string): Promise<string>
}

export declare const config: IConfig
