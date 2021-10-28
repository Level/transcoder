'use strict'

const test = require('tape')
const Transcoder = require('..')

test('Transcoder() throws if first argument is not iterable', function (t) {
  t.plan(5 * 2)

  for (const invalid of [null, undefined, false, 'foo', {}]) {
    try {
      // eslint-disable-next-line no-new
      new Transcoder(invalid)
    } catch (err) {
      t.is(err.name, 'TypeError')
      t.is(err.message, "The first argument 'formats' must be an Iterable")
    }
  }
})

test('transcoder.types()', function (t) {
  let transcoder = new Transcoder([])
  t.same(transcoder.types(), [])
  t.same(transcoder.types(true), [])

  transcoder = new Transcoder(['utf8'])
  t.same(transcoder.types(), ['utf8', 'json'])
  t.same(transcoder.types(true), ['utf8', 'json'])

  transcoder = new Transcoder(['buffer'])
  t.same(transcoder.types(), ['utf8', 'json', 'buffer', 'view', 'hex', 'base64'])
  t.same(transcoder.types(true), ['utf8+buffer', 'json+buffer', 'buffer', 'view+buffer', 'hex', 'base64'])

  transcoder = new Transcoder(['view'])
  t.same(transcoder.types(), ['utf8', 'json', 'buffer', 'view', 'hex', 'base64'])
  t.same(transcoder.types(true), ['utf8+view', 'json+view', 'buffer+view', 'view', 'hex+view', 'base64+view'])

  transcoder = new Transcoder(['id'])
  t.same(transcoder.types(), ['id'])
  t.same(transcoder.types(true), ['id'])

  transcoder = new Transcoder(['buffer'])
  transcoder.encoding({ encode: (v) => v, decode: (v) => v, type: 'x', format: 'buffer' })
  t.same(transcoder.types(), ['utf8', 'json', 'buffer', 'view', 'hex', 'base64', 'x'])
  t.same(transcoder.types(true), ['utf8+buffer', 'json+buffer', 'buffer', 'view+buffer', 'hex', 'base64', 'x'])

  transcoder.encoding({ encode: (v) => v, decode: (v) => v, type: 'y', format: 'view' })
  t.same(transcoder.types(), ['utf8', 'json', 'buffer', 'view', 'hex', 'base64', 'x', 'y'])
  t.same(transcoder.types(true), ['utf8+buffer', 'json+buffer', 'buffer', 'view+buffer', 'hex', 'base64', 'x', 'y+buffer'])

  t.end()
})

test('Transcoder() throws if format is an alias', function (t) {
  t.plan(3 * 2)

  for (const [alias, type] of ['binary:buffer', 'utf-8:utf8', 'none:id'].map(s => s.split(':'))) {
    try {
      // eslint-disable-next-line no-new
      new Transcoder([alias])
    } catch (err) {
      t.is(err.code, 'LEVEL_ENCODING_NOT_SUPPORTED')
      t.is(err.message, `The '${alias}' alias is not supported here; use '${type}' instead`)
    }
  }
})

test('transcoder.encoding() throws if argument is not a valid encoding', function (t) {
  t.plan(4 * 2)

  const transcoder = new Transcoder(['buffer'])

  for (const invalid of [null, undefined, true, '']) {
    try {
      transcoder.encoding(invalid)
    } catch (err) {
      t.is(err.name, 'TypeError')
      t.is(err.message, "First argument 'encoding' must be a string or object")
    }
  }
})

test('transcoder.encoding() throws if encoding is not found', function (t) {
  t.plan(3 * 2)

  const transcoder = new Transcoder(['buffer'])

  for (const type of ['x', 'buffer+', '+buffer']) {
    try {
      transcoder.encoding(type)
    } catch (err) {
      t.is(err.code, 'LEVEL_ENCODING_NOT_FOUND')
      t.is(err.message, `Encoding '${type}' is not found`)
    }
  }
})

test('transcoder.encoding() throws if encoding cannot be transcoded', function (t) {
  t.plan(2)

  for (const [format, type] of [['buffer', 'id']]) {
    const transcoder = new Transcoder([format])

    try {
      transcoder.encoding(type)
    } catch (err) {
      t.is(err.code, 'LEVEL_ENCODING_NOT_SUPPORTED')
      t.is(err.message, `Encoding '${type}' cannot be transcoded to '${format}'`)
    }
  }
})

test('transcoder.encoding() throws if encoding is not supported', function (t) {
  t.plan(2)

  for (const [format, type] of [['utf8', 'buffer']]) {
    const transcoder = new Transcoder([format])

    try {
      transcoder.encoding(type)
    } catch (err) {
      t.is(err.code, 'LEVEL_ENCODING_NOT_SUPPORTED')
      t.is(err.message, `Encoding '${type}' is not supported`)
    }
  }
})

test('transcoder.encoding() throws if custom encoding is not supported', function (t) {
  t.plan(2 * 4)

  const transcoder = new Transcoder(['utf8'])
  const newOpts = { format: 'buffer' }
  const legacyOpts = { buffer: true }

  for (const opts of [newOpts, legacyOpts]) {
    try {
      transcoder.encoding({ encode: (v) => v, decode: (v) => v, type: 'x', ...opts })
    } catch (err) {
      t.is(err.code, 'LEVEL_ENCODING_NOT_SUPPORTED')
      t.is(err.message, "Encoding 'x' is not supported")
    }

    try {
      transcoder.encoding({ encode: (v) => v, decode: (v) => v, ...opts })
    } catch (err) {
      t.is(err.code, 'LEVEL_ENCODING_NOT_SUPPORTED')
      t.ok(/^Encoding 'anonymous-\d+' is not supported$/.test(err.message))
    }
  }
})

test('transcoder.encoding() caches encodings', function (t) {
  const transcoder = new Transcoder(['buffer'])

  const view = transcoder.encoding('view')
  t.is(transcoder.encoding('view'), view, 'caches transcoded encoding')
  t.is(transcoder.encoding(view), view, 'caches encoding instance')

  const buffer = transcoder.encoding('buffer')
  t.is(transcoder.encoding('buffer'), buffer, 'caches non-transcoded encoding')
  t.is(transcoder.encoding('binary'), buffer, 'caches aliased encoding')
  t.is(transcoder.encoding(buffer), buffer, 'caches encoding instance')

  const customOpts = { encode: (v) => v, decode: (v) => v, type: 'test' }
  const custom = transcoder.encoding(customOpts)
  t.is(transcoder.encoding(customOpts), custom, 'caches custom encoding')
  t.is(transcoder.encoding('test'), custom, 'caches custom encoding by type')
  t.is(transcoder.encoding(custom), custom, 'caches custom encoding by instance')

  const anonymousOpts = { encode: (v) => v, decode: (v) => v }
  const anonymous = transcoder.encoding(anonymousOpts)
  t.is(transcoder.encoding(anonymous), anonymous, 'caches anonymous encoding')
  t.is(transcoder.encoding(anonymous.type), anonymous, 'caches anonymous encoding by type')
  t.is(transcoder.encoding(anonymous), anonymous, 'caches anonymous encoding by instance')

  const unique = new Set([view, buffer, custom, anonymous])
  t.is(unique.size, 4, 'created 4 unique encodings')

  t.end()
})

test('transcoder.encoding() wraps custom anonymous encoding', function (t) {
  const transcoder = new Transcoder(['buffer', 'view', 'utf8'])
  const spy = (v) => v + 1
  const opts = { encode: spy, decode: spy }
  const verify = (encoding) => {
    t.is(encoding.encode(1), 2, 'has encode() function')
    t.is(encoding.decode(1), 2, 'has decode() function')
    t.ok(/^anonymous-\d+$/.test(encoding.type), 'is anonymous: ' + encoding.type)
    t.is(encoding.buffer, undefined, 'does not expose legacy buffer option')
  }

  const a = transcoder.encoding({ ...opts })
  verify(a, false)
  t.is(a.format, 'buffer', 'defaults to buffer format')

  for (const format of ['buffer', 'view', 'utf8']) {
    const b = transcoder.encoding({ ...opts, format })
    verify(b, false)
    t.is(b.format, format, `format can be set to ${format}`)
  }

  const c = transcoder.encoding({ ...opts, buffer: true })
  verify(c, false)
  t.is(c.format, 'buffer', 'respects legacy buffer option')

  const d = transcoder.encoding({ ...opts, buffer: false })
  verify(d, false)
  t.is(d.format, 'utf8', 'respects legacy buffer option')

  for (const ignored of [0, 1, 'false', 'true']) {
    const e = transcoder.encoding({ ...opts, buffer: ignored })
    verify(e, false)
    t.is(e.format, 'buffer', 'ignores invalid legacy buffer option')
  }

  t.end()
})
