'use strict'

const { Buffer } = require('buffer') || {}
const { textEncoder, textDecoder } = require('./text-endec')()
const { BufferFormat, ViewFormat, UTF8Format, IdentityFormat } = require('./formats')

/**
 * @type {UTF8Format<string|Buffer|Uint8Array, string>}
 */
exports.utf8 = new UTF8Format({
  encode: function (data) {
    // TODO: document that this now always returns a string
    // On node 16.9.1 buffer.toString() is 5x faster than TextDecoder
    return Buffer.isBuffer(data)
      ? data.toString('utf8')
      : ArrayBuffer.isView(data)
        ? textDecoder.decode(data)
        : String(data)
  },
  type: 'utf8',
  createViewTranscoder () {
    return new ViewFormat({
      encode: function (data) {
        return ArrayBuffer.isView(data) ? data : textEncoder.encode(data)
      },
      decode: function (data) {
        return textDecoder.decode(data)
      },
      type: `${this.type}+view`
    })
  },
  createBufferTranscoder () {
    return new BufferFormat({
      encode: function (data) {
        return Buffer.isBuffer(data)
          ? data
          : ArrayBuffer.isView(data)
            ? Buffer.from(data.buffer, data.byteOffset, data.byteLength)
            : Buffer.from(String(data), 'utf8')
      },
      decode: function (data) {
        return data.toString('utf8')
      },
      type: `${this.type}+buffer`
    })
  }
})

/**
 * @type {UTF8Format<any, any>}
 */
exports.json = new UTF8Format({
  encode: JSON.stringify,
  decode: JSON.parse,
  type: 'json'
})

/**
 * @type {BufferFormat<Buffer|Uint8Array|string, Buffer>}
 */
exports.buffer = new BufferFormat({
  encode: function (data) {
    return Buffer.isBuffer(data)
      ? data
      : ArrayBuffer.isView(data)
        ? Buffer.from(data.buffer, data.byteOffset, data.byteLength)
        : Buffer.from(String(data), 'utf8')
  },
  type: 'buffer',
  createViewTranscoder () {
    return new ViewFormat({
      encode: function (data) {
        return ArrayBuffer.isView(data) ? data : Buffer.from(String(data), 'utf8')
      },
      decode: function (data) {
        return Buffer.from(data.buffer, data.byteOffset, data.byteLength)
      },
      type: `${this.type}+view`
    })
  }
})

/**
 * @type {ViewFormat<Uint8Array|string, Uint8Array>}
 */
exports.view = new ViewFormat({
  encode: function (data) {
    return ArrayBuffer.isView(data) ? data : textEncoder.encode(data)
  },
  type: 'view',
  createBufferTranscoder () {
    return new BufferFormat({
      encode: function (data) {
        return Buffer.isBuffer(data)
          ? data
          : ArrayBuffer.isView(data)
            ? Buffer.from(data.buffer, data.byteOffset, data.byteLength)
            : Buffer.from(String(data), 'utf8')
      },
      type: `${this.type}+buffer`
    })
  }
})

exports.id = new IdentityFormat({
  type: 'id'
})

// TODO: document removed encodings (ascii, ucs2/ucs-2, utf16le/utf-16le)
// TODO: perhaps even remove all of them

/**
 * @type {BufferFormat<Buffer|string, string>}
 */
exports.hex = new BufferFormat({
  encode: function (data) {
    return Buffer.isBuffer(data) ? data : Buffer.from(String(data), 'hex')
  },
  decode: function (buffer) {
    return buffer.toString('hex')
  },
  type: 'hex'
})

/**
 * @type {BufferFormat<Buffer|string, string>}
 */
exports.base64 = new BufferFormat({
  encode: function (data) {
    return Buffer.isBuffer(data) ? data : Buffer.from(String(data), 'base64')
  },
  decode: function (buffer) {
    return buffer.toString('base64')
  },
  type: 'base64'
})
