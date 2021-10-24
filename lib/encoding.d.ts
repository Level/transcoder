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
  type: string

  /** Format returned by {@link encode}. */
  format: string

  /**
   * Whether {@link encode} and {@link decode} are idempotent
   * functions, such that `f(x) == f(f(x))`.
   */
  idempotent: boolean

  createViewTranscoder (): ViewFormat<TIn, TOut> | undefined
  createBufferTranscoder (): BufferFormat<TIn, TOut> | undefined

  /**
   * Create a new encoding that transcodes from this to {@link format}.
   * @param format What to encode to.
   */
  transcode (format: 'view'): ViewFormat<TIn, TOut>
  transcode (format: 'buffer'): BufferFormat<TIn, TOut>
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
  type?: string | undefined

  /**
   * Format returned by {@link encode}.
   */
  format?: string | undefined

  /**
   * Whether {@link encode} and {@link decode} are idempotent
   * functions, such that `f(x) == f(f(x))`.
   */
  idempotent?: boolean | undefined

  /**
   * Legacy property that means the same as `format: 'buffer'`.
   * Used only when `format` is not provided.
   */
  buffer?: boolean | undefined

  createViewTranscoder?: (() => ViewFormat<TIn, TOut>) | undefined
  createBufferTranscoder?: (() => BufferFormat<TIn, TOut>) | undefined
}
