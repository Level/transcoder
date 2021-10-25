# level-transcoder

**Encode data with built-in or custom encodings.** The (not yet official) successor to `level-codec`, that introduces "transcoders" to translate between encodings and internal data formats supported by a db. This allows a db to store keys and values in a format of its choice (Buffer, Uint8Array or String) with zero-effort support of all known encodings.

[![level badge][level-badge]](https://github.com/Level/awesome)
[![Test](https://img.shields.io/github/workflow/status/Level/transcoder/Test?label=test)](https://github.com/Level/transcoder/actions/workflows/test.yml)
[![Coverage](https://img.shields.io/codecov/c/github/Level/transcoder?label=&logo=codecov&logoColor=fff)](https://codecov.io/gh/Level/transcoder)
[![Standard](https://img.shields.io/badge/standard-informational?logo=javascript&logoColor=fff)](https://standardjs.com)
[![Common Changelog](https://common-changelog.org/badge.svg)](https://common-changelog.org)
[![Donate](https://img.shields.io/badge/donate-orange?logo=open-collective&logoColor=fff)](https://opencollective.com/level)

## Usage

**This is in POC stage.**

```js
const Transcoder = require('level-transcoder')

// Create a transcoder, passing a desired format
const transcoder1 = new Transcoder(['view'])
const transcoder2 = new Transcoder(['buffer'])
const transcoder3 = new Transcoder(['utf8'])

// Uint8Array(3) [ 49, 50, 51 ]
console.log(transcoder1.encoding('json').encode(123))

// <Buffer 31 32 33>
console.log(transcoder2.encoding('json').encode(123))

// '123'
console.log(transcoder3.encoding('json').encode(123))
```

If given multiple formats (like how `leveldown` can work with both Buffer and strings), the best fitting format is chosen. Not by magic, just hardcoded logic because we don't have that many formats to deal with.

For example, knowing that JSON is a UTF-8 string which matches the desired `utf8` format, the `json` encoding will return a string here:

```js
const transcoder4 = new Transcoder(['buffer', 'utf8'])

// '123'
console.log(transcoder4.encoding('json').encode(123))
```

In contrast, the `view` encoding doesn't match either `buffer` or `utf8` so data encoded by the `view` encoding gets transcoded into Buffers:

```js
// <Buffer 31 32 33>
console.log(transcoder4.encoding('view').encode(Uint8Array.from([49, 50, 51])))
```

Copying of data is avoided where possible. That's true in the last example, because the underlying ArrayBuffer of the view can be passed to a Buffer constructor without a copy.

Lastly, the encoding returned by `Transcoder#encoding()` has a `format` property to be used to forward key- and valueEncoding options to an underlying store. This way, both the public and private API's of a db will be encoding-aware (somewhere in the future).

For example, on `leveldown` a call like `db.put(key, 123, { valueEncoding: 'json' })` will pass that value `123` through a `json` encoding that has a `format` of `utf8`, which is then forwarded as `db._put(key, '123', { valueEncoding: 'utf8' })`.

---

**_Rest of README is not yet updated._**

## API

### `codec = Codec([opts])`

Create a new codec, with a global options object.

### `codec.encodeKey(key[, opts])`

Encode `key` with given `opts`.

### `codec.encodeValue(value[, opts])`

Encode `value` with given `opts`.

### `codec.encodeBatch(batch[, opts])`

Encode `batch` ops with given `opts`.

### `codec.encodeLtgt(ltgt)`

Encode the ltgt values of option object `ltgt`.

### `codec.decodeKey(key[, opts])`

Decode `key` with given `opts`.

### `codec.decodeValue(value[, opts])`

Decode `value` with given `opts`.

### `codec.createStreamDecoder([opts])`

Create a function with signature `(key, value)`, that for each key-value pair returned from a levelup read stream returns the decoded value to be emitted.

### `codec.keyAsBuffer([opts])`

Check whether `opts` and the global `opts` call for a binary key encoding.

### `codec.valueAsBuffer([opts])`

Check whether `opts` and the global `opts` call for a binary value encoding.

### `codec.encodings`

The builtin encodings as object of form

```js
{
  [type]: encoding
}
```

See below for a list and the format of `encoding`.

## Builtin Encodings

| Type                                                              | Input                        | Stored as        | Output    |
| :---------------------------------------------------------------- | :--------------------------- | :--------------- | :-------- |
| `utf8`                                                            | String or Buffer             | String or Buffer | String    |
| `json`                                                            | Any JSON type                | JSON string      | Input     |
| `binary`                                                          | Buffer, string or byte array | Buffer           | As stored |
| `hex`<br>`ascii`<br>`base64`<br>`ucs2`<br>`utf16le`<br>`utf-16le` | String or Buffer             | Buffer           | String    |
| `none` a.k.a. `id`                                                | Any type (bypass encoding)   | Input\*          | As stored |

<sup>\*</sup> Stores may have their own type coercion. Whether type information is preserved depends on the [`abstract-leveldown`] implementation as well as the underlying storage (`LevelDB`, `IndexedDB`, etc).

## Encoding Format

An encoding is an object of the form:

```js
{
  encode: function (data) {
    return data
  },
  decode: function (data) {
    return data
  },
  buffer: Boolean,
  type: 'example'
}
```

All of these properties are required.

The `buffer` boolean tells consumers whether to fetch data as a Buffer, before calling your `decode()` function on that data. If `buffer` is true, it is assumed that `decode()` takes a Buffer. If false, it is assumed that `decode` takes any other type (usually a string).

To explain this in the grand scheme of things, consider a store like [`leveldown`] which has the ability to return either a Buffer or string, both sourced from the same byte array. Wrap this store with [`encoding-down`] and it'll select the most optimal data type based on the `buffer` property of the active encoding. If your `decode()` function needs a string (and the data can legitimately become a UTF8 string), you should set `buffer` to `false`. This avoids the cost of having to convert a Buffer to a string.

The `type` string should be a unique name.

## Contributing

[`Level/transcoder`](https://github.com/Level/transcoder) is an **OPEN Open Source Project**. This means that:

> Individuals making significant and valuable contributions are given commit-access to the project to contribute as they see fit. This project is more like an open wiki than a standard guarded open source project.

See the [Contribution Guide](https://github.com/Level/community/blob/master/CONTRIBUTING.md) for more details.

## Donate

Support us with a monthly donation on [Open Collective](https://opencollective.com/level) and help us continue our work.

## License

[MIT](LICENSE)

[level-badge]: https://leveljs.org/img/badge.svg

[`encoding-down`]: https://github.com/Level/encoding-down

[`abstract-leveldown`]: https://github.com/Level/abstract-leveldown

[`leveldown`]: https://github.com/Level/leveldown
