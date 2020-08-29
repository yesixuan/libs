import { createValidatorFn } from '../src/utils';

describe('测试工具函数', () => {
  it('根据 key 获取校验函数', () => {
    expect(createValidatorFn('mobile', {
      mobile: val => /^1\d{10}$/.test(val)
    })('183')).toEqual(false)
  })
})


