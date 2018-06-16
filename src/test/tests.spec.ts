import { expect, use } from 'chai';

import { u256chai } from 'src/test/utils/u256chai';

import { UInt256 } from 'src/UInt256';

use(u256chai());

// tslint:disable-next-line
const empty = <any>'';

const pair = (lower: number, upper: number = 0) =>
  new UInt256(
    `${empty.padStart(31, '0')}${upper.toString(16)}${empty.padStart(
      31,
      '0'
    )}${lower.toString(16)}`,
    16
  );

describe('constructor()', () => {
  it('string radix', () => {
    const max = '0x1fffffffffffff';
    const hex = 'ffff';
    const max256 = `0x${empty.padStart(64, 'f')}`;

    expect(new UInt256(max256).toString(16)).to.be.eq(max256.substr(2));
    expect(new UInt256(max).toString(16)).to.be.eq(max.substr(2));
    expect(new UInt256(hex, 16).toString(16)).to.be.eq(hex);

    const alphabet = '123456789abcdef';
    for (let i = 0; i < alphabet.length; i += 1) {
      const char = alphabet.charAt(i);
      const radix = parseInt(char, 16) + 1;
      expect(new UInt256(char, radix).toString(radix)).to.be.eq(char);
      expect(new UInt256(char, radix).valueOf()).to.be.eq(radix - 1);
    }

    expect(() => new UInt256(`${max}V`)).to.throw(TypeError, 'NAN');
  });

  it('number', () => {
    const max = 0x1fffffffffffff;
    expect(new UInt256(max)).to.be.u256.eq(max);
    expect(new UInt256(max + 2).toString(16)).to.be.eq('20000000000000');
  });
});

describe('Addition', () => {
  const a = pair(1, 0);
  const b = pair(0, 1);
  const big = new UInt256(0).not();

  it('1 + 1 = 2', () => {
    expect(a.add(1)).to.be.u256.eq(2);
    expect(a.add(1)).to.be.u256.eq(2);
  });

  it('(1, 0) + (0, 1) = (1, 1)', () => {
    expect(a.add(b)).to.be.u256.eq(pair(1, 1));
  });

  it('should test overflow', () => {
    expect(big.add(1)).to.be.u256.eq(0);
    expect(big.add(b)).to.be.u256.eq(pair(0, 1).sub(1));
  });

  it('should test mutation', () => {
    expect(a.add(a, true)).to.be.u256.eq(2);
    expect(a.add(b, true)).to.be.u256.eq(pair(2, 1));
    expect(b.add(a, true)).to.be.u256.eq(pair(2, 2));
  });
});

describe('Subtraction', () => {
  const small = new UInt256(1);
  const big = new UInt256(0).not();
  const a = pair(2, 1);
  const b = pair(0, 1);
  const c = pair(2, 2);

  it('small - small = 0', () => {
    expect(small.sub(small)).to.be.u256.eq(0);
  });

  it('big - small = xor(big, small)', () => {
    expect(big.sub(small)).to.be.u256.eq(big.xor(small));
    expect(big.subtract(small)).to.be.u256.eq(big.xor(small));
  });

  it('big - big = 0', () => {
    expect(big.sub(big)).to.be.u256.eq(0);
  });

  it('small - big = 2', () => {
    expect(small.sub(big)).to.be.u256.eq(2);
  });

  it('should test mutation', () => {
    expect(c.sub(a, true)).to.be.u256.eq(pair(0, 1));
    expect(c.sub(b, true)).to.be.u256.eq(0);
  });
});

describe('Multiplication', () => {
  const zero = new UInt256(0);
  const one = new UInt256(1);
  const two = new UInt256(2);
  const a = pair(1, 1);

  it('should test nullability', () => {
    expect(one.mul(zero)).to.be.u256.eq(zero);
    expect(zero.mul(one)).to.be.u256.eq(zero);
    expect(zero.mul(zero)).to.be.u256.eq(zero);
  });

  it('should test identity', () => {
    expect(a.mul(one)).to.be.u256.eq(a);
    expect(one.mul(a)).to.be.u256.eq(a);
  });

  it('a * a = 0 modulo n, if a = (0, 1)', () => {
    expect(a.sub(one).mul(a.sub(one))).to.be.u256.eq(zero);
  });

  it('a * a = a * 2 - 1 modulo n, if a = (1, 1)', () => {
    expect(a.mul(a)).to.be.u256.eq(a.mul(two).sub(one));
  });

  it('should test mutation', () => {
    expect(a.mul(two, true)).to.be.u256.eq(pair(2, 2));
    expect(a.mul(two, true)).to.be.u256.eq(pair(4, 4));
    expect(a.mul(two, true)).to.be.u256.eq(pair(8, 8));
  });
});

describe('Pow', () => {
  it('x ** 0 = 1', () => {
    expect(new UInt256(10).pow(0)).to.be.u256.eq(1);
    expect(new UInt256(10).pow(1)).to.be.u256.eq(10 ** 1);
    expect(new UInt256(10).pow(2)).to.be.u256.eq(10 ** 2);
    expect(new UInt256(10).pow(3)).to.be.u256.eq(10 ** 3);
  });
});

describe('Division | Modulo ', () => {
  const zero = new UInt256(0);
  const one = new UInt256(1);
  const two = new UInt256(2);
  const three = new UInt256(3);
  const a = pair(1, 1);
  const b = pair(3, 2);

  it('a / 2 = a >> 2 and mod = 1', () => {
    expect(a.div(two)).to.be.u256.eq(a.shr(1));
    expect(a.mod(two)).to.be.u256.eq(one);
    const res = a.divmod(two);
    expect(res[0]).to.be.u256.eq(a.shr(1));
    expect(res[1]).to.be.u256.eq(one);
  });

  it('a / b = 0 and mod = 0', () => {
    expect(a.div(b)).to.be.u256.eq(zero);
    expect(a.mod(b)).to.be.u256.eq(a);
    const res = a.divmod(b);
    expect(res[0]).to.be.u256.eq(zero);
    expect(res[1]).to.be.u256.eq(a);
  });

  it('b / a = 2 and mod = 1', () => {
    expect(b.div(a)).to.be.u256.eq(two);
    expect(b.mod(a)).to.be.u256.eq(one);
    const res = b.divmod(a);
    expect(res[0]).to.be.u256.eq(two);
    expect(res[1]).to.be.u256.eq(one);
  });

  it('should test DBZ', () => {
    expect(() => a.div(zero)).to.throw(TypeError, 'DBZ');
    expect(() => a.mod(zero)).to.throw(TypeError, 'DBZ');
    expect(() => a.divmod(zero)).to.throw(TypeError, 'DBZ');
  });

  it('should test identity', () => {
    expect(a.div(one)).to.be.u256.eq(a);
    expect(a.mod(one)).to.be.u256.eq(zero);
    const res = a.divmod(one);
    expect(res[0]).to.be.u256.eq(a);
    expect(res[1]).to.be.u256.eq(zero);
  });

  it('should test mutation', () => {
    let i = 3;
    // tslint:disable-next-line
    while (a.gt(zero) && i--) {
      const copy = new UInt256(a);
      const exp = a.shr(1);
      expect(a.div(two, true)).to.be.u256.eq(exp);
      if (copy.gt(three)) {
        a.add(one, true);
      }
      expect(copy.mod(two, true)).to.be.u256.eq(one);
      expect(copy).to.be.u256.eq(one);
    }
  });
});

describe('Negation', () => {
  const a = pair(1, 1);
  const b = new UInt256(0).not();

  it('a xor b = not a', () => {
    expect(a.not()).to.be.u256.eq(a.xor(b));
  });

  it('should test mutation', () => {
    const copy = a.not();
    copy.not(true);
    expect(copy).to.be.u256.eq(a);
  });
});

describe('Left Shift', () => {
  const a = pair(1, 1);
  const two = new UInt256(2);

  it('2 shl 2 = 8', () => {
    expect(two.shl(two.valueOf())).to.be.u256.eq(8);
    expect(two.shl(two.valueOf()).shr(2)).to.be.u256.eq(2);
  });

  it('a shl 2 = a * 4', () => {
    expect(a.shl(2)).to.be.u256.eq(a.mul(two).mul(two));
  });

  it('should test mutation', () => {
    const copy = a.copy();
    copy.shl(2, true);
    expect(copy.shr(2)).to.be.u256.eq(a);
  });
});

describe('Right Shift', () => {
  const a = pair(1, 1);
  const two = new UInt256(2);

  it('a >> 2 = a / 4', () => {
    expect(a.shr(2)).to.be.u256.eq(a.div(two).div(two));
  });

  it('should test mutation', () => {
    const copy = a.shl(2);
    copy.shr(2, true);
    expect(copy).to.be.u256.eq(a);
  });
});

describe('And', () => {
  const a = pair(1, 1);
  const b = pair(0, 1);

  it('a and b = b', () => {
    expect(a.and(b)).to.be.u256.eq(b);
  });

  it('b and a = b', () => {
    expect(b.and(a)).to.be.u256.eq(b);
  });

  it('should test mutation', () => {
    a.and(b, true);
    expect(a).to.be.u256.eq(b);
  });
});

describe('AndNot', () => {
  const a = pair(1, 1);
  const b = pair(0, 1);

  it('a and not b = 1', () => {
    expect(a.andNot(b)).to.be.u256.eq(1);
  });

  it('b and not a = 0', () => {
    expect(b.andNot(a)).to.be.u256.eq(0);
  });

  it('should test mutation', () => {
    a.andNot(b, true);
    expect(a).to.be.u256.eq(1);
  });
});

describe('Or', () => {
  const a = pair(1, 1);
  const b = pair(0, 1);

  it('a or b = a', () => {
    expect(a.or(b)).to.be.u256.eq(a);
  });

  it('b or a = a', () => {
    expect(b.or(a)).to.be.u256.eq(a);
  });

  it('should test mutation', () => {
    b.or(a, true);
    expect(a).to.be.u256.eq(b);
  });
});

describe('Xor', () => {
  const a = pair(1, 1);
  const b = pair(0, 1);
  const c = new UInt256(1);

  it('a xor b = c', () => {
    expect(a.xor(b)).to.be.u256.eq(c);
  });

  it('b xor a = c', () => {
    expect(b.xor(a)).to.be.u256.eq(c);
  });

  it('should test mutation', () => {
    b.xor(a, true);
    expect(b).to.be.u256.eq(c);
  });
});

describe(' = ', () => {
  const max = new UInt256(0).not();
  const min = pair(0, 1);
  const mid = pair(1, 1);

  it('min = min', () => {
    expect(min.eq(min)).eq(true);
    expect(min.lte(min)).eq(true);
    expect(min.gte(min)).eq(true);

    expect(min.neq(min)).eq(false);
    expect(min.lt(min)).eq(false);
    expect(min.gt(min)).eq(false);
  });

  it('max = max', () => {
    expect(max.eq(max)).eq(true);
    expect(max.lte(max)).eq(true);
    expect(max.gte(max)).eq(true);

    expect(max.neq(max)).eq(false);
    expect(max.lt(max)).eq(false);
    expect(max.lt(max)).eq(false);
  });

  it('mid = mid', () => {
    expect(mid.eq(mid)).eq(true);
    expect(mid.lte(mid)).eq(true);
    expect(mid.gte(mid)).eq(true);

    expect(mid.neq(mid)).eq(false);
    expect(mid.lt(mid)).eq(false);
    expect(mid.gt(mid)).eq(false);
  });
});

describe(' != ', () => {
  const max = new UInt256(0).not();
  const min = pair(0, 1);
  const mid = pair(1, 1);

  it('min != max', () => {
    expect(min.neq(max)).eq(true);
  });

  it('mid != max', () => {
    expect(mid.neq(max)).eq(true);
  });

  it('max != min', () => {
    expect(max.neq(min)).eq(true);
  });
});

describe(' < ', () => {
  const max = new UInt256(0).not();
  const min = pair(0, 1);
  const mid = pair(1, 1);

  it('min < mid', () => {
    expect(min.neq(mid)).eq(true);
    expect(min.lt(mid)).eq(true);
    expect(min.lte(mid)).eq(true);

    expect(min.eq(mid)).eq(false);
    expect(min.gt(mid)).eq(false);
    expect(min.gte(mid)).eq(false);
  });

  it('mid < max', () => {
    expect(mid.neq(max)).eq(true);
    expect(mid.lt(max)).eq(true);
    expect(mid.lte(max)).eq(true);

    expect(mid.eq(max)).eq(false);
    expect(mid.gt(max)).eq(false);
    expect(mid.gte(max)).eq(false);
  });

  it('min < max', () => {
    expect(min.neq(max)).eq(true);
    expect(min.lt(max)).eq(true);
    expect(min.lte(max)).eq(true);

    expect(min.eq(max)).eq(false);
    expect(min.gt(max)).eq(false);
    expect(min.gte(max)).eq(false);
  });
});

describe(' > ', () => {
  const max = new UInt256(0).not();
  const min = pair(0, 1);
  const mid = pair(1, 1);

  it('max > mid', () => {
    expect(max.neq(mid)).eq(true);
    expect(max.gt(mid)).eq(true);
    expect(max.gte(mid)).eq(true);

    expect(max.eq(mid)).eq(false);
    expect(max.lt(mid)).eq(false);
    expect(max.lte(mid)).eq(false);
  });

  it('mid > min', () => {
    expect(mid.neq(min)).eq(true);
    expect(mid.gt(min)).eq(true);
    expect(mid.gte(min)).eq(true);

    expect(mid.eq(min)).eq(false);
    expect(mid.lt(min)).eq(false);
    expect(mid.lte(min)).eq(false);
  });

  it('max > min', () => {
    expect(max.neq(min)).eq(true);
    expect(max.gt(min)).eq(true);
    expect(max.gte(min)).eq(true);

    expect(max.eq(min)).eq(false);
    expect(max.lt(min)).eq(false);
    expect(max.lte(min)).eq(false);
  });
});

describe('toJSON()', () => {
  it('should test max value', () => {
    const max = new UInt256(0).not();
    expect(JSON.stringify(max)).to.eq(`"${String(new UInt256(max))}"`);
  });
});

describe('toString()', () => {
  it('should test max value', () => {
    const max = new UInt256(0).not();
    expect(
      Array.prototype.slice
        .call(max.toString(16))
        .filter((e: string) => e !== 'f').length
    ).to.eq(0);
  });

  it('should test max javascript integer', () => {
    const max = new UInt256(9007199254740991);
    expect(String(max)).to.eq('9007199254740991');
  });
});

describe('valueOf()', () => {
  it('should test max javascript integer', () => {
    const max = new UInt256(9007199254740991);
    const maxPlus2 = new UInt256(9007199254740993);
    expect(max).to.u256.eq(9007199254740991);
    expect(maxPlus2.valueOf()).to.eq(9007199254740992);
  });
});

describe('testBit()', () => {
  it('should test 1011010', () => {
    const numStr = '1011010';
    const num = new UInt256(numStr, 2);
    for (let i = 0; i < numStr.length; i += 1) {
      expect(num.testBit(numStr.length - i - 1)).to.eq(
        Boolean(Number(numStr.charAt(i)))
      );
    }
  });
});

describe('setBit()', () => {
  it('should test 1011010', () => {
    const numStr = '1011010';
    const num = new UInt256(numStr, 2);
    num
      .mutable()
      .setBit(0)
      .setBit(2)
      .setBit(5);
    expect(num).to.be.u256.eq(new UInt256('1111111', 2));
  });
});

describe('flipBit()', () => {
  it('should test 1011010', () => {
    const numStr = '1011010';
    const num = new UInt256(numStr, 2);
    num
      .mutable()
      .flipBit(0)
      .flipBit(1)
      .flipBit(2)
      .flipBit(5);
    expect(num).to.be.u256.eq(new UInt256('1111101', 2));
  });
});

describe('clearBit()', () => {
  it('should test 1011010', () => {
    const numStr = '1011010';
    const num = new UInt256(numStr, 2);
    num
      .mutable()
      .clearBit(1)
      .clearBit(3)
      .clearBit(4)
      .clearBit(6);
    expect(num).to.be.u256.eq(0);
  });
});

describe('bitCount()', () => {
  it('should test 1011010', () => {
    const numStr = '1011010';
    const num = new UInt256(numStr, 2);
    const max = new UInt256(0).not();
    expect(num.bitCount()).to.be.eq(4);
    expect(max.bitCount()).to.be.eq(256);
  });
});

describe('negate()', () => {
  it('should test 1011010', () => {
    const numStr = '1011010';
    const num = new UInt256(numStr, 2);
    expect(num.negate().negate()).to.be.u256.eq(num);
    expect(num.add(num.negate())).to.be.u256.eq(0);
  });
});

describe('min()', () => {
  it('should test 1011010', () => {
    const numStr = '1011010';
    const num = new UInt256(numStr, 2);
    expect(num.min(0)).to.be.u256.eq(0);
    num.min(2, true);
    expect(num).to.be.u256.eq(2);
  });
});

describe('max()', () => {
  it('should test 1011010', () => {
    const numStr = '1011010';
    const num = new UInt256(numStr, 2);
    expect(num.max(0xffff)).to.be.u256.eq(0xffff);
    num.max(0xffff, true);
    expect(num).to.be.u256.eq(0xffff);
  });
});

describe('gcd()', () => {
  it('should 1 gcd 2 = 1', () => {
    expect(new UInt256(1).gcd(new UInt256(2))).to.be.u256.eq(1);
  });

  it('should 2 gcd 2 = 2', () => {
    expect(new UInt256(2).gcd(new UInt256(2))).to.be.u256.eq(2);
  });

  it('should prime gcd prime2 = 1', () => {
    expect(
      new UInt256(
        '0x2b3822a81114431f20a3a81ae29c373041edf1bc8616a1c8de3b01eb1a34b457d1d7'
      ).gcd(
        new UInt256(
          '0x3c13c1531c37039c16320f13b18f1bb10e2c416b781aa3d7206a916c2dc1f71a626a35c30f'
        )
      )
    ).to.be.u256.eq(1);
  });

  it('should prime gcd prime * prime2 = prime', () => {
    const prime = new UInt256('0x4931b31b023830d2f9');
    const prime2 = new UInt256('0x81d63713622fa141bf');
    expect(prime.gcd(prime.mul(prime2))).to.be.u256.eq(prime);
    expect(prime).to.be.u256.eq(new UInt256('0x4931b31b023830d2f9'));
    expect(prime2).to.be.u256.eq(new UInt256('0x81d63713622fa141bf'));
  });

  it('should prime * prime2 gcd prime * prime3 = prime', () => {
    const prime = new UInt256('0x4931b31b023830d2f9');
    const prime2 = new UInt256('0x81d63713622fa141bf');
    const prime3 = new UInt256('0xe3afe07cba21212f');
    expect(prime.mul(prime2).gcd(prime.mul(prime3))).to.be.u256.eq(prime);
    expect(prime).to.be.u256.eq(new UInt256('0x4931b31b023830d2f9'));
    expect(prime2).to.be.u256.eq(new UInt256('0x81d63713622fa141bf'));
    expect(prime3).to.be.u256.eq(new UInt256('0xe3afe07cba21212f'));
  });

  it('should prime gcd 0 should throw', () => {
    const prime = new UInt256('0x4931b31b023830d2f9');
    const zero = new UInt256(0);
    expect(() => prime.gcd(zero)).to.throw(TypeError, 'DBZ');
  });

  it('should 0 gcd prime should throw', () => {
    const prime = new UInt256('0x4931b31b023830d2f9');
    const zero = new UInt256(0);
    expect(() => prime.gcd(zero)).to.throw(TypeError, 'DBZ');
  });

  it('should test mutation', () => {
    const num = new UInt256(4);
    const num2 = new UInt256(6);
    expect(num.gcd(num2, true)).to.be.u256.eq(2);
    expect(num).to.be.u256.eq(2);
    expect(num2).to.be.u256.eq(6);
  });
});
