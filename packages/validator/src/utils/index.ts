import {
  ValidatorFn,
  RuleConfig,
  PureRuleConfig,
  Rule,
  Res,
  Target,
} from '../validator'
import { RuleMap } from '../rule'

export function createValidatorFn(
  validator: string | RegExp | ValidatorFn,
  defaultRules: RuleMap
): ValidatorFn {
  if (typeof validator === 'string') {
    if (defaultRules[validator]) {
      return defaultRules[validator]
    }
    if (validator === 'required') {
      return (val: any) => val != null && val !== ''
    }
    if (/^(m(ax|in):(\d+))(\sm(ax|in):(\d+)){0,1}$/.test(validator)) {
      return createLengthValidate(validator)
    }
    throw new Error(`您还未定义 ${validator} 这条规则`)
  }
  if (validator instanceof RegExp) {
    return (val: string) => {
      if (val == null) return false
      return val.search(validator) !== -1
    }
  }
  if (typeof validator === 'function') {
    return validator
  }
  throw new Error('validator 的值只能为函数或正则表达式')
}

function createLengthValidate(rule: string): ValidatorFn {
  const reg = /^(m(ax|in):(\d+))(\sm(ax|in):(\d+)){0,1}$/
  const [, , p2, p3, p4, p5, p6] = rule.match(reg) as string[]
  let min: string = '',
    max: string = ''
  p2 === 'in' ? (min = p3) : (max = p3)
  if (p4 && p2 !== p5) {
    p5 === 'ax' ? (max = p6) : (min = p6)
  }
  if (min && max && ~~min > ~~max) throw new Error('最小长度不能大于最大长度')
  return ({ length }: string = '') =>
    !((min && ~~min > length) || (max && ~~max < length))
}

// 将原始的配置转换成规整的校验（所有 validator 转为函数）
export function getHandledRuleConfig(
  ruleConfig: RuleConfig,
  defaultRules: RuleMap
): PureRuleConfig {
  return Object.entries(ruleConfig).reduce((prev: RuleConfig, [key, value]) => {
    prev[key] = value.map(({ validator, msg }) => ({
      validator: createValidatorFn(validator, defaultRules),
      msg,
    }))
    return prev
  }, {}) as PureRuleConfig
}

export function handleRequired(v = '', rules: Rule[]): boolean {
  // 如果没有必填，而值又为空，那就开绿灯
  return (
    (v === null || v === undefined || v === '') &&
    rules.every(({ validator }) => validator !== 'required')
  )
}

export function checkRules(
  key: string,
  val: string,
  ruleConfig: PureRuleConfig,
  target?: Target
): Res {
  const rules = ruleConfig[key] ?? []
  for (let i = 0; i < rules.length; i++) {
    const { validator, msg } = rules[i]
    if (!validator(val, target)) {
      return {
        name: key,
        valid: false,
        msg,
        dirty: true,
      }
    }
  }
  return {
    name: key,
    valid: true,
    msg: '',
    dirty: true,
  }
}

export const deepClone = (target) => {
  if (Object.prototype.toString.call(target) === '[object Object]') {
    return Object.entries(target).reduce((memo, [key, value]) => {
      memo[key] = deepClone(value)
      return memo
    }, Object.create(null))
  }
  if (Array.isArray(target)) return target.map(deepClone)
  return target
}
