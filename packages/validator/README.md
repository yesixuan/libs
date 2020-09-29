# @ignorange/validator

一个 js 通用校验库

## 特色

1. 支持校验单个字段  
2. 支持校验多个字段（遇到第一个错误提前退出）
3. 支持校验多个字段（坚持校验完所有字段，输出汇总的校验信息）
4. 以上三种校验方式都有对应的异步校验方式（异步校验有两种判定校验不通过的方式：一种是 `reject`，一种是 `resolve(false)`）
5. 支持异步和同步两种方式混合校验
6. 支持扩展校验正则规则
7. 支持扩展自定义校验方法

## 基础用法

```js
import { createValidator } from '@ignorange/validator'

const ruleConfig = {
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
}

const { verify } = createValidator(ruleConfig)

verify({ name: 'lasa' })
// output { name: 'name', valid: false, msg: '长度在 2 ~ 6 之间' }
```

## 单个字段的同步与异步校验

```js
const ruleConfig = {
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
}

const { verifySingle, verifySingleAsync } = createValidator(ruleConfig)

verifySingle('hehe', 'min:2 max:6')
// output { valid: false, msg: '长度在 2 ~ 6 之间' }
```