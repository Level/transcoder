import { BufferFormat, ViewFormat } from './formats'

/**
 * Encodes {@link TIn} to {@link TFormat} and decodes
 * {@link TFormat} to {@link TOut}.
 */
export abstract class Encoding<TIn, TFormat, TOut> {
  constructor (options: EncodingOptions<TIn, TFormat, TOut>)

  /** Encode data. */
  encode: (data: TIn) => TFormat

  /** Decode data. */
  decode: (data: TFormat) => TOut

  /** Unique name for this encoding. */
  name: string

  /**
   * Common name. If this encoding is a transcoder, {@link name} will be for
   * example 'json+view' and {@link commonName} will be just 'json'. Else
   * {@link name} will equal {@link commonName}.
   */
  get commonName (): string

  /**
   * The name of the (lower-level) encoding used by the return value of
   * {@link encode}. Typically one of 'buffer', 'view', 'utf8'.
   */
  format: string

  /**
   * Create a new encoding that transcodes {@link TFormat} to a view.
   */
  createViewTranscoder (): ViewFormat<TIn, TOut>

  /**
   * Create a new encoding that transcodes {@link TFormat} to a buffer.
   */
  createBufferTranscoder (): BufferFormat<TIn, TOut>
}

export interface EncodingOptions<TIn, TFormat, TOut> {
  /**
   * Encode data.
   */
  encode?: ((data: TIn) => TFormat) | undefined

  /**
   * Decode data.
   */
  decode?: ((data: TFormat) => TOut) | undefined

  /**
   * Unique name for this encoding.
   */
  name?: string | undefined

  /**
   * The name of the (lower-level) encoding used by the return value of
   * {@link encode}. Typically one of 'buffer', 'view', 'utf8'. Defaults to
   * 'buffer' if the {@link buffer} and {@link code} options are also undefined.
   */
  format?: string | undefined

  /**
   * Legacy `level-codec` option that means the same as `format: 'buffer'`
   * if true or `format: 'utf8'` if false. Used only when the {@link format} option
   * is undefined.
   */
  buffer?: boolean | undefined

  /**
   * Legacy `level-codec` alias for {@link name}. Used only when the
   * {@link name} option is undefined.
   */
  type?: any

  /**
   * For compatibility with `multiformats`. If a number, then the encoding is
   * assumed to have a {@link format} of 'view'. Used only when the {@link format}
   * and {@link buffer} options are undefined.
   * @see https://github.com/multiformats/js-multiformats/blob/master/src/codecs/interface.ts
   */
  code?: any

  createViewTranscoder?: (() => ViewFormat<TIn, TOut>) | undefined
  createBufferTranscoder?: (() => BufferFormat<TIn, TOut>) | undefined
}
