const { constants } = require('fs')
const { access } = require('fs/promises')
const rootPath = process.cwd()

let config
let zhLangObj

// 首先判断配置文件是否存在，并且合法
async function hasConfig() {
  if (config) return
  try {
    const configPath = path.resolve(rootPath, './i18n.config.js')
	  config = require(configPath)
  } catch(err) {
    // console.error('配置文件解析错误，请检查项目根目录的 i18n.config.js 文件')
    throw new Error('配置文件解析错误，请检查项目根目录的 i18n.config.js 文件')
  }
}

// 判断中文语言包是否存在
async function hasZh() {
  await hasConfig()
  if (!config) return
  if (!config.zhLangPath) {
    throw new Error('请检查 i18n.config.js 配置中是否有 zhLangPath 选项。如果没有，请提供该选项指向中文语言包')
  }
  return access(path.resolve(rootPath, config.zhLangPath), constants.F_OK)
    .then(() => {
      zhLangObj = require(path.resolve(rootPath, config.zhLangPath))
    })
    .catch(err => {
      throw new Error('请检查 i18n.config.js 配置中的 zhLangPath 是否指向正确的中文语言包路径')
    })
}

module.exports = {
  hasConfig, hasZh
}