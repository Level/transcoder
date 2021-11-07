'use strict'

const test = require('tape')
const { Encoding } = require('../lib/encoding')
const identity = (v) => v

test('Encoding() throws on invalid encode or decode property', function (t) {
  t.plan(2 * 6 * 2)

  for (const opt of ['encode', 'decode']) {
    for (const invalid of [true, false, null, '', 'x', {}]) {
      try {
        // eslint-disable-next-line no-new
        new Encoding({ encode: identity, decode: identity, name: 'x', format: 'utf8', [opt]: invalid })
      } catch (err) {
        t.is(err.name, 'TypeError', 'is a TypeError')
        t.is(err.message, `The '${opt}' property must be a function`, 'correct message')
      }
    }
  }
})

test('Encoding() throws on invalid format property', function (t) {
  t.plan(4 * 2)

  for (const invalid of ['binary', null, undefined, 123]) {
    try {
      // eslint-disable-next-line no-new
      new Encoding({ encode: identity, decode: identity, name: 'x', format: invalid })
    } catch (err) {
      t.is(err.name, 'TypeError', 'is a TypeError')
      t.is(err.message, "The 'format' property must be one of 'buffer', 'view', 'utf8'", 'correct message')
    }
  }
})

test('Encoding() throws on invalid name property', function (t) {
  t.plan(7 * 2)

  for (const invalid of ['', true, false, null, {}, () => {}, []]) {
    try {
      // eslint-disable-next-line no-new
      new Encoding({ encode: identity, decode: identity, format: 'utf8', name: invalid })
    } catch (err) {
      t.is(err.name, 'TypeError', 'is a TypeError')
      t.is(err.message, "The 'name' property must be a string", 'correct message')
    }
  }
})

test('encoding.createXTranscoder() throws on unsupported format', function (t) {
  t.plan(6)

  const encoding = new Encoding({ encode: identity, decode: identity, name: 'test', format: 'buffer' })

  try {
    encoding.createViewTranscoder()
  } catch (err) {
    t.is(err.code, 'LEVEL_ENCODING_NOT_SUPPORTED')
    t.is(err.message, "Encoding 'test' cannot be transcoded to 'view'")
  }

  try {
    encoding.createBufferTranscoder()
  } catch (err) {
    t.is(err.code, 'LEVEL_ENCODING_NOT_SUPPORTED')
    t.is(err.message, "Encoding 'test' cannot be transcoded to 'buffer'")
  }

  try {
    encoding.createUTF8Transcoder()
  } catch (err) {
    t.is(err.code, 'LEVEL_ENCODING_NOT_SUPPORTED')
    t.is(err.message, "Encoding 'test' cannot be transcoded to 'utf8'")
  }
})

test('can create utf8 transcoder', function (t) {
  t.plan(2)

  const encoding = new Encoding({
    encode: identity,
    decode: identity,
    name: 'test',
    format: 'buffer',
    createUTF8Transcoder () {
      t.pass('called')
      return new Encoding({ encode: identity, decode: identity, name: 'test+utf8', format: 'utf8' })
    }
  })

  t.is(encoding.createUTF8Transcoder().name, 'test+utf8')
})
