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
8. 支持动态校验

## 安装

```bash
npm i @ignorance/validator
```

## 基础用法

```js
import { createValidator } from '@ignorance/validator'

const ruleConfig = {
  name: [
    {
      validator: 'required',
      msg: '必填',
    },
    {
      validator: 'min:2 max:6',
      msg: '长度在 2 ~ 6 之间',
    },
  ],
}

const { verify } = createValidator(ruleConfig)

verify({ name: 'lasa' })
// output { name: 'name', valid: false, msg: '长度在 2 ~ 6 之间' }
```

## API

### 单个字段的同步(verifySingle)

```js
const ruleConfig = {
  name: [
    {
      validator: 'required',
      msg: '必填',
    },
    {
      validator: 'min:2 max:6',
      msg: '长度在 2 ~ 6 之间',
    },
  ],
}

const { verifySingle, verifySingleAsync } = createValidator(ruleConfig)

verifySingle('hehe', 'min:2 max:6')
// output { valid: false, msg: '长度在 2 ~ 6 之间' }
```

### 单个字段异步校验(verifySingleAsync)

```js
const ruleConfig = {
  name: [
    {
      validator: (val) => Promise.resolve(false), // 异步校验函数
      msg: '异步校验不通过',
    },
  ],
}

const { verifySingleAsync } = createValidator(ruleConfig)

;async () => {
  const res = await verifySingleAsync('name', '')
  // output { valid: false, msg: '异步校验不通过' }
}
```

### 校验多个字段，遇到第一个错误提前退出(verify)

`name` 与 `addr` 两个字段都不符合规则，但是当它校验到第一个错误时就会跳出，不再继续校验 `addr` 字段。

```js
const ruleConfig = {
  name: [
    { validator: 'required', msg: '必填' },
    {
      validator: (val) => val.length >= 2 && val.length <= 6,
      msg: '长度在 2 ~ 6 之间',
    },
  ],
  addr: [{ validator: 'required', msg: '必填' }],
}

const { verify } = createValidator(ruleConfig)

verify({
  name: 'v',
  addr: '',
})
// output { name: 'name', valid: false, msg: '长度在 2 ~ 6 之间' }
```

### 异步校验多个字段，遇到第一个错误提前退出(verifyAsync)

用法与 `verify` 类似，同时支持同步与异步校验规则，返回结果通过 `Promise` 包装。

### 校验所有字段，返回所有结果(verifyAll)

用法与 `verify` 一致，区别在于 `verifyAll` 会返回所有校验结果。

```js
verify({
  name: 'v',
  addr: '',
})
/*
{
  name: { name: 'name', valid: false, msg: '长度在 2 ~ 6 之间' },
  addr: { name: 'addr', valid: false, msg: '必填' }
}
*/
```

### 异步校验所有字段，返回所有结果(verifyAllAsync)

用法与 `verifyAll` 类似，同时支持同步与异步校验规则，返回结果通过 `Promise` 包装。

## 动态校验

`verify` 支持传入第二个参数，表示指定需要校验的字段。

```js
verify(
  {
    name: 'v',
    addr: '',
  },
  ['addr']
)
// { name: 'addr', valid: false, msg: '必填' }
```

## 扩展规则

### 扩展正则规则

```js
import { extendRegexpRule } from '@ignorance/validator'

extendRegexpRule({
  ownReg: /[0-9a-z]/,
})

// 扩展规则之后，在定义规则配置的时候，可以用这种写法
const ruleConfig = {
  name: [{ validator: 'ownReg', msg: '自己扩展的正则校验规则' }],
}
```

### 扩展自定义规则

```js
import { extendRegexpRule } from '@ignorance/validator'
extendValidator({
  ownRule: (val) => val > 999,
})
// 扩展规则之后，在定义规则配置的时候，可以用这种写法
const ruleConfig = {
  name: [{ validator: 'ownRule', msg: '自己扩展的校验规则' }],
}
```
