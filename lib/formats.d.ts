import { Encoding } from './encoding'

export class BufferFormat<TIn, TOut> extends Encoding<TIn, Buffer, TOut> {}
export class ViewFormat<TIn, TOut> extends Encoding<TIn, Uint8Array, TOut> {}
export class UTF8Format<TIn, TOut> extends Encoding<TIn, string, TOut> {}
export class IdentityFormat extends Encoding<any, any, any> {}
