const fs = require('fs')
const { init, mapDir, toZH } = require('../src')

init()
mapDir(
  undefined,
  (content , pathname) => {
    let _content = content.replace(/\$t\((['|"])(.*?)\1\)/g, (match, _$1, $2) => {
      // 处理字符串
      return toZH(match, $2)
    })
    fs.writeFileSync(pathname, _content)
  }
)