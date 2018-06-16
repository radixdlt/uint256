declare namespace Chai {
  export interface IU256Comparsion {
    // tslint:disable-next-line
    eq(expected: any): boolean;
  }
  // tslint:disable-next-line
  export interface Assertion {
    u256: IU256Comparsion;
  }
}
