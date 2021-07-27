const path = require('path')
const fs = require('fs-extra')
const rollup = require('rollup')
const rollupTypescript = require('rollup-plugin-typescript2')
const babel = require('@rollup/plugin-babel').default
const resolve = require('@rollup/plugin-node-resolve').default
const commonjs = require('@rollup/plugin-commonjs')
const { eslint } = require('rollup-plugin-eslint')
const { DEFAULT_EXTENSIONS } = require('@babel/core')
const { terser } = require('rollup-plugin-terser')
const { targets: getTargets } = require('./util')

const [ , , ...targets ] = process.argv
const targetPackages = targets.length ? targets : getTargets

const getPkgPath = target => path.join(__dirname, `../packages/${target}`)

buildAll(targetPackages)

async function buildAll(targets) {
  for (const target of targets) {
    try {
      await build(target)
    } catch(e) {
      console.log('eeeeeeeee', e)
    }
  }
}

async function build(target) {
  await fs.remove(`${getPkgPath(target)}/lib`)
  const inputOptions = {
    input: `${getPkgPath(target)}/src/index.ts`,
    plugins: [
      // 验证导入的文件
      eslint({
        throwOnError: true, // lint 结果有错误将会抛出异常
        throwOnWarning: true,
        include: ['src/**/*.ts'],
        exclude: ['node_modules/**', 'lib/**', '*.js'],
      }),
  
      // 配合 commnjs 解析第三方模块
      resolve({
        // 将自定义选项传递给解析插件
        customResolveOptions: {
          moduleDirectory: 'node_modules',
        },
      }),
  
      // 使得 rollup 支持 commonjs 规范，识别 commonjs 规范的依赖
      commonjs(),
      rollupTypescript({
        tsconfig: path.join(__dirname, '../tsconfig.json'),
        useTsconfigDeclarationDir: false,
        declarationDir: `${getPkgPath(target)}/lib`,
      }),
      babel({
        babelHelpers: 'bundled',
        // 只转换源代码，不运行外部依赖
        exclude: 'node_modules/**',
        // babel 默认不支持 ts 需要手动添加
        extensions: [
          ...DEFAULT_EXTENSIONS,
          '.ts',
        ],
      }),
      terser()
    ],
    external: ['rxjs', 'vuex', 'vue'],
  }
  const outputOptions = [
    {
      file: `${getPkgPath(target)}/lib/index.js`,
      format: 'cjs',
      name: target,
      extend: true,
      sourcemap: true
    },
    {
      file: `${getPkgPath(target)}/lib/index.esm.js`,
      format: 'esm',
      name: target,
      extend: true,
      sourcemap: true
    },
    {
      file: `${getPkgPath(target)}/lib/index.iife.js`,
      format: 'iife',
      name: target,
      extend: true,
      sourcemap: true
    }
  ]
  const bundle = await rollup.rollup(inputOptions)
  for (const output of outputOptions) {
    await bundle.write(output)
  }

  // build types
  const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor')
  const pkgDir = getPkgPath(target)
  const extractorConfigPath = path.resolve(pkgDir, `api-extractor.json`)
  const extractorConfig = ExtractorConfig.loadFileAndPrepare(
    extractorConfigPath
  )
  const extractorResult = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: true
  })

  if (extractorResult.succeeded) {
    // concat additional d.ts to rolled-up dts
    const typesDir = path.resolve(pkgDir, 'types')
    if (await fs.exists(typesDir)) {
      const dtsPath = path.resolve(pkgDir, pkg.types)
      const existing = await fs.readFile(dtsPath, 'utf-8')
      const typeFiles = await fs.readdir(typesDir)
      const toAdd = await Promise.all(
        typeFiles.map(file => {
          return fs.readFile(path.resolve(typesDir, file), 'utf-8')
        })
      )
      await fs.writeFile(dtsPath, existing + '\n' + toAdd.join('\n'))
    }
    console.log(
      `API Extractor completed successfully.`
    )
  } else {
    console.error(
      `API Extractor completed with ${extractorResult.errorCount} errors` +
        ` and ${extractorResult.warningCount} warnings`
    )
    process.exitCode = 1
  }

  await fs.remove(`${pkgDir}/lib/packages`)
}
