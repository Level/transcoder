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

test('Encoding() throws on invalid type or format option', function (t) {
  t.plan(2 * 6 * 2)

  for (const opt of ['type', 'format']) {
    for (const invalid of [true, false, null, {}, () => {}, []]) {
      try {
        // eslint-disable-next-line no-new
        new Encoding({ [opt]: invalid })
      } catch (err) {
        t.is(err.name, 'TypeError', 'is a TypeError')
        t.is(err.message, `The '${opt}' option must be a string or undefined`, 'correct message')
      }
    }
  }
})

test('Encoding() throws on invalid idempotent option', function (t) {
  t.plan(6 * 2)

  for (const invalid of ['', 'true', null, {}, () => {}, []]) {
    try {
      // eslint-disable-next-line no-new
      new Encoding({ idempotent: invalid })
    } catch (err) {
      t.is(err.name, 'TypeError', 'is a TypeError')
      t.is(err.message, "The 'idempotent' option must be a boolean or undefined", 'correct message')
    }
  }
})

test('Encoding() sets format based on format option or legacy buffer option', function (t) {
  t.is(new Encoding({ buffer: true }).format, 'buffer')
  t.is(new Encoding({ buffer: false }).format, 'utf8')
  t.is(new Encoding({ format: 'buffer', buffer: true }).format, 'buffer')
  t.is(new Encoding({ format: 'buffer', buffer: false }).format, 'buffer')
  t.is(new Encoding({ format: 'view', buffer: false }).format, 'view')
  t.is(new Encoding({ format: 'view', buffer: true }).format, 'view')

  for (const ignored of [0, 1, 'false', 'true']) {
    t.is(new Encoding({ buffer: ignored }).format, 'buffer', 'ignores invalid legacy buffer option')
  }

  t.end()
})

test('encoding.transcode() throws on unsupported format', function (t) {
  t.plan(3 * 2)

  const encoding = new Encoding({ type: 'test' })

  for (const format of ['x', 'buffer', 'view']) {
    try {
      encoding.transcode(format)
    } catch (err) {
      t.is(err.code, 'LEVEL_ENCODING_NOT_SUPPORTED')
      t.is(err.message, `Encoding 'test' cannot be transcoded to '${format}'`)
    }
  }
})
