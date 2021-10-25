'use strict'

const { Buffer } = require('buffer') || {}
const { Encoding } = require('./encoding')
const textEndec = require('./text-endec')

/**
 * @template TIn, TOut
 * @extends {Encoding<TIn,Buffer,TOut>}
 */
class BufferFormat extends Encoding {
  /**
   * @param {EncodingOptions<TIn, Buffer, TOut>} options
   */
  constructor (options) {
    super({ ...options, format: 'buffer' })
  }

  /** @override */
  createViewTranscoder () {
    return new ViewFormat({
      encode: this.encode, // Buffer is a view (UInt8Array)
      decode: (data) => this.decode(
        Buffer.from(data.buffer, data.byteOffset, data.byteLength)
      ),
      type: `${this.type}+view`
    })
  }

  /** @override */
  createBufferTranscoder () {
    return this
  }
}

/**
 * @extends {Encoding<TIn,Uint8Array,TOut>}
 * @template TIn, TOut
 */
class ViewFormat extends Encoding {
  /**
   * @param {EncodingOptions<TIn, Uint8Array, TOut>} options
   */
  constructor (options) {
    super({ ...options, format: 'view' })
  }

  /** @override */
  createBufferTranscoder () {
    return new BufferFormat({
      encode: (data) => {
        const view = this.encode(data)
        return Buffer.from(view.buffer, view.byteOffset, view.byteLength)
      },
      decode: this.decode, // Buffer is a view (UInt8Array)
      type: `${this.type}+buffer`
    })
  }

  /** @override */
  createViewTranscoder () {
    return this
  }
}

/**
 * @extends {Encoding<TIn,string,TOut>}
 * @template TIn, TOut
 */
class UTF8Format extends Encoding {
  /**
   * @param {EncodingOptions<TIn, string, TOut>} options
   */
  constructor (options) {
    super({ ...options, format: 'utf8' })
  }

  /** @override */
  createBufferTranscoder () {
    return new BufferFormat({
      encode: (data) => Buffer.from(this.encode(data), 'utf8'),
      decode: (data) => this.decode(data.toString('utf8')),
      type: `${this.type}+buffer`
    })
  }

  /** @override */
  createViewTranscoder () {
    const { textEncoder, textDecoder } = textEndec()

    return new ViewFormat({
      encode: (data) => textEncoder.encode(this.encode(data)),
      decode: (data) => this.decode(textDecoder.decode(data)),
      type: `${this.type}+view`
    })
  }
}

/**
 * @extends {Encoding<any,any,any>}
 */
class IdentityFormat extends Encoding {
  /**
   * @param {EncodingOptions<any, any, any>} options
   */
  constructor (options) {
    super({ ...options, format: 'id' })
  }
}

/**
 * @extends {Encoding<any,any,any>}
 */
class NativeFormat extends Encoding {
  /**
   * @param {string} nativeType
   */
  constructor (nativeType) {
    super({ type: `${nativeType}+native`, idempotent: true, format: nativeType })
  }
}

exports.BufferFormat = BufferFormat
exports.ViewFormat = ViewFormat
exports.UTF8Format = UTF8Format
exports.IdentityFormat = IdentityFormat
exports.NativeFormat = NativeFormat

/**
 * @typedef {import('./encoding').EncodingOptions<TIn,TFormat,TOut>} EncodingOptions
 * @template TIn, TFormat, TOut
 */
