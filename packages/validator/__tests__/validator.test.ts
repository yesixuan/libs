import { createValidator } from '../src';

describe('校验器测试', () => {
  // 待校验数据
  // const formData = {
  //   name: 'lisa',
  //   age: '12'
  // }
  const ruleConfig = {
    notRequired: [
      { validator: 'min:2 max:6', msg: '长度在 2 ~ 6 之间' }
    ],
    name: [
      {
        validator: 'required',
        msg: '必填'
      },
      {
        validator: 'min:2 max:6',
        msg: '长度在 2 ~ 6 之间'
      }
    ],
    age: [
      {
        validator: 'required',
        msg: '必填'
      },
      {
        validator: (val: string) => +val >= 20,
        msg: '数字必须大于 20'
      }
    ]
  }
  const { verifySingle, verify, verifyAll } = createValidator(ruleConfig)
  it('verifySingle', () => {
    // 没有必填的情况下，如果值为 null undefined 空字符，则不用校验其他规则，直接开绿灯 
    expect(verifySingle('notRequired', '').valid).toEqual(true)
    // 测试 必填项
    expect(verifySingle('name', '').msg).toEqual('必填')
    // 测试长度规则
    expect(verifySingle('name', 'a').msg).toEqual('长度在 2 ~ 6 之间')
    // 测试所有规则通过
    expect(verifySingle('name', 'aaa').valid).toEqual(true)
    // 测试自定义函数
    expect(verifySingle('age', '19').msg).toEqual('数字必须大于 20')
  })

  it('verify', () => {
    // target 有字段缺失
    expect(verify({
      name: 'lasa'
    }).name).toEqual('age')
    // 多个字段有问题，遇到错误提前返回
    expect(verify({
      name: 'a',
      age: ''
    }).name).toEqual('name')
    // order
    expect(verify({
      name: 'a',
      age: ''
    }, ['age', 'name']).name).toEqual('age')
    // 通过 order 选择一部分来校验
    expect(verify({
      name: 'a',
      age: '28'
    }, ['age']).valid).toEqual(true)
  })

  it('verifyAll', () => {
    const res = verifyAll({
      name: 'a',
      age: ''
    })
    expect(res.name.msg).toEqual('长度在 2 ~ 6 之间')
    expect(res.age.msg).toEqual('必填')
  })
})
