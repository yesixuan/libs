import { getDefaultRules } from '../rule'
import { getHandledRuleConfig, handleRequired, checkRules } from '../utils'

const defaultRules = getDefaultRules()

export type ValidatorFn  = (v: string) => boolean | Promise<boolean>

interface Target {
  [k: string]: Object
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

interface AllRes {
  [k: string]: Res
}

type VerifySingle = (key: string, val: string) => Res
type VerifySingleAsync = (key: string, val: string) => Promise<Res>
type Verify = (target: Target, order?: string[]) => Res
type VerifyAsync = (target: Target, order?: string[]) => Promise<Res>
type VerifyAll = (target: Target) => { [k: string]: Res }
type VerifyAllAsync = (target: Target) => Promise<{ [k: string]: Res }>

interface Validator {
  verifySingle: VerifySingle
  verify: Verify
  verifyAll: VerifyAll
  verifySingleAsync: VerifySingleAsync
  verifyAsync: VerifyAsync
  verifyAllAsync: VerifyAllAsync
}

/**
 * @public
 */
export function createValidator(ruleConfig: RuleConfig) : Validator {
  // 统一处理成函数的配置
  const config: PureRuleConfig = getHandledRuleConfig(ruleConfig, defaultRules)

  const verifySingle = (key: string, val: any) :Res => {
    if (handleRequired(val, ruleConfig[key])) { // 值为空，校验又没有必填字段
      return {
        name: key,
        valid: true
      }
    }
    return checkRules(key, val, config)
  }

  const verifySingleAsync = async (key: string, val: any): Promise<Res> => {
    let res = {
      name: key,
      valid: true
    }
    if (handleRequired(val, ruleConfig[key])) { // 值为空，校验又没有必填字段
      return res
    }
    const resList = await Promise.all(config[key].map(
      ({ validator, msg }) => 
        Promise.resolve(validator(val))
          .then(valid => ({ valid, msg: valid ? '' : msg, name: key }))
          .catch(_ => ({ valid: false, msg, name: key })
        )
      )
    )
    for (let i = 0; i < resList.length; i++) {
      if (!resList[i].valid) {
        return resList[i]
      }
    }
    return res
  }

  const verify = (target: Target, order: string[] = []): Res => {
    if (!order.length) {
      order = Object.keys(ruleConfig)
    }
    for (let i = 0; i < order.length; i++) {
      const key = order[i]
      // if (!target[key]) continue
      const res = verifySingle(key, target[key])
      if (!res.valid) return res
    }
    return {
      name: '',
      valid: true,
      msg: ''
    }
  }

  const verifyAsync = async(target: Target, order: string[] = []): Promise<Res> => {
    if (!order.length) {
      order = Object.keys(ruleConfig)
    }
    for (let i = 0; i < order.length; i++) {
      const key = order[i]
      const res = await verifySingleAsync(key, target[key])
      if (!res.valid) return res
    }
    return {
      name: '',
      valid: true,
      msg: ''
    }
  }

  const verifyAll = (target: Target, order: string[] = []): AllRes => {
    const res = Object.create(null)
    if (!order.length) {
      order = Object.keys(ruleConfig)
    }
    for (let i = 0; i < order.length; i++) {
      const key = order[i]
      res[key] = verifySingle(key, target[key])
    }
    return res
  }

  const verifyAllAsync = async(target: Target, order: string[] = []): Promise<AllRes> => {
    const res = Object.create(null)
    if (!order.length) {
      order = Object.keys(ruleConfig)
    }
    for (let i = 0; i < order.length; i++) {
      const key = order[i]
      res[key] = await verifySingleAsync(key, target[key])
    }
    return res
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
    verifyAllAsync
  }
}