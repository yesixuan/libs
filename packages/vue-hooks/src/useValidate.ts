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
  } = createValidator(rules)
  const result = reactive(getResult())
  // 返回每一个字段的校验函数
  const validate = (key: string) => () => {
    verifySingle(key, data[key], data)
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

  return {
    result,
    validate,
    verify,
    verifyAll,
    resetRes,
  }
}
