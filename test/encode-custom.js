'use strict'

const test = require('tape')
const Transcoder = require('..')
const textEncoder = new TextEncoder()
const textDecoder = new TextDecoder()

function createEncodingOptions (t, format) {
  return {
    encode (data) {
      t.is(typeof data, 'number', 'data to encode is a number')

      if (format === 'buffer') return Buffer.from(String(data * 2))
      if (format === 'view') return Uint8Array.from(Buffer.from(String(data * 2)))
      if (format === 'utf8') return String(data * 2)

      throw new Error(`Unexpected format: ${format}`)
    },
    decode (data) {
      if (format === 'buffer') {
        t.ok(Buffer.isBuffer(data), 'data to decode is a buffer')
        return parseInt(data.toString(), 10) / 2
      } else if (format === 'view') {
        t.ok(data instanceof Uint8Array, 'data to decode is a view')
        return parseInt(textDecoder.decode(data), 10) / 2
      } else if (format === 'utf8') {
        t.is(typeof data, 'string', 'data to decode is a string')
        return parseInt(data, 10) / 2
      }
    },
    type: 'custom',
    format
  }
}

function doublepass (t, encoding, input, expected) {
  const encoded = encoding.encode(input)
  t.same(encoded, expected, 'correctly encoded')
  const decoded = encoding.decode(encoded)
  t.same(decoded, input, 'correctly decoded')
}

test('encode custom (utf8)', function (t) {
  const transcoder = new Transcoder(['utf8'])
  const encoding = transcoder.encoding(createEncodingOptions(t, 'utf8'))
  doublepass(t, encoding, 16, '32')
  t.end()
})

test('encode custom (buffer)', function (t) {
  const transcoder = new Transcoder(['buffer'])
  const encoding = transcoder.encoding(createEncodingOptions(t, 'buffer'))
  doublepass(t, encoding, 16, Buffer.from('32'))
  t.end()
})

test('encode custom (utf8) +buffer', function (t) {
  const transcoder = new Transcoder(['buffer'])
  const encoding = transcoder.encoding(createEncodingOptions(t, 'utf8'))
  t.is(encoding.type, 'custom+buffer')
  t.is(encoding.format, 'buffer')
  doublepass(t, encoding, 16, Buffer.from('32'))
  t.end()
})

test('encode custom (view) +buffer', function (t) {
  const transcoder = new Transcoder(['buffer'])
  const encoding = transcoder.encoding(createEncodingOptions(t, 'view'))
  t.is(encoding.type, 'custom+buffer')
  t.is(encoding.format, 'buffer')
  doublepass(t, encoding, 16, Buffer.from('32'))
  t.end()
})

test('encode custom (view)', function (t) {
  const transcoder = new Transcoder(['view'])
  const encoding = transcoder.encoding(createEncodingOptions(t, 'view'))
  doublepass(t, encoding, 16, textEncoder.encode('32'))
  t.end()
})

test('encode custom (utf8) +view', function (t) {
  const transcoder = new Transcoder(['view'])
  const encoding = transcoder.encoding(createEncodingOptions(t, 'utf8'))
  t.is(encoding.type, 'custom+view')
  t.is(encoding.format, 'view')
  doublepass(t, encoding, 16, textEncoder.encode('32'))
  t.end()
})

test('encode custom (buffer) +view', function (t) {
  const transcoder = new Transcoder(['view'])
  const encoding = transcoder.encoding(createEncodingOptions(t, 'buffer'))
  t.is(encoding.type, 'custom+view')
  t.is(encoding.format, 'view')
  doublepass(t, encoding, 16, Buffer.from('32')) // Buffer is Uint8Array
  t.is(encoding.decode(textEncoder.encode('32')), 16)
  t.end()
})
