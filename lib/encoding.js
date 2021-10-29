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
  constructor (options) {
    if (typeof options.encode !== 'function' && options.encode !== undefined) {
      throw new TypeError("The 'encode' option must be a function or undefined")
    }

    if (typeof options.decode !== 'function' && options.decode !== undefined) {
      throw new TypeError("The 'decode' option must be a function or undefined")
    }

    if (typeof options.name !== 'string' && options.name !== undefined) {
      throw new TypeError("The 'name' option must be a string or undefined")
    }

    if (typeof options.format !== 'string' || options.format === '') {
      throw new TypeError("The 'format' option must be a non-empty string")
    }

    // Loosely typed for ecosystem compatibility
    const maybeType = typeof options.type === 'string' ? options.type : undefined

    /** @type {(data: TIn) => TFormat} */
    this.encode = (options.encode || this.encode || identity).bind(this)

    /** @type {(data: TFormat) => TOut} */
    this.decode = (options.decode || this.decode || identity).bind(this)

    /** @type {string} */
    this.name = options.name || maybeType || `anonymous-${anonymousCount++}`

    /** @type {string} */
    this.format = options.format

    if (options.createViewTranscoder) {
      this.createViewTranscoder = options.createViewTranscoder
    }

    if (options.createBufferTranscoder) {
      this.createBufferTranscoder = options.createBufferTranscoder
    }
  }

  get commonName () {
    return /** @type {string} */ (this.name.split('+')[0])
  }

  /** @return {BufferFormat<TIn,TOut>} */
  createBufferTranscoder () {
    throw new ModuleError(`Encoding '${this.name}' cannot be transcoded to 'buffer'`, {
      code: 'LEVEL_ENCODING_NOT_SUPPORTED'
    })
  }

  /** @return {ViewFormat<TIn,TOut>} */
  createViewTranscoder () {
    throw new ModuleError(`Encoding '${this.name}' cannot be transcoded to 'view'`, {
      code: 'LEVEL_ENCODING_NOT_SUPPORTED'
    })
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
