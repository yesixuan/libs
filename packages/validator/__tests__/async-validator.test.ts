import { createValidator } from '../src';

describe('异步校验器测试', () => {
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
        validator: (val: string): Promise<boolean> => new Promise((res) => setTimeout(() => res(+val >= 20))),
        msg: '数字必须大于 20 (by resolve(false))'
      },
      {
        validator: (val: string): Promise<boolean> => new Promise((_, rej) => setTimeout(() => rej(val))),
        msg: '怎么都不通过 (by reject)'
      },
    ]
  }
  const { verifySingleAsync, verifyAsync, verifyAllAsync } = createValidator(ruleConfig)
  it('verifySingleAsync', async() => {
    // 没有必填的情况下，如果值为 null undefined 空字符，则不用校验其他规则，直接开绿灯 
    let res = await verifySingleAsync('notRequired', '')
    expect(res.valid).toEqual(true)
    // 同步规则用异步校验器
    res = await verifySingleAsync('name', 'a')
    expect(res.msg).toEqual('长度在 2 ~ 6 之间')
    // 异步校验 （reject）
    res = await verifySingleAsync('age', '18')
    expect(res.msg).toEqual('数字必须大于 20 (by resolve(false))')
    // 异步校验 （结果为 false）
    res = await verifySingleAsync('age', '28')
    expect(res.msg).toEqual('怎么都不通过 (by reject)')
  })

  it('verifyAsync', async() => {
    let res = await verifyAsync({
      name: 'a',
      age: ''
    })
    expect(res.msg).toEqual('长度在 2 ~ 6 之间')
  })

  it('verifyAllAsync', async() => {
    let res = await verifyAllAsync({
      name: 'a',
      age: '13'
    })
    expect(res.name.msg).toEqual('长度在 2 ~ 6 之间')
    expect(res.age.msg).toEqual('数字必须大于 20 (by resolve(false))')
  })
})
