'use strict'

const test = require('tape')
const { Transcoder } = require('..')
const identity = (v) => v

test('Transcoder() throws if first argument is not an array', function (t) {
  t.plan(5 * 2)

  for (const invalid of [null, undefined, false, 'foo', new Set()]) {
    try {
      // eslint-disable-next-line no-new
      new Transcoder(invalid)
    } catch (err) {
      t.is(err.name, 'TypeError')
      t.is(err.message, "The first argument 'formats' must be an array")
    }
  }
})

test('transcoder.encodings()', function (t) {
  const names = (encodings) => encodings.map(enc => enc.name)
  const commonNames = (encodings) => encodings.map(enc => enc.commonName)

  let transcoder = new Transcoder([])
  t.same(transcoder.encodings(), [])

  transcoder = new Transcoder(['utf8'])
  t.same(commonNames(transcoder.encodings()), ['utf8', 'json'])
  t.same(names(transcoder.encodings()), ['utf8', 'json'])

  transcoder = new Transcoder(['buffer'])
  t.same(commonNames(transcoder.encodings()), ['utf8', 'json', 'buffer', 'view', 'hex', 'base64'])
  t.same(names(transcoder.encodings()), ['utf8+buffer', 'json+buffer', 'buffer', 'view+buffer', 'hex', 'base64'])

  transcoder = new Transcoder(['view'])
  t.same(commonNames(transcoder.encodings()), ['utf8', 'json', 'buffer', 'view', 'hex', 'base64'])
  t.same(names(transcoder.encodings()), ['utf8+view', 'json+view', 'buffer+view', 'view', 'hex+view', 'base64+view'])

  transcoder = new Transcoder(['buffer'])
  transcoder.encoding({ encode: (v) => v, decode: (v) => v, name: 'x', format: 'buffer' })
  t.same(commonNames(transcoder.encodings()), ['utf8', 'json', 'buffer', 'view', 'hex', 'base64', 'x'])
  t.same(names(transcoder.encodings()), ['utf8+buffer', 'json+buffer', 'buffer', 'view+buffer', 'hex', 'base64', 'x'])

  transcoder.encoding({ encode: (v) => v, decode: (v) => v, name: 'y', format: 'view' })
  t.same(commonNames(transcoder.encodings()), ['utf8', 'json', 'buffer', 'view', 'hex', 'base64', 'x', 'y'])
  t.same(names(transcoder.encodings()), ['utf8+buffer', 'json+buffer', 'buffer', 'view+buffer', 'hex', 'base64', 'x', 'y+buffer'])

  t.end()
})

test('Transcoder() throws if format is not buffer, view or utf8', function (t) {
  t.plan(3 * 2)

  for (const format of ['binary', 'utf-8', 'xyz']) {
    try {
      // eslint-disable-next-line no-new
      new Transcoder([format])
    } catch (err) {
      t.is(err.name, 'TypeError')
      t.is(err.message, "Format must be one of 'buffer', 'view', 'utf8'")
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

  for (const name of ['x', 'buffer+', '+buffer']) {
    try {
      transcoder.encoding(name)
    } catch (err) {
      t.is(err.code, 'LEVEL_ENCODING_NOT_FOUND')
      t.is(err.message, `Encoding '${name}' is not found`)
    }
  }
})

test('transcoder.encoding() throws if encoding cannot be transcoded', function (t) {
  t.plan(2)

  const transcoder = new Transcoder(['utf8'])

  try {
    transcoder.encoding('buffer')
  } catch (err) {
    t.is(err.code, 'LEVEL_ENCODING_NOT_SUPPORTED')
    t.is(err.message, "Encoding 'buffer' cannot be transcoded to 'utf8'")
  }
})

test('transcoder.encoding() throws if custom encoding is not supported', function (t) {
  t.plan(2 * 4)

  const transcoder = new Transcoder(['utf8'])
  const newOpts = { format: 'buffer' }
  const legacyOpts = { buffer: true }

  for (const opts of [newOpts, legacyOpts]) {
    try {
      transcoder.encoding({ encode: (v) => v, decode: (v) => v, name: 'x', ...opts })
    } catch (err) {
      t.is(err.code, 'LEVEL_ENCODING_NOT_SUPPORTED')
      t.is(err.message, "Encoding 'x' cannot be transcoded to 'utf8'")
    }

    try {
      transcoder.encoding({ encode: (v) => v, decode: (v) => v, ...opts })
    } catch (err) {
      t.is(err.code, 'LEVEL_ENCODING_NOT_SUPPORTED')
      t.ok(/^Encoding 'anonymous-\d+' cannot be transcoded to 'utf8'$/.test(err.message))
    }
  }
})

test('transcoder.encoding() caches encodings', function (t) {
  const transcoder = new Transcoder(['buffer'])

  const view = transcoder.encoding('view')
  t.is(transcoder.encoding('view'), view, 'caches transcoded encoding by commonName')
  t.is(transcoder.encoding('view+buffer'), view, 'caches transcoded encoding by name')
  t.is(transcoder.encoding(view), view, 'caches encoding instance')

  const utf8 = transcoder.encoding('utf8+buffer')
  t.is(transcoder.encoding('utf8'), utf8, 'caches transcoded encoding by commonName')
  t.is(transcoder.encoding('utf8+buffer'), utf8, 'caches transcoded encoding by name')
  t.is(transcoder.encoding(utf8), utf8, 'caches encoding instance')

  const buffer = transcoder.encoding('buffer')
  t.is(transcoder.encoding('buffer'), buffer, 'caches non-transcoded encoding')
  t.is(transcoder.encoding('binary'), buffer, 'caches aliased encoding')
  t.is(transcoder.encoding(buffer), buffer, 'caches encoding instance')

  const customOpts = { encode: (v) => v, decode: (v) => v, name: 'test' }
  const custom = transcoder.encoding(customOpts)
  t.is(transcoder.encoding(customOpts), custom, 'caches custom encoding')
  t.is(transcoder.encoding('test'), custom, 'caches custom encoding by name')
  t.is(transcoder.encoding(custom), custom, 'caches custom encoding by instance')

  const anonymousOpts = { encode: (v) => v, decode: (v) => v }
  const anonymous = transcoder.encoding(anonymousOpts)
  t.is(transcoder.encoding(anonymous), anonymous, 'caches anonymous encoding')
  t.is(transcoder.encoding(anonymous.name), anonymous, 'caches anonymous encoding by name')
  t.is(transcoder.encoding(anonymous), anonymous, 'caches anonymous encoding by instance')

  const unique = new Set([view, utf8, buffer, custom, anonymous])
  t.is(unique.size, 5, 'created unique encodings')

  t.end()
})

test('transcoder.encoding() sets format based on format, buffer or code option', function (t) {
  const make = (opts) => new Transcoder(['buffer', 'view', 'utf8']).encoding({ encode: identity, decode: identity, ...opts })

  t.is(make({ buffer: true }).format, 'buffer')
  t.is(make({ buffer: false }).format, 'utf8')
  t.is(make({ code: 1 }).format, 'view')
  t.is(make({ buffer: false, code: 1 }).format, 'utf8') // Precedence for no particular reason
  t.is(make({ buffer: true, code: 1 }).format, 'buffer') // Precedence for no particular reason
  t.is(make({ format: 'view', buffer: true }).format, 'view')
  t.is(make({ format: 'view', buffer: false }).format, 'view')
  t.is(make({ format: 'buffer', code: 1 }).format, 'buffer')

  for (const ignored of [null, undefined, 1, 'x']) {
    t.is(make({ buffer: ignored }).format, 'buffer', 'ignores invalid legacy buffer option')
  }

  for (const ignored of [null, undefined, 'abc', Infinity, NaN]) {
    t.is(make({ code: ignored }).format, 'buffer', 'ignores invalid code option')
  }

  t.end()
})

test('transcoder.encoding() throws if format is not buffer, view or utf8', function (t) {
  t.plan(2)

  const transcoder = new Transcoder(['buffer'])

  try {
    transcoder.encoding({ name: 'test', format: 'xyz' })
  } catch (err) {
    t.is(err.name, 'TypeError')
    t.is(err.message, "Format must be one of 'buffer', 'view', 'utf8'")
  }
})

test('transcoder.encoding() sets name based on name option or legacy type option', function (t) {
  const [encode, decode, format] = [identity, identity, 'view']
  const make = (opts) => new Transcoder([format]).encoding({ encode, decode, format, ...opts })

  t.is(make({ name: 'test' }).name, 'test')
  t.is(make({ type: 'test' }).name, 'test')
  t.is(make({ name: 'test', type: 'ignored' }).name, 'test')
  t.is(make({ type: 'ignored', name: 'test' }).name, 'test')
  t.is(make({ name: undefined, type: 'test' }).name, 'test')
  t.is(make({ name: 'test', type: undefined }).name, 'test')

  t.ok(/^anonymous-\d+$/.test(make({}).name))
  t.ok(/^anonymous-\d+$/.test(make({ name: undefined }).name))
  t.ok(/^anonymous-\d+$/.test(make({ type: undefined }).name))

  for (const ignored of [0, 1, {}, () => {}, null]) {
    t.ok(/^anonymous-\d+$/.test(make({ type: ignored }).name), 'ignores invalid type option')
  }

  t.end()
})

test('transcoder.encoding() wraps custom anonymous encoding', function (t) {
  const transcoder = new Transcoder(['buffer', 'view', 'utf8'])
  const spy = (v) => v + 1
  const opts = { encode: spy, decode: spy }
  const verify = (encoding) => {
    t.is(encoding.encode(1), 2, 'has encode() function')
    t.is(encoding.decode(1), 2, 'has decode() function')
    t.ok(/^anonymous-\d+$/.test(encoding.name), 'is anonymous: ' + encoding.name)
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
