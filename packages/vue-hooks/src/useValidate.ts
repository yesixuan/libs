import { createValidator, RuleConfig } from '@ignorance/validator'
import { reactive } from 'vue'

// 传入表单数据和表单配置
export const useValidator = (rules: RuleConfig, data: Record<string, any>) => {
  const {
    verify: originalVerify,
    verifySingle,
    verifyAll: originalVerifyAll,
    getResult,
    resetRes: originalResetRes,
    changeRule,
  } = createValidator(rules)
  const result = reactive(getResult())
  // 返回每一个字段的校验函数
  const validate = (key: string) => () => {
    verifySingle(key, data[key], data)
    // 添加变脏的属性
    Object.assign(result, getResult())
  }
  const verify = (order?: string[]) => {
    originalVerify(data, order)
    Object.assign(result, getResult())
  }
  const verifyAll = () => {
    originalVerifyAll(data)
    Object.assign(result, getResult())
  }
  const resetRes = (...args: any[]) => {
    // @ts-ignore
    originalResetRes(...args)
    Object.assign(result, getResult())
  }
  const changeRules = (newRules: RuleConfig) => {
    changeRule(newRules)
    const oldRes = getResult()
    new Set(Object.keys(newRules).concat(Object.keys(oldRes))).forEach(
      (key) => {
        debugger
        // 如果是脏的，那么重新校验
        if (oldRes[key].dirty) {
          verifySingle(key, data[key], data)
        }
        // 以前校验过的，现在校验规则被删除了，那么就把校验结果置为通过
        if (oldRes[key] && !newRules[key]) {
          resetRes(key)
        }
        if (!oldRes[key] && newRules[key]) {
          resetRes(key)
        }
        Object.assign(result, getResult())
      }
    )
  }

  return {
    result,
    validate,
    verify,
    verifyAll,
    resetRes,
    changeRules,
  }
}
