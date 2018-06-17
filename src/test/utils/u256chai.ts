/* tslint:disable:no-any */

import { UInt256 } from 'src/UInt256';

export function u256chai(): any {
  return function(this: any, chai: any, utils: any): any {
    chai.Assertion.addProperty('u256', function(this: any): any {
      utils.flag(this, 'u256', true);
    });

    // tslint:disable-next-line
    const override: any = function(fn: any): any {
      // tslint:disable-next-line
      return function(sup: any): any {
        return function(this: any, value: any): any {
          if (utils.flag(this, 'u256')) {
            this.assert(
              this._obj instanceof UInt256,
              'expected #{act} to be the instance of #{exp}',
              'expected #{act} to not be the instance of #{exp}',
              'UInt256',
              typeof this._obj
            );
            fn.apply(this, [value, this._obj]);
          } else {
            sup.apply(this, arguments);
          }
        };
      };
    };

    const equals: any = override(function(
      this: any,
      expected: any,
      actual: any
    ): any {
      this.assert(
        actual.eq(expected),
        'expected #{act} to equal #{exp}',
        'expected #{act} to be different from #{exp}',
        expected,
        actual,
        false
      );
    });
    chai.Assertion.overwriteMethod('equal', equals);
    chai.Assertion.overwriteMethod('equals', equals);
    chai.Assertion.overwriteMethod('eq', equals);

    const greaterThan: any = override(function(
      this: any,
      expected: any,
      actual: any
    ): any {
      this.assert(
        actual.gt(expected),
        'expected #{act} to be greater than #{exp}',
        'expected #{act} to be less than or equal to #{exp}',
        expected,
        actual,
        false
      );
    });
    chai.Assertion.overwriteMethod('above', greaterThan);
    chai.Assertion.overwriteMethod('gt', greaterThan);
    chai.Assertion.overwriteMethod('greaterThan', greaterThan);

    const greaterThanOrEqualTo: any = override(function(
      this: any,
      expected: any,
      actual: any
    ): any {
      this.assert(
        actual.gte(expected),
        'expected #{act} to be greater than or equal to #{exp}',
        'expected #{act} to be less than #{exp}',
        expected,
        actual,
        false
      );
    });
    chai.Assertion.overwriteMethod('least', greaterThanOrEqualTo);
    chai.Assertion.overwriteMethod('gte', greaterThanOrEqualTo);

    const lessThan: any = override(function(
      this: any,
      expected: any,
      actual: any
    ): any {
      this.assert(
        actual.lt(expected),
        'expected #{act} to be less than #{exp}',
        'expected #{act} to be greater than or equal to #{exp}',
        expected,
        actual,
        false
      );
    });
    chai.Assertion.overwriteMethod('below', lessThan);
    chai.Assertion.overwriteMethod('lt', lessThan);
    chai.Assertion.overwriteMethod('lessThan', lessThan);

    const lessThanOrEqualTo: any = override(function(
      this: any,
      expected: any,
      actual: any
    ): any {
      this.assert(
        actual.lte(expected),
        'expected #{act} to be less than or equal to #{exp}',
        'expected #{act} to be greater than #{exp}',
        expected,
        actual,
        false
      );
    });
    chai.Assertion.overwriteMethod('most', lessThanOrEqualTo);
    chai.Assertion.overwriteMethod('lte', lessThanOrEqualTo);
  };
}
