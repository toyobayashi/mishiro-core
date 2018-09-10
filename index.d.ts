import * as request from 'request'

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
  post: (path: string, args: any) => Promise<ServerResponse>
  check: () => Promise<number>
  getProfile: (viewer: string | number) => Promise<ServerResponse>
  getGachaRate: (gacha: string | number) => Promise<ServerResponse>
}

export class Downloader {
  tasks: any[][] | { name: string; hash: string; [x: string]: any }[]
  index: number
  req: request.Request | null
  isContinue: boolean

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

export namespace util {
  export function lz4dec (input: string, output?: string): string
  export function unpackTexture2D (assetBundle: string, targetDir?: string): Promise<string[]>
}

declare type AcbResult = string[] & { dirname: string }

export namespace audio {
  export function acb2hca (acb: string, targetDir?: string): Promise<AcbResult>
  export function hca2wav (hca: string): Promise<string>
  export function wav2mp3 (wav: string, mp3?: string): Promise<string>
  export function hca2mp3 (hca: string, mp3?: string): Promise<string>
  export function acb2wav (acb: string, singleComplete?: (current: number, total: number, filename: string) => void): Promise<AcbResult>
  export function acb2mp3 (acb: string, singleComplete?: (current: number, total: number, filename: string) => void): Promise<AcbResult>
}
