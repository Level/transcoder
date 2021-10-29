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
    for (const [alias, { name }] of Object.entries(aliases)) {
      if (this[kFormats].has(alias)) {
        throw new ModuleError(`The '${alias}' alias is not supported here; use '${name}' instead`, {
          code: 'LEVEL_ENCODING_NOT_SUPPORTED'
        })
      }
    }

    // Register encodings (done early in order to populate encodings())
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
   * @returns {Array<Encoding<any,T,any>>}
   */
  encodings () {
    return Array.from(new Set(this[kEncodings].values()))
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
          throw new ModuleError(`Encoding '${encoding}' is not found`, {
            code: 'LEVEL_ENCODING_NOT_FOUND'
          })
        }
      } else if (typeof encoding !== 'object' || encoding === null) {
        throw new TypeError("First argument 'encoding' must be a string or object")
      } else if (encoding instanceof Encoding) {
        resolved = encoding
      } else {
        resolved = from(encoding)
      }

      const { name, format } = resolved

      if (!this[kFormats].has(format)) {
        if (this[kFormats].has('view')) {
          resolved = resolved.createViewTranscoder()
        } else if (this[kFormats].has('buffer')) {
          resolved = resolved.createBufferTranscoder()
        } else {
          throw new ModuleError(`Encoding '${name}' is not supported`, {
            code: 'LEVEL_ENCODING_NOT_SUPPORTED'
          })
        }
      }

      for (const k of [encoding, name, resolved.name, resolved.commonName]) {
        this[kEncodings].set(k, resolved)
      }
    }

    return resolved
  }
}

module.exports = Transcoder

/**
 * @param {EncodingOptions<any, any, any>} options
 * @returns {Encoding<any, any, any>}
 */
function from (options) {
  const format = detectFormat(options)

  switch (format) {
    case 'view': return new ViewFormat(options)
    case 'utf8': return new UTF8Format(options)
    case 'buffer': return new BufferFormat(options)
    default: {
      throw new ModuleError(`Encoding '${format}' is not supported`, {
        code: 'LEVEL_ENCODING_NOT_SUPPORTED'
      })
    }
  }
}

/**
 * If format is not provided, fallback to detecting `level-codec`
 * or `multiformats` encodings, else assume a format of buffer.
 * @param {EncodingOptions<any, any, any>} options
 * @returns {string}
 */
function detectFormat ({ format, buffer, code }) {
  if (format !== undefined) {
    return format
  } else if (typeof buffer === 'boolean') {
    return buffer ? 'buffer' : 'utf8' // level-codec
  } else if (Number.isInteger(code)) {
    return 'view' // multiformats
  } else {
    return 'buffer'
  }
}

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
