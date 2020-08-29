import { extendRegexpRule, extendValidator } from '../src';

describe('扩展规则', () => {
  const afterExtendReg = extendRegexpRule({
    testReg: /999/
  })
  it('works', () => {
    expect(afterExtendReg.testReg('998')).toEqual(false)
    expect(afterExtendReg.testReg('999293')).toEqual(true);
  })

  const afterExtendFn = extendValidator({
    testRn: v => !!v
  })
  it('works', () => {
    expect(afterExtendFn.testRn('')).toEqual(false)
    expect(afterExtendFn.testRn('vic')).toEqual(true);
  })
})
