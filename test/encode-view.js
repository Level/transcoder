'use strict'

const test = require('tape')
const { Transcoder } = require('..')
const cow = [240, 159, 144, 132]

test('encode view', function (t) {
  const transcoder = new Transcoder(['view'])
  const encoding = transcoder.encoding('view')
  const expected = Uint8Array.from(Buffer.from('6🐄'))

  t.same(encoding.encode(Buffer.from('6🐄')), Buffer.from('6🐄')) // Buffer is a Uint8Array
  t.same(encoding.encode('6🐄'), expected)
  t.same(encoding.encode(6), Uint8Array.from([54]))
  t.same(encoding.encode(Uint8Array.from(expected)), expected)
  t.end()
})

test('decode view', function (t) {
  const transcoder = new Transcoder(['view'])
  const encoding = transcoder.encoding('view')
  const expected = Uint8Array.from(Buffer.from('6🐄'))

  t.same(encoding.decode(Uint8Array.from(expected)), expected)
  t.same(encoding.decode(Buffer.from('6🐄')), Buffer.from('6🐄')) // Buffer is a Uint8Array
  t.same(encoding.decode(6), 6) // Invalid but we're not handling that
  t.end()
})

test('encode view+buffer', function (t) {
  const transcoder = new Transcoder(['buffer'])
  const encoding = transcoder.encoding('view')
  const expected = Buffer.from('6🐄')

  t.same(encoding.encode(Uint8Array.from(expected)), expected)
  t.same(encoding.encode(6), Buffer.from('6'))
  t.same(encoding.encode('6🐄'), Buffer.from('6🐄'))
  t.same(encoding.encode(Buffer.from('6🐄')), Buffer.from('6🐄'))
  t.end()
})

test('decode view+buffer', function (t) {
  const transcoder = new Transcoder(['buffer'])
  const encoding = transcoder.encoding('view')
  const expected = Uint8Array.from(Buffer.from('6🐄'))

  t.same(encoding.decode(Uint8Array.from([54, ...cow])), expected)
  t.same(encoding.decode(Buffer.from('6🐄')), Buffer.from('6🐄')) // Buffer is a Uint8Array
  t.end()
})

test('createViewTranscoder() returns this', function (t) {
  const transcoder = new Transcoder(['view'])
  const encoding = transcoder.encoding('view')

  t.is(encoding.createViewTranscoder(), encoding)
  t.end()
})
