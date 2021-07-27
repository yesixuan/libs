## Usage
## i18n.config.js

```js
module.exports = {
  // 原项目中的中文语言包位置
  zhLangPath: './lang/zh_ch.json',
  // 原项目语言包的路径（有多少种语言就有多少个路径）
  langPathes: ['./lang/zh_ch.json', './lang/en_sh.json'],
  // 生成的 exel 的位置
  excelPathes: './lang/vic.xlsx',
  // 自定义的开始和结束 转换标示
  tag: '@@'
}
```