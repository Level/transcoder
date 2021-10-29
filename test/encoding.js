'use strict'

const test = require('tape')
const { Encoding } = require('../lib/encoding')

test('Encoding() throws on invalid encode or decode option', function (t) {
  t.plan(2 * 6 * 2)

  for (const opt of ['encode', 'decode']) {
    for (const invalid of [true, false, null, '', 'x', {}]) {
      try {
        // eslint-disable-next-line no-new
        new Encoding({ [opt]: invalid })
      } catch (err) {
        t.is(err.name, 'TypeError', 'is a TypeError')
        t.is(err.message, `The '${opt}' option must be a function or undefined`, 'correct message')
      }
    }
  }
})

test('Encoding() throws on invalid format option', function (t) {
  t.plan(5 * 2)

  for (const invalid of ['', null, undefined, true, 123]) {
    try {
      // eslint-disable-next-line no-new
      new Encoding({ format: invalid })
    } catch (err) {
      t.is(err.name, 'TypeError', 'is a TypeError')
      t.is(err.message, "The 'format' option must be a non-empty string", 'correct message')
    }
  }
})

test('Encoding() throws on invalid name option', function (t) {
  t.plan(6 * 2)

  for (const invalid of [true, false, null, {}, () => {}, []]) {
    try {
      // eslint-disable-next-line no-new
      new Encoding({ name: invalid })
    } catch (err) {
      t.is(err.name, 'TypeError', 'is a TypeError')
      t.is(err.message, "The 'name' option must be a string or undefined", 'correct message')
    }
  }
})

test('Encoding() sets name based on name option or legacy type option', function (t) {
  t.is(new Encoding({ format: 'view', name: 'test' }).name, 'test')
  t.is(new Encoding({ format: 'view', type: 'test' }).name, 'test')
  t.is(new Encoding({ format: 'view', name: 'test', type: 'ignored' }).name, 'test')
  t.is(new Encoding({ format: 'view', type: 'ignored', name: 'test' }).name, 'test')
  t.is(new Encoding({ format: 'view', name: undefined, type: 'test' }).name, 'test')
  t.is(new Encoding({ format: 'view', name: 'test', type: undefined }).name, 'test')

  t.ok(/^anonymous-\d+$/.test(new Encoding({ format: 'view' }).name))
  t.ok(/^anonymous-\d+$/.test(new Encoding({ format: 'view', name: undefined }).name))
  t.ok(/^anonymous-\d+$/.test(new Encoding({ format: 'view', type: undefined }).name))

  for (const ignored of [0, 1, {}, () => {}, null]) {
    t.ok(/^anonymous-\d+$/.test(new Encoding({ format: 'view', type: ignored }).name), 'ignores invalid type option')
  }

  t.end()
})

test('encoding.createXTranscoder() throws on unsupported format', function (t) {
  t.plan(4)

  const encoding = new Encoding({ name: 'test', format: 'buffer' })

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
})
