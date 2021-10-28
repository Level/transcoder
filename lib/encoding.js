'use strict'

const ModuleError = require('module-error')

/**
 * @template TIn, TFormat, TOut
 * @abstract
 */
class Encoding {
  /**
   * @param {EncodingOptions<TIn,TFormat,TOut>} options
   */
  constructor ({
    encode,
    decode,
    type,
    format,
    buffer,
    createViewTranscoder,
    createBufferTranscoder
  }) {
    if (typeof encode !== 'function' && encode !== undefined) {
      throw new TypeError("The 'encode' option must be a function or undefined")
    }

    if (typeof decode !== 'function' && decode !== undefined) {
      throw new TypeError("The 'decode' option must be a function or undefined")
    }

    if (typeof type !== 'string' && type !== undefined) {
      throw new TypeError("The 'type' option must be a string or undefined")
    }

    if (typeof format !== 'string' && format !== undefined) {
      throw new TypeError("The 'format' option must be a string or undefined")
    }

    /** @type {(data: TIn) => TFormat} */
    this.encode = (encode || this.encode || identity).bind(this)

    /** @type {(data: TFormat) => TOut} */
    this.decode = (decode || this.decode || identity).bind(this)

    /** @type {string} */
    this.type = type || `anonymous-${anonymousCount++}`

    /** @type {string} */
    this.format = format || (buffer === false ? 'utf8' : 'buffer')

    /** @type {boolean} */
    this.idempotent = this.type === this.format

    if (createViewTranscoder) {
      this.createViewTranscoder = createViewTranscoder
    }

    if (createBufferTranscoder) {
      this.createBufferTranscoder = createBufferTranscoder
    }
  }

  /** @return {BufferFormat<TIn,TOut>|undefined} */
  createBufferTranscoder () {
    return undefined
  }

  /** @return {ViewFormat<TIn,TOut>|undefined} */
  createViewTranscoder () {
    return undefined
  }

  /**
   * @param {'view'|'buffer'} format
   * @returns {ViewFormat<TIn, TOut>|BufferFormat<TIn, TOut>}
   */
  transcode (format) {
    if (format === 'view') {
      const transcoder = this.createViewTranscoder()
      if (transcoder !== undefined) return transcoder
    } else if (format === 'buffer') {
      const transcoder = this.createBufferTranscoder()
      if (transcoder !== undefined) return transcoder
    }

    throw new ModuleError(
      `Encoding '${this.type}' cannot be transcoded to '${format}'`,
      { code: 'LEVEL_ENCODING_NOT_SUPPORTED' }
    )
  }
}

exports.Encoding = Encoding

/** @type {<T>(v: T) => v} */
const identity = (v) => v

let anonymousCount = 0

/**
 * @typedef {import('./encoding').EncodingOptions<TIn,TFormat,TOut>} EncodingOptions
 * @template TIn, TFormat, TOut
 */

/**
 * @typedef {import('./formats').BufferFormat<TIn,TOut>} BufferFormat
 * @template TIn, TOut
 */

/**
 * @typedef {import('./formats').ViewFormat<TIn,TOut>} ViewFormat
 * @template TIn, TOut
 */
