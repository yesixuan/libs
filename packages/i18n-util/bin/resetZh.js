const fs = require('fs')
const path = require('path')
const { init, mapDir, toZH, extractLang } = require('../src')

init()

const rootPath = process.cwd()
const configPath = path.resolve(rootPath, './i18n.config.js')
const config = require(configPath)
let zhLangObj = {}
try {
  zhLangObj = require(path.resolve(rootPath, config.zhLangPath))
} catch (err) {
  console.error('找不到中文语言包', err)
}
const { key2value } = extractLang(zhLangObj)

const zhStr = Array.from(key2value.keys())
const reg = new RegExp(`(${zhStr.join('|')})`, 'g')

mapDir(
  undefined,
  (content , pathname) => {
    let _content = content.replace(reg, (match) => {
      // 处理字符串
      return toZH(match)
    })
    fs.writeFileSync(pathname, _content)
  }
)