import { BufferFormat, ViewFormat, UTF8Format } from './formats'

export const utf8: UTF8Format<string | Uint8Array | Buffer, string>
export const json: UTF8Format<any, any>
export const buffer: BufferFormat<string | Uint8Array | Buffer, Buffer>
export const view: ViewFormat<Uint8Array | string, Uint8Array>
export const hex: BufferFormat<string | Buffer, string>
export const base64: BufferFormat<string | Buffer, string>
