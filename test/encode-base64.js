'use strict'

const test = require('tape')
const Transcoder = require('..')

test('encode base64', function (t) {
  const transcoder = new Transcoder(['buffer'])
  const encoding = transcoder.encoding('base64')

  t.is(encoding.type, 'base64')
  t.same(encoding.encode('YQ=='), Buffer.from('a'))
  t.same(encoding.encode(Buffer.from('a')), Buffer.from('a'))
  t.end()
})

test('decode base64', function (t) {
  const transcoder = new Transcoder(['buffer'])
  const encoding = transcoder.encoding('base64')

  t.is(encoding.type, 'base64')
  t.is(encoding.decode(Buffer.from('a')), 'YQ==')
  t.end()
})

test('encode base64+view', function (t) {
  const transcoder = new Transcoder(['view'])
  const encoding = transcoder.encoding('base64')

  t.is(encoding.type, 'base64+view')
  t.same(encoding.encode('YQ=='), Buffer.from('a')) // Buffer is a Uint8Array
  t.same(encoding.encode(Buffer.from('a')), Buffer.from('a'))
  t.end()
})

test('decode base64+view', function (t) {
  const transcoder = new Transcoder(['view'])
  const encoding = transcoder.encoding('base64')

  t.is(encoding.type, 'base64+view')
  t.is(encoding.decode(Buffer.from('a')), 'YQ==')
  t.is(encoding.decode(Uint8Array.from(Buffer.from('a'))), 'YQ==')
  t.end()
})
