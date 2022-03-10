import { checkRules, getHandledRuleConfig, handleRequired } from '../utils'

import { getDefaultRules } from '../rule'

const defaultRules = getDefaultRules()

export type ValidatorFn = (
  v: string,
  target?: Target
) => boolean | Promise<boolean>

export interface Target {
  [k: string]: unknown
}

export interface Rule {
  validator: string | ValidatorFn | RegExp
  msg: string
}

interface PureRule {
  validator: ValidatorFn
  msg: string
}

export interface RuleConfig {
  [k: string]: Rule[]
}

export interface PureRuleConfig {
  [k: string]: PureRule[]
}

export interface Res {
  name: string // 字段名
  valid: boolean
  msg?: string
}

export interface AllRes {
  [k: string]: Res
}

type VerifySingle = (key: string, val: string, target?: Target) => Res
type VerifySingleAsync = (
  key: string,
  val: string,
  target?: Target
) => Promise<Res>
type Verify = (target: Target, order?: string[]) => Res
type VerifyAsync = (target: Target, order?: string[]) => Promise<Res>
type VerifyAll = (target: Target) => { [k: string]: Res }
type VerifyAllAsync = (target: Target) => Promise<{ [k: string]: Res }>

export interface Validator {
  verifySingle: VerifySingle
  verify: Verify
  verifyAll: VerifyAll
  verifySingleAsync: VerifySingleAsync
  verifyAsync: VerifyAsync
  verifyAllAsync: VerifyAllAsync
  resetRes: () => void
  changeRule: (rule: RuleConfig) => void
  getResult: () => AllRes
}

/**
 * @public
 */
export function createValidator(
  ruleConfig: RuleConfig,
  needRequired = false
): Validator {
  // 统一处理成函数的配置
  let config: PureRuleConfig = getHandledRuleConfig(ruleConfig, defaultRules)

  // 全局维护一份整体的校验结果
  let validRes: AllRes = Object.create(null)

  // 重置校验结果为通过
  const resetRes = (keys: string[] | string = Object.keys(ruleConfig)) => {
    if (typeof keys === 'string') keys = [keys]
    if (!Array.isArray(keys)) keys = Object.keys(ruleConfig)
    validRes = keys.reduce((prev, curr) => {
      prev[curr] = {
        name: curr,
        valid: true,
      }
      return prev
    }, getResult())
  }

  const getResult = () => ({ ...validRes })

  // todo 规则改变时（传入新规则） 1. config 重新生成；2. 校验结果修改
  const changeRule = (rule: RuleConfig) => {
    ruleConfig = rule
    config = getHandledRuleConfig(ruleConfig, defaultRules)
  }

  resetRes()

  const verifySingle = (key: string, val: any, target?: Target): Res => {
    const res = {
      name: key,
      valid: true,
    }
    if (needRequired && handleRequired(val, ruleConfig[key])) {
      // 值为空，校验又没有必填字段
      return (validRes[key] = res)
    }
    return (validRes[key] = checkRules(key, val, config, target))
  }

  const verifySingleAsync = async (
    key: string,
    val: any,
    target?: Target
  ): Promise<Res> => {
    const res = {
      name: key,
      valid: true,
    }
    if (needRequired && handleRequired(val, ruleConfig[key])) {
      // 值为空，校验又没有必填字段
      return (validRes[key] = res)
    }
    const resList = await Promise.all(
      config[key].map(({ validator, msg }) =>
        Promise.resolve(validator(val, target))
          .then((valid) => ({ valid, msg: valid ? '' : msg, name: key }))
          .catch((_) => ({ valid: false, msg, name: key }))
      )
    )
    for (let i = 0; i < resList.length; i++) {
      if (!resList[i].valid) {
        return (validRes[key] = resList[i])
      }
    }
    return (validRes[key] = res)
  }

  const verify = (
    target: Target,
    order: string[] = Object.keys(ruleConfig)
  ): Res => {
    // 校验结果置为通过
    resetRes()
    for (let i = 0; i < order.length; i++) {
      const key = order[i]
      const res = verifySingle(key, target[key])
      if (!res.valid) return (validRes[key] = res)
    }
    return {
      name: '',
      valid: true,
      msg: '',
    }
  }

  const verifyAsync = async (
    target: Target,
    order: string[] = Object.keys(ruleConfig)
  ): Promise<Res> => {
    // 校验结果置为通过
    resetRes()
    for (let i = 0; i < order.length; i++) {
      const key = order[i]
      const res = await verifySingleAsync(key, target[key])
      if (!res.valid) return (validRes[key] = res)
    }
    return {
      name: '',
      valid: true,
      msg: '',
    }
  }

  const verifyAll = (
    target: Target,
    order: string[] = Object.keys(ruleConfig)
  ): AllRes => {
    // 校验结果置为通过
    resetRes()
    const res = Object.create(null)
    for (let i = 0; i < order.length; i++) {
      const key = order[i]
      res[key] = verifySingle(key, target[key])
    }
    return (validRes = res)
  }

  const verifyAllAsync = async (
    target: Target,
    order: string[] = Object.keys(ruleConfig)
  ): Promise<AllRes> => {
    // 校验结果置为通过
    resetRes()
    const res = Object.create(null)
    for (let i = 0; i < order.length; i++) {
      const key = order[i]
      res[key] = await verifySingleAsync(key, target[key])
    }
    return (validRes = res)
  }

  return {
    // 校验单个
    verifySingle,
    // 整体校验，遇到第一个错误即返回
    verify,
    // 整体校验，得到所有的校验信息
    verifyAll,
    // 与上面一一对应，增加支持异步
    verifySingleAsync,
    verifyAsync,
    verifyAllAsync,
    resetRes,
    changeRule,
    getResult,
  }
}
