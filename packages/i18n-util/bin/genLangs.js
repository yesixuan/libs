const { extractLang } = require('../src')
// const fs = require('fs')
const { writeFile } = require('fs/promises')
const path = require('path')
const xlsx = require('node-xlsx')
const { generate } = require('shortid')


getTransformedWords()


function getTransformedWords() {

  const rootPath = process.cwd()
  const configPath = path.resolve(rootPath, './i18n.config.js')
  const config = require(configPath)
  const langPathes = config.langPathes.map(_path => path.resolve(rootPath, _path))
  const excelPath = path.resolve(rootPath, config.excelPathes)
  const sheets = xlsx.parse(excelPath)
  let zhLangObj = {}
  try {
    zhLangObj = require(path.resolve(rootPath, config.zhLangPath))
  } catch (err) {
    console.error('找不到中文语言包', err)
  }
  const { value2key, key2value } = extractLang(zhLangObj)
  // const words = new Set()
  // 遍历
  sheets.forEach((sheet, index) => {
    if (index > 0) return
    const objs = sheet.data.reduce((prev, curr) => {
      let key = generate()
      while (key2value.has(key) || prev[key]) {
        key = generate()
      }
      curr.forEach((val, i) => {
        // 判断之前该字段是不是已经写入过
        if (value2key.has(val)) {
          prev[i][value2key.get(val)] = val
        } else {
          prev[i][key] = val
        }
      })
      return prev
    }, Array(sheet.data[0].length).fill(null).map(_ => ({})))
    objs.forEach(async (obj, i) => {
      await writeFile(langPathes[i], JSON.stringify(obj, null, '\t'))
        .then(msg => console.log('写入成功', msg))
        .catch(err => {
          console.error('写入失败', err)
        })
    })
    
  })
}