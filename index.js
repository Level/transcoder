'use strict'

const ModuleError = require('module-error')
const encodings = require('./lib/encodings')
const { Encoding } = require('./lib/encoding')
const { BufferFormat, ViewFormat, UTF8Format } = require('./lib/formats')

const kFormats = Symbol('formats')
const kEncodings = Symbol('encodings')

/** @template T */
class Transcoder {
  /**
   * @param {Iterable<string>} formats
   */
  constructor (formats) {
    if (formats == null ||
      typeof formats[Symbol.iterator] !== 'function' ||
      typeof formats === 'string') {
      throw new TypeError("The first argument 'formats' must be an Iterable")
    }

    /** @type {Map<string|Encoding<any, any, any>|EncodingOptions<any, any, any>, Encoding<any, any, any>>} */
    this[kEncodings] = new Map()
    this[kFormats] = new Set(formats)

    // Only support aliases in key- and valueEncoding options (where we already did)
    for (const [alias, { type }] of Object.entries(aliases)) {
      if (this[kFormats].has(alias)) {
        throw new ModuleError(`The '${alias}' alias is not supported here; use '${type}' instead`, {
          code: 'LEVEL_ENCODING_NOT_SUPPORTED'
        })
      }
    }

    // Register encodings (done early in order to populate types())
    for (const k in encodings) {
      try {
        this.encoding(k)
      } catch (err) {
        /* istanbul ignore if: assertion */
        if (err.code !== 'LEVEL_ENCODING_NOT_SUPPORTED') throw err
      }
    }
  }

  /**
   * @param {boolean} [full]
   */
  types (full) {
    const types = new Set()

    for (const encoding of this[kEncodings].values()) {
      types.add(full ? encoding.type : encoding.type.split('+')[0])
    }

    return Array.from(types)
  }

  /**
   * @param {string|Encoding<any, any, any>|EncodingOptions<any, any, any>} encoding
   * @returns {Encoding<any, T, any>}
   */
  encoding (encoding) {
    let resolved = this[kEncodings].get(encoding)

    if (resolved === undefined) {
      if (typeof encoding === 'string' && encoding !== '') {
        resolved = lookup[encoding]

        if (!resolved) {
          throw new ModuleError(
            `Encoding '${encoding}' is not found`,
            { code: 'LEVEL_ENCODING_NOT_FOUND' }
          )
        }
      } else if (typeof encoding !== 'object' || encoding === null) {
        throw new TypeError("First argument 'encoding' must be a string or object")
      } else if (encoding instanceof Encoding) {
        resolved = encoding
      } else if (encoding.format === 'view') {
        resolved = new ViewFormat(encoding)
      } else if (encoding.format === 'utf8' || encoding.buffer === false) {
        resolved = new UTF8Format(encoding)
      } else {
        resolved = new BufferFormat(encoding)
      }

      const { type, format } = resolved

      if (!this[kFormats].has(format)) {
        if (this[kFormats].has('view')) {
          resolved = resolved.transcode('view')
        } else if (this[kFormats].has('buffer')) {
          resolved = resolved.transcode('buffer')
        } else {
          // TODO: improve error message (see tests, it's inconsistent)
          throw new ModuleError(`Encoding '${type}' is not supported`, {
            code: 'LEVEL_ENCODING_NOT_SUPPORTED'
          })
        }
      }

      for (const k of [encoding, type, resolved.type]) {
        this[kEncodings].set(k, resolved)
      }
    }

    return resolved
  }
}

module.exports = Transcoder

/**
 * @typedef {import('./lib/encoding').EncodingOptions<TIn,TFormat,TOut>} EncodingOptions
 * @template TIn, TFormat, TOut
 */

/**
 * @type {Object.<string, Encoding<any, any, any>>}
 */
const aliases = {
  binary: encodings.buffer,
  'utf-8': encodings.utf8,
  none: encodings.id
}

/**
 * @type {Object.<string, Encoding<any, any, any>>}
 */
const lookup = {
  ...encodings,
  ...aliases
}
