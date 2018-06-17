import * as m from './arithmetic';

export class UInt256 {
  public buffer: ArrayBuffer = new ArrayBuffer(m.BYTES);

  public compareTo = this.cmp;
  public subtract = this.sub;
  public divideAndRemainder = this.divmod;
  public divide = this.div;
  public multiply = this.mul;
  public remainder = this.mod;
  public shiftRight = this.shr;
  public shiftLeft = this.shl;

  private isMutable: boolean = false;

  constructor(numberOrBuffer: number | UInt256 | ArrayBuffer);
  constructor(str: string, radix?: number);
  constructor(
    param: string | number | UInt256 | ArrayBuffer,
    radix: number = 10
  ) {
    if (param instanceof ArrayBuffer) {
      this.buffer = param;
      return this;
    }
    if (param instanceof UInt256) {
      this.buffer = param.buffer.slice(0);
      return this;
    }
    if (typeof param === 'number') {
      return new UInt256(param.toString(16), 16);
    }
    const prefixed = 'xX'.indexOf(param[1]) !== -1;
    if (radix === 16 || prefixed) {
      if (m.fromHex(this.buffer, param, prefixed)) {
        throw new TypeError('NAN');
      }
      return this;
    }
    if (radix > m.RADIX_MAX || radix < m.RADIX_MIN) {
      radix = 10;
    }
    for (let i = 0; i < param.length; i += 1) {
      const chr = parseInt(param.charAt(i), radix);
      if (isNaN(chr)) {
        throw new TypeError('NAN');
      }
      this.mul(radix, true).add(chr, true);
    }
    return this;
  }

  public static valueOf(val: number): UInt256 {
    return new UInt256(val.toString(16), 16);
  }

  public mutable(mutable: boolean = true): UInt256 {
    this.isMutable = mutable;
    return this;
  }

  public pow(rval: number, mutate?: boolean): UInt256 {
    rval = Math.max(rval, 0);
    if (rval === 0) {
      return this.div(this, mutate);
    }
    const self = (mutate && this) || this.copy();
    const rv = (mutate && this.copy()) || this;
    // tslint:disable-next-line:no-increment-decrement
    while (--rval) {
      m.mul(self.buffer, rv.buffer);
    }
    return self;
  }

  public add(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    const lval = (mutate && this) || this.copy();
    if (typeof rval === 'number') {
      if (rval < 0 || rval > m.JSNUMBER_MAX_INTEGER) {
        throw new TypeError('NAN');
      }
      m.add(lval.buffer, rval);
    } else {
      m.add(lval.buffer, rval.buffer);
    }
    return lval;
  }

  public safeAdd(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    const res = this.add(rval);
    if (this.gt(res)) {
      throw new TypeError('OF');
    }
    if (mutate) {
      this.buffer = res.buffer;
      return this;
    }
    return res;
  }

  public gcd(rval: UInt256, mutate: boolean = this.isMutable): UInt256 {
    let t = this.mod(rval);
    let num = rval.copy();
    let denom = t;
    while (denom.neq(0)) {
      t = num.mod(denom, true);
      num = denom;
      denom = t;
    }
    if (!mutate) {
      return num;
    }
    this.buffer = num.buffer;
    return this;
  }

  public sub(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    const lval = (mutate && this) || this.copy();
    if (typeof rval === 'number') {
      if (rval < 0 || rval > m.JSNUMBER_MAX_INTEGER) {
        throw new TypeError('NAN');
      }
      m.sub(lval.buffer, rval);
    } else {
      m.sub(lval.buffer, rval.buffer);
    }
    return lval;
  }

  public safeSub(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    if (this.lt(rval)) {
      throw new TypeError('OF');
    }
    return this.sub(rval, mutate);
  }

  public divmod(rval: UInt256 | number): UInt256[] {
    if (typeof rval === 'number') {
      if (rval < 0 || rval > m.JSNUMBER_MAX_INTEGER) {
        throw new TypeError('NAN');
      }
      rval = new UInt256(m.numberToBuffer(rval));
    } else {
      rval = rval.copy();
    }
    const div = rval;
    const mod = this.copy();
    if (m.divmod(mod.buffer, div.buffer)) {
      throw new TypeError('DBZ');
    }
    return [div, mod];
  }

  public div(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    if (typeof rval === 'number') {
      if (rval < 0 || rval > m.JSNUMBER_MAX_INTEGER) {
        throw new TypeError('NAN');
      }
      rval = new UInt256(m.numberToBuffer(rval));
    } else {
      rval = rval.copy();
    }
    const div = rval;
    const mod = this.copy();
    if (m.divmod(mod.buffer, div.buffer)) {
      throw new TypeError('DBZ');
    }
    if (mutate) {
      this.buffer = div.buffer;
    }
    return div;
  }

  public mod(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    if (typeof rval === 'number') {
      if (rval < 0 || rval > m.JSNUMBER_MAX_INTEGER) {
        throw new TypeError('NAN');
      }
      rval = new UInt256(m.numberToBuffer(rval));
    } else {
      rval = rval.copy();
    }
    const div = rval;
    const mod = (mutate && this) || this.copy();
    if (m.divmod(mod.buffer, div.buffer)) {
      throw new TypeError('DBZ');
    }
    return mod;
  }

  public mul(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    const lval = (mutate && this) || this.copy();
    if (typeof rval === 'number') {
      if (rval < 0 || rval > m.JSNUMBER_MAX_INTEGER) {
        throw new TypeError('NAN');
      }
      m.mul(lval.buffer, rval);
    } else {
      m.mul(lval.buffer, rval.buffer);
    }
    return lval;
  }

  public safeMul(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    const res = this.mul(rval);
    if (this.neq(0) && res.div(this).neq(rval)) {
      throw new TypeError('OF');
    }
    if (mutate) {
      this.buffer = res.buffer;
      return this;
    }
    return res;
  }

  public and(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    const lval = (mutate && this) || this.copy();
    if (typeof rval === 'number') {
      if (rval < 0 || rval > m.JSNUMBER_MAX_INTEGER) {
        throw new TypeError('NAN');
      }
      m.and(lval.buffer, rval);
    } else {
      m.and(lval.buffer, rval.buffer);
    }
    return lval;
  }

  public andNot(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    const lval = (mutate && this) || this.copy();
    if (typeof rval === 'number') {
      if (rval < 0 || rval > m.JSNUMBER_MAX_INTEGER) {
        throw new TypeError('NAN');
      }
      m.andNot(lval.buffer, rval);
    } else {
      m.andNot(lval.buffer, rval.buffer);
    }
    return lval;
  }

  public or(rval: UInt256 | number, mutate: boolean = this.isMutable): UInt256 {
    const lval = (mutate && this) || this.copy();
    if (typeof rval === 'number') {
      if (rval < 0 || rval > m.JSNUMBER_MAX_INTEGER) {
        throw new TypeError('NAN');
      }
      m.or(lval.buffer, rval);
    } else {
      m.or(lval.buffer, rval.buffer);
    }
    return lval;
  }

  public xor(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    const lval = (mutate && this) || this.copy();
    if (typeof rval === 'number') {
      if (rval < 0 || rval > m.JSNUMBER_MAX_INTEGER) {
        throw new TypeError('NAN');
      }
      m.xor(lval.buffer, rval);
    } else {
      m.xor(lval.buffer, rval.buffer);
    }
    return lval;
  }

  public not(mutate: boolean = this.isMutable): UInt256 {
    const lval = (mutate && this) || this.copy();
    m.not(lval.buffer);
    return lval;
  }

  public shl(shift: number, mutate: boolean = this.isMutable): UInt256 {
    const lval = (mutate && this) || this.copy();
    if (shift < 0 || shift > m.JSNUMBER_MAX_INTEGER) {
      throw new TypeError('NAN');
    }
    m.shl(lval.buffer, shift);
    return lval;
  }

  public shr(shift: number, mutate: boolean = this.isMutable): UInt256 {
    const lval = (mutate && this) || this.copy();
    if (shift < 0 || shift > m.JSNUMBER_MAX_INTEGER) {
      throw new TypeError('NAN');
    }
    m.shr(lval.buffer, shift);
    return lval;
  }

  public eq(rval: UInt256 | number): boolean {
    if (typeof rval === 'number') {
      if (rval < 0 || rval > m.JSNUMBER_MAX_INTEGER) {
        throw new TypeError('NAN');
      }
      return m.eq(this.buffer, rval);
    }
    return m.eq(this.buffer, rval.buffer);
  }

  public neq(rval: UInt256 | number): boolean {
    return !this.eq(rval);
  }

  public cmp(rval: UInt256 | number): number {
    let result: number;
    if (typeof rval === 'number') {
      if (rval < 0 || rval > m.JSNUMBER_MAX_INTEGER) {
        throw new TypeError('NAN');
      }
      result = m.cmp(this.buffer, rval);
    } else {
      result = m.cmp(this.buffer, rval.buffer);
    }
    return result;
  }

  public lte(rval: UInt256 | number): boolean {
    return this.cmp(rval) <= 0;
  }

  public lt(rval: UInt256 | number): boolean {
    return this.cmp(rval) < 0;
  }

  public gte(rval: UInt256 | number): boolean {
    return this.cmp(rval) >= 0;
  }

  public gt(rval: UInt256 | number): boolean {
    return this.cmp(rval) > 0;
  }

  public copy(): UInt256 {
    return new UInt256(this.buffer.slice(0));
  }

  public valueOf(): number {
    return m.toNumber(this.buffer);
  }

  public toString(radix: number = 10): string {
    if (radix === 16) {
      return m.toHex(this.buffer);
    }
    if (radix > m.RADIX_MAX || radix < m.RADIX_MIN) {
      radix = 10;
    }
    if (m.cmp(this.buffer, m.JSNUMBER_MAX_INTEGER) <= 0) {
      return this.valueOf().toString(radix);
    }
    let out: string = '';
    let divmod: UInt256[] = [];
    divmod[0] = this;
    divmod[1] = new UInt256(0);
    do {
      divmod = divmod[0].divmod(radix);
      out = m.ALPHABET.charAt(divmod[1].valueOf() & m.BYTE_MASK) + out;
    } while (m.cmp(divmod[0].buffer, 0) > 0);
    return out;
  }

  public toJSON(): string {
    return this.toString();
  }

  public toByteArray(): Uint8Array {
    return new Uint8Array(this.buffer.slice(0));
  }

  public testBit(n: number): boolean {
    const buffer = this.buffer.slice(0);
    m.shr(buffer, n);
    m.and(buffer, 1);
    return m.eq(buffer, 1);
  }

  public setBit(n: number, mutate: boolean = this.isMutable): UInt256 {
    const lval = (mutate && this) || this.copy();
    const nbuffer = new ArrayBuffer(m.BYTES);
    m.add(nbuffer, 1);
    m.shl(nbuffer, n);
    m.or(lval.buffer, nbuffer);
    return lval;
  }

  public flipBit(n: number, mutate: boolean = this.isMutable): UInt256 {
    const lval = (mutate && this) || this.copy();
    const nbuffer = new ArrayBuffer(m.BYTES);
    m.add(nbuffer, 1);
    m.shl(nbuffer, n);
    m.xor(lval.buffer, nbuffer);
    return lval;
  }

  public clearBit(n: number, mutate: boolean = this.isMutable): UInt256 {
    const lval = (mutate && this) || this.copy();
    const nbuffer = new ArrayBuffer(m.BYTES);
    m.add(nbuffer, 1);
    m.shl(nbuffer, n);
    m.not(nbuffer);
    m.and(lval.buffer, nbuffer);
    return lval;
  }

  public bitCount(): number {
    return m.pop(this.buffer);
  }

  public negate(mutate: boolean = this.isMutable): UInt256 {
    const lval = (mutate && this) || this.copy();
    m.comp(lval.buffer);
    return lval;
  }

  public min(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    const lval = (mutate && this) || this.copy();
    if (typeof rval === 'number') {
      if (rval < 0 || rval > m.JSNUMBER_MAX_INTEGER) {
        throw new TypeError('NAN');
      }
      rval = new UInt256(m.numberToBuffer(rval));
    } else {
      rval = rval.copy();
    }
    if (rval.lt(lval)) {
      lval.buffer = rval.buffer;
    }
    return lval;
  }

  public max(
    rval: UInt256 | number,
    mutate: boolean = this.isMutable
  ): UInt256 {
    const lval = (mutate && this) || this.copy();
    if (typeof rval === 'number') {
      if (rval < 0 || rval > m.JSNUMBER_MAX_INTEGER) {
        throw new TypeError('NAN');
      }
      rval = new UInt256(m.numberToBuffer(rval));
    } else {
      rval = rval.copy();
    }
    if (rval.gt(lval)) {
      lval.buffer = rval.buffer;
    }
    return lval;
  }
}

/* tslint:disable:function-name */
export function U256(num: number): UInt256;
export function U256(str: string, radix?: number): UInt256;
export function U256(param: string | number, param2?: number): UInt256 {
  if (typeof param === 'string') {
    return new UInt256(param, param2);
  }
  return new UInt256(param);
}
/* tslint:enable:function-name */
