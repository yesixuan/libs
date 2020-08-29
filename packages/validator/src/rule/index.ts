const regexpMap: RegexpMap = {
  mobile: /^1\d{10}$/, // 手机校验
  url: /^((https|http|ftp|rtsp|mms)?:\/\/)[^\s]+/, // 网址校验
  identificationCard: /^\d{13,17}[0-9xX]$/, // 身份证号码格式校验
  tel: /(^(\d{3,4}-)?\d{7,8})$|(^1\d{10}$)/ // 校验电话号码
}

interface RegexpMap {
  [k: string]: RegExp
}

export interface RuleMap {
  [k: string]: (v: string) => boolean
}

let ruleMap: RuleMap = Object.create(null)

/**
 * 将正则转换成校验函数
 * @public
 */
export function extendRegexpRule(regexpMap: RegexpMap): RuleMap {
  Object.keys(regexpMap)
    .reduce((res, currentValue) => {
      res[currentValue] = (val: string) => regexpMap[currentValue].test(val + '')
      return res
    }, ruleMap)
  return ruleMap
}

extendRegexpRule(regexpMap)

/**
 * 允许用户传入校验方法来扩展
 * @public
 */
export function extendValidator(validatorMap: RuleMap): RuleMap {
  ruleMap = { ...ruleMap, ...validatorMap }
  return ruleMap
}

export const getDefaultRules = () => ruleMap