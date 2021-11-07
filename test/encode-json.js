'use strict'

const test = require('tape')
const { Transcoder } = require('..')

test('encode json', function (t) {
  const transcoder = new Transcoder(['utf8'])
  const encoding = transcoder.encoding('json')
  const expected = '{"x":"6🐄"}'

  t.same(encoding.encode({ x: '6🐄' }), expected)
  t.same(encoding.encode(6), '6')
  t.end()
})

test('decode json', function (t) {
  const transcoder = new Transcoder(['utf8'])
  const encoding = transcoder.encoding('json')

  t.same(encoding.decode('{"x":"6🐄"}'), { x: '6🐄' })
  t.same(encoding.decode(6), 6) // Invalid but we're not handling that
  t.end()
})

test('encode json+buffer', function (t) {
  const transcoder = new Transcoder(['buffer'])
  const encoding = transcoder.encoding('json')
  const expected = Buffer.from('{"x":"6🐄"}')

  t.same(encoding.encode({ x: '6🐄' }), expected)
  t.same(encoding.encode(6), Buffer.from('6'))
  t.end()
})

test('decode json+buffer', function (t) {
  const transcoder = new Transcoder(['buffer'])
  const encoding = transcoder.encoding('json')
  const buffer = Buffer.from('{"x":"6🐄"}')

  t.same(encoding.decode(buffer), { x: '6🐄' })
  t.end()
})

test('encode json+view', function (t) {
  const transcoder = new Transcoder(['view'])
  const encoding = transcoder.encoding('json')
  const expected = Uint8Array.from(Buffer.from('{"x":"6🐄"}'))

  t.same(encoding.encode({ x: '6🐄' }), expected)
  t.same(encoding.encode(6), Uint8Array.from([54]))
  t.end()
})

test('decode json+view', function (t) {
  const transcoder = new Transcoder(['view'])
  const encoding = transcoder.encoding('json')
  const buffer = Buffer.from('{"x":"6🐄"}')

  t.same(encoding.decode(Uint8Array.from(buffer)), { x: '6🐄' })
  t.same(encoding.decode(buffer), { x: '6🐄' })
  t.end()
})
