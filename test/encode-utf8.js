'use strict'

const test = require('tape')
const { Transcoder } = require('..')
const cow = [240, 159, 144, 132]

test('encode utf8', function (t) {
  const transcoder = new Transcoder(['utf8'])
  const encoding = transcoder.encoding('utf8')

  t.is(encoding.encode('6🐄'), '6🐄')
  t.is(encoding.encode(6), '6')
  t.is(encoding.encode(Buffer.from('6🐄')), '6🐄')
  t.is(encoding.encode(Uint8Array.from([54, ...cow])), '6🐄')
  t.end()
})

test('decode utf8', function (t) {
  const transcoder = new Transcoder(['utf8'])
  const encoding = transcoder.encoding('utf8')

  t.is(encoding.decode('6🐄'), '6🐄')
  t.is(encoding.decode(6), 6) // Invalid but we're not handling that
  t.end()
})

test('encode utf8+buffer', function (t) {
  const transcoder = new Transcoder(['buffer'])
  const encoding = transcoder.encoding('utf8')
  const expected = Buffer.from('6🐄')

  t.same(encoding.encode('6🐄'), expected)
  t.same(encoding.encode(6), Buffer.from('6'))
  t.same(encoding.encode(Buffer.from('6🐄')), expected)
  t.same(encoding.encode(Uint8Array.from([54, ...cow])), expected)
  t.end()
})

test('decode utf8+buffer', function (t) {
  const transcoder = new Transcoder(['buffer'])
  const encoding = transcoder.encoding('utf8')

  t.is(encoding.decode(Buffer.from('6🐄')), '6🐄')
  t.end()
})

test('encode utf8+view', function (t) {
  const transcoder = new Transcoder(['view'])
  const encoding = transcoder.encoding('utf8')
  const expected = Uint8Array.from([54, ...cow])

  t.same(encoding.encode('6🐄'), expected)
  t.same(encoding.encode(6), Uint8Array.from([54]))
  t.same(encoding.encode(Buffer.from('6🐄')), Buffer.from('6🐄')) // Buffer is a Uint8Array
  t.same(encoding.encode(Uint8Array.from([54, ...cow])), expected)
  t.end()
})

test('decode utf8+view', function (t) {
  const transcoder = new Transcoder(['view'])
  const encoding = transcoder.encoding('utf8')

  t.is(encoding.decode(Uint8Array.from([54, ...cow])), '6🐄')
  t.is(encoding.decode(Buffer.from('6🐄')), '6🐄')
  t.end()
})

test('createUTF8Transcoder() returns this', function (t) {
  const transcoder = new Transcoder(['utf8'])
  const encoding = transcoder.encoding('utf8')

  t.is(encoding.createUTF8Transcoder(), encoding)
  t.end()
})
