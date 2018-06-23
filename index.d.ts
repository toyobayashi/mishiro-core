import { ClientRequest } from 'http'

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

export class Client {
  constructor (account: string, resVer: string)
  post: (path: string, args: any) => Promise<any>
  check: () => Promise<number | false>
  getProfile: (viewer: string | number) => Promise<any>
  getGachaRate: (gacha: string | number) => Promise<any>
}

export namespace util {
  export function download (u: string, p: string, onData: (prog: ProgressInfo) => void): Promise<string>
  export function request (options: RequestOption, callback: (err: Error | null, res: string | null | undefined, path: string  | null | undefined) => void): ClientRequest | undefined
  export function lz4dec(input: string, output?: string): string
}

export namespace downloader {
  export function downloadManifest (resVer: number | string, p: string, onData: (prog: ProgressInfo) => void): Promise<string>
  export function downloadAsset (hash: string, p: string, onData: (prog: ProgressInfo) => void): Promise<string>
  export function downloadSound (k: string, hash: string, p: string, onData: (prog: ProgressInfo) => void): Promise<string>
  export function downloadDatabase (hash: string, p: string, suffix: string, onData: (prog: ProgressInfo) => void): Promise<string>
  export function downloadSpread (id: string, p: string, onData: (prog: ProgressInfo) => void): Promise<string>
  export function downloadIcon (id: string, p: string, onData: (prog: ProgressInfo) => void): Promise<string>
}

export namespace audio {
  export function acb2hca (acb: string, targetDir?: string): Promise<string[]>
  export function hca2wav (hca: string): Promise<string>
  export function wav2mp3 (wav: string, mp3?: string): Promise<string>
  export function hca2mp3 (hca: string, mp3?: string): Promise<string>
  export function acb2wav (acb: string, singleComplete?: (current: number, total: number, filename: string) => void): Promise<string[]>
  export function acb2mp3 (acb: string, singleComplete?: (current: number, total: number, filename: string) => void): Promise<string[]>
}
