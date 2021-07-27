const fs = require('fs')
const { writeFile } = require('fs/promises')
const path = require('path')
const xlsx = require('node-xlsx')
const { generate } = require('shortid')
// const lang = require('../src/lang/zh')

const noop = (v, _pathName) => v
const rootPath = process.cwd()
// 中文语言包的配置对象
let zhLangObj = {}
let excelPath = ''
let langPathes = []
let key2value
let value2key

let config

// 插件初始化
function init() {
	// 读取配置文件
	const configPath = path.resolve(rootPath, './i18n.config.js')
	config = require(configPath)
	// 中文语言包配置对象（生成语言包的时候，这行不执行）
  fs.exists(path.resolve(rootPath, config.zhLangPath), exists => {
    if (exists) {
      zhLangObj = require(path.resolve(rootPath, config.zhLangPath))
    }
  })
	// excel 路径
	excelPath = path.resolve(rootPath, config.excelPathes)
	// 所有语言包对应的路径
	langPathes = config.langPathes.map(_path => path.resolve(rootPath, _path))
}
init()

// 获取语言包中 键、值 项目映射关系
function extractLang(obj, path = '', value2key = new Map(), key2value = new Map()) {
  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'object') {
      extractLang(value, path === '' ? key : `${path}.${key}`, value2key, key2value)
      return
    }
    if (value2key.has(value)) return
    value2key.set(value, path === '' ? key : `${path}.${key}`)
    key2value.set(path === '' ? key : `${path}.${key}`, value)
  })
  return { key2value, value2key }
}

// 由多个语言包生成一个 Excel

// const {
//   key2value, value2key
// } = extractLang(lang)
// console.log('key2value', key2value)

// 遍历文件夹的所有文件，将内容交给回调函数来处理
function mapDir(dir = rootPath, callback = noop, finish = noop) {
  init()
  const files = fs.readdirSync(dir)
  files.forEach((filename) => {
    // 排除相关目录
    let pathname = path.resolve(dir, filename)
    if (/(node_modules\/*|\.git\/*)/.test(pathname)) return
    const stats = fs.statSync(pathname)
    
    if (stats.isDirectory()) {
      mapDir(pathname, callback, finish)
    } else if (stats.isFile()) {
      // 排除不匹配的文件后缀
      if (!/\.(vue|js)$/.test(filename)) return
      
      const data = fs.readFileSync(pathname)
      callback && callback(data.toString(), pathname)
    }
  })
}

// 将原项目中的 abc.def 还原成 中文
function toZH(match, $2) {
	if (!key2value) {
    try {
      zhLangObj = require(path.resolve(rootPath, config.zhLangPath))
    } catch(err) {
      console.error('请提供正确的中文语言包路径', err)
    }
		const map = extractLang(zhLangObj)
		value2key = map.value2key
		key2value = map.key2value
	}
  if (key2value.has($2)) {
    return match.replace($2, key2value.get($2))
  }
  return match
}

// mapDir(
//   path.resolve(__dirname, '../src'),
//   (content , pathname) => {
//     let _content = content.replace(/\$t\((['|"])(.*?)\1\)/g, (match, _$1, $2) => {
//       // 处理字符串
//       return toZH(match, $2)
//     })
//     // _content = content.replace(/\$t\(\\(['|"])([\u4e00-\u9fa5].*?)\\\1\)/g, (match, $1, $2) => {
//     //   // 处理字符串
//     //   return toZH(match, $2)
//     // })
//     fs.writeFileSync(pathname, _content)
//   }
// )

// 将项目中的 中文 转换成 key 的方式
function handleMatch(match, $2) {
  try {
    zhLangObj = require(path.resolve(rootPath, config.zhLangPath))
  } catch(err) {
    console.error('请提供正确的中文语言包路径', err)
  }
	if (!value2key) {
		const map = extractLang(zhLangObj)
		value2key = map.value2key
		key2value = map.key2value
	}
  if (value2key.has($2)) {
    return match.replace($2, value2key.get($2))
  }
  return match
}

// webpack 插件，将项目中的 $t 转化为对应的 key
class Replace$t {
  options
  constructor(options) {
    try {
      zhLangObj = require(path.resolve(rootPath, config.zhLangPath))
    } catch(err) {
      console.error('请提供正确的中文语言包路径', err)
    }
    if (!value2key) {
      const map = extractLang(zhLangObj)
      value2key = map.value2key
      key2value = map.key2value
    }
    this.options = options
  }
  apply(compiler) {
    compiler.hooks.emit.tap('Replace$t', (compilation) => {
      // 遍历构建产物，.assets中包含构建产物的文件名
      Object.keys(compilation.assets).forEach((item) => {
        // .source()是获取构建产物的文本
        let content = compilation.assets[item].source()
        if (typeof content !== 'string') return
        content = content.replace(/\$t\((['|"])([\u4e00-\u9fa5].*?)\1\)/g, (match, _$1, $2) => {
          // 处理字符串
          return handleMatch(match, $2)
        })
        content = content.replace(/\$t\(\\(['|"])([\u4e00-\u9fa5].*?)\\\1\)/g, (match, _$1, $2) => {
          // 处理字符串
          return handleMatch(match, $2)
        })
        // 更新构建产物对象
        compilation.assets[item] = {
          source: () => content,
          size: () => content.length,
        }
      })
    })
  }
}
 
// 解析得到文档中的所有 sheet
// const sheets = xlsx.parse(path.resolve(__dirname, 'lang.xlsx'))

// 往 excel 里面追加中文
function appendExcel(words) {
  // const sheets = xlsx.parse(path.resolve(__dirname, 'lang.xlsx'))
  // sheets[0].data.push(
  //   ...words.map(word => [word])
  // )
  const buffer = xlsx.build([{ name: 'vic', data: words }])
  fs.writeFileSync(excelPath, buffer)
}

// 根据语言包生成 exel
function genExcel(pathes = langPathes) {
  const key2values = pathes.map(p => {
    const pathName = path.resolve(__dirname, p)
    // fs.readdirSync(pathName).toString()
    const data = require(pathName)
    return extractLang(data).key2value
  })
  const data = []
  for (let [k] of key2values[0]) {
    const _item = []
    key2values.forEach(item => {
      _item.push(item.get(k))
    })
    data.push(_item)
  }
  return data
}

// appendExcel(
//   genExcel(['./lang/en.js', './lang/zh.js'])
// )

// appendExcel([
//   ['呵呵', '哈哈'],
//   ['嘻嘻', '呼呼']
// ])

// 获取 excel 里面已经翻译好的字段
function getTransformedWords() {
  const rootPath = process.cwd()
  const configPath = path.resolve(rootPath, './i18n.config.js')
  const config = require(configPath)
  const langPathes = config.langPathes.map(_path => path.resolve(rootPath, _path))
  const excelPath = path.resolve(rootPath, config.excelPathes)
  const sheets = xlsx.parse(excelPath)
  // const words = new Set()
  // 遍历
  sheets.forEach((sheet, index) => {
    if (index > 0) return
    const objs = sheet.data.reduce((prev, curr) => {
      const key = generate()
      curr.forEach((val, i) => {
        prev[i][key] = val
      })
      return prev
    }, Array(sheet.data[0].length).fill(null).map(_ => ({})))
    // const fileNames = [...sheet.data[0]]
    // 读取每行内容
    // sheet.data.forEach(row => {
    //   if (row.length) {
    //     console.log('row', row)
    //   }
    // })
    // 删掉原来的语言包
    // langPathes.forEach(langPath => fs.unlinkSync(langPath))
    objs.forEach(async (obj, i) => {
      // fs.writeFile(langPathes[i], JSON.stringify(obj, null, '\t'), err => {
      //   err && console.log('写入语言文件出错', err)
      // })
      console.log('heheheh', typeof obj, JSON.stringify(obj, null, '\t'), langPathes[i], sheets)
      await writeFile(langPathes[i], JSON.stringify(obj, null, '\t'))
        .then(msg => console.log('写入成功', msg))
        .catch(err => {
          console.error('写入失败', err)
        })
    })
    
  })
  // return words
}
// getTransformedWords()

// 获取源码中所有的 $t('') 包含的字段（暂时无用）
function getInner$t(dir = './') {
  const words = new Set()
  mapDir(
    path.resolve(rootPath, dir),
    str => {
      const strs = str.match(/(?<=\$t\((['|"]))[\u4e00-\u9fa5].*(?=\1\))/g)
      strs.forEach(str => words.add(str))
    }
  )
  return words
}

// console.log(getInner$t('../project'))
/**
 * /(?<=\$t\((['|"]))[\u4e00-\u9fa5].*(?=\1\))/g
 * 这个正则得注释一下，不然后面自己都看不懂
 * (?<=\$t\((['|"])) ?<= 前瞻
 *   (['|"]) 第一个分组匹配
 * (?=\1\)) 后顾
 *   \1 匹配第一个分组
 */

module.exports = {
  init, extractLang, mapDir, toZH, handleMatch, Replace$t, appendExcel, genExcel, getTransformedWords, getInner$t
}

// console.log(getTransformedWords())