import { Encoding, EncodingOptions } from './lib/encoding'

declare class Transcoder<T = any> {
  /**
   * Create a Transcoder.
   * @param formats Formats supported by consumer.
   */
  constructor (formats: Iterable<string>)

  /**
   * Get the types of supported encodings.
   * @param full Return fully qualified types with the formats of trancoded encodings (if any).
   */
  types (full?: boolean): string[]

  /**
   * Get the given encoding, creating a transcoder if necessary.
   * @param encoding Named encoding or encoding object.
   */
  encoding<TIn, TFormat, TOut> (
    encoding: Encoding<TIn, TFormat, TOut>|EncodingOptions<TIn, TFormat, TOut>
  ): Encoding<TIn, T, TOut>

  encoding (encoding: 'utf8'): Encoding<string | Buffer | Uint8Array, T, string>
  encoding (encoding: 'buffer'): Encoding<Buffer | Uint8Array | string, T, Buffer>
  encoding (encoding: 'view'): Encoding<Uint8Array | string, T, Uint8Array>
  encoding (encoding: 'json'): Encoding<any, T, any>
  encoding (encoding: 'hex'): Encoding<Buffer | string, T, string>
  encoding (encoding: 'base64'): Encoding<Buffer | string, T, string>
  encoding (encoding: 'id'): Encoding<any, any, any>
  encoding (encoding: string): Encoding<any, T, any>
}

export = Transcoder
