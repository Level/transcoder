'use strict'

const test = require('tape')
const Transcoder = require('..')

test('encode hex', function (t) {
  const transcoder = new Transcoder(['buffer'])
  const encoding = transcoder.encoding('hex')

  t.is(encoding.name, 'hex')
  t.same(encoding.encode('61'), Buffer.from('a'))
  t.same(encoding.encode(Buffer.from('a')), Buffer.from('a'))
  t.end()
})

test('decode hex', function (t) {
  const transcoder = new Transcoder(['buffer'])
  const encoding = transcoder.encoding('hex')

  t.is(encoding.name, 'hex')
  t.is(encoding.decode(Buffer.from('a')), '61')
  t.end()
})

test('encode hex+view', function (t) {
  const transcoder = new Transcoder(['view'])
  const encoding = transcoder.encoding('hex')

  t.is(encoding.name, 'hex+view')
  t.same(encoding.encode('61'), Buffer.from('a')) // Buffer is a Uint8Array
  t.same(encoding.encode(Buffer.from('a')), Buffer.from('a'))
  t.end()
})

test('decode hex+view', function (t) {
  const transcoder = new Transcoder(['view'])
  const encoding = transcoder.encoding('hex')

  t.is(encoding.name, 'hex+view')
  t.is(encoding.decode(Buffer.from('a')), '61')
  t.is(encoding.decode(Uint8Array.from(Buffer.from('a'))), '61')
  t.end()
})
