
<a name="gF18o"></a>
## 重要性
代码检查，代码格式化，编辑器自动化，介绍代码规范统一在我们团队的实践应用。<br />在团队协作过程中，让代码简洁清晰，还可以减少 bug 的出现。
<a name="wmTjJ"></a>
## 安装所需依赖库
<a name="gt6wt"></a>
### git hook
`husky`<br />它可以用来注册 git 的 hook 当你在 commit 或者 push 的时候 来 lint 你的代码或提交信息<br />比如 pre-commit hook  可以在 commit  之前 执行 lint-stagaed 来校验你的代码<br />commit-msg hook 可以在 commit 的时候 执行 commitlient 来校验你的提交信息规范<br />它支持所有的 git hook<br />[https://typicode.github.io/husky/](https://typicode.github.io/husky/)<br />tips: 早期版本通过配置文件即可实现 githook 的配置，但现在需要手动安装和注册hook，感兴趣的同学可以通过下面的文章了解一下<br />[https://blog.typicode.com/husky-git-hooks-javascript-config/](https://blog.typicode.com/husky-git-hooks-javascript-config/)<br />[https://zhuanlan.zhihu.com/p/366786798](https://zhuanlan.zhihu.com/p/366786798)
<a name="HJ5km"></a>
### 代码校验集成工具
`lint-staged`<br />它可以在 git 暂存文件上运行 linters 的工具，可以确保减少错误的代码被提交到仓库，并强制格式代码样式保证团队里的每个人风格统一，便于阅读便于维护。<br />可以指定文件类型，配置上你想要的校验方式，如
```javascript
"*.vue": [
  "eslint --fix",
  "prettier --write",
  "stylelint --fix"
],
```
[https://github.com/okonet/lint-staged](https://github.com/okonet/lint-staged)
<a name="qaPWQ"></a>
### 格式化代码
`prettier` 介绍<br />[https://www.prettier.cn/docs/index.html](https://www.prettier.cn/docs/index.html)<br />`eslint` 配置项<br />[https://eslint.org/docs/user-guide/configuring/](https://eslint.org/docs/user-guide/configuring/)
<a name="rKXHG"></a>
### 校验格式化 CSS
`stylelint`<br />`stylelint-config-prettier`  格式化 css<br />`stylelint-config-standard` css 风格规则<br />`stylelint-order` 根据 eslint 的规则自动排序 css 属性<br />官方文档<br />[https://stylelint.io/](https://stylelint.io/)<br />规则介绍<br />[https://stylelint.io/user-guide/rules/list](https://stylelint.io/user-guide/rules/list)<br />更多插件<br />[http://stylelint.docschina.org/user-guide/plugins/](http://stylelint.docschina.org/user-guide/plugins/)
<a name="ox27p"></a>
### 处理 CSS
`postcss`<br />`postcss-html`<br />[https://www.postcss.com.cn/](https://www.postcss.com.cn/)
<a name="BslIm"></a>
### git commit 信息规范
`commitlint`<br />`@commitlint/cli`<br />`@commitlint/config-conventional`校验提交的格式<br />[https://commitlint.js.org/#/](https://commitlint.js.org/#/) 
<a name="vJwp5"></a>
### 更多详细介绍可以参考 [npm](https://www.npmjs.com/) 官网介绍
了解了基础需要依赖的库  接下来我们开始吧~
<a name="DJTOP"></a>
## 配置config文件
在 package.json 中添加 执行脚本 可用于校验css js vue 等文件<br />`"lint-staged": "lint-staged",`<br />继续在 package.json 中添加 `lint-staged` 的配置
```javascript
"lint-staged": {
  "*.{js,ts}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.vue": [
    "eslint --fix",
    "prettier --write",
    "stylelint --fix"
  ],
  "*.{scss,less,styl,css}": [
    "stylelint --fix",
    "prettier --write"
  ],
  "*.md": [
    "prettier --write"
  ]
}
```
每个插件都有自己的 config 文件和 ignore 文件 如下，详细配置规则可以查询官网 文末提供参考<br />`postcss.config.js``prettier.config.js``stylelint.config.js``commitlint.config.js``.eslintrc.js`
<a name="Mwvkz"></a>
### 初始化 git commit hook
安装 husky，在 `package.json` 中添加 执行脚本 初始化 husky<br />`"prepare": "husky install"`
<a name="kbOxj"></a>
### pre-commit
初始化完成后给 `husky`添加 `pre-commit` 的钩子 指定 pre commit 时 执行 `lint-staged` 校验代码<br />`npx husky add .husky/pre-commit "npm run lint-staged"`
<a name="RjO9G"></a>
### commit-msg
添加 `commit-msg`的钩子 指定 commit 时 执行 `commitlint` 提交的格式<br />`npx husky add .husky/pre-commit "npx --no-install commitlint --edit"`
<a name="MfV4L"></a>
### 更多 husky hook
卸载 husky 并且 删除 git hook<br />`npm uninstall husky && git config --unset core.hooksPath`<br />git hook 大全  [https://git-scm.com/docs/githooks](https://git-scm.com/docs/githooks)<br />husky 文档  [https://typicode.github.io/husky/](https://typicode.github.io/husky/)
<a name="iRcMm"></a>
### 安装配置命令行
```javascript
// 安装依赖
npm install -D husky
npm install -D prettier
npm install -D lint-staged@latest
npm install -D stylelint stylelint-config-prettier stylelint-config-standard stylelint-order
npm install -D postcss postcss-html
npm install -D commitlint @commitlint/cli @commitlint/config-conventional

// 添加 npm script -> package.json
"prepare": "husky install",
"lint-staged": "lint-staged",

// 注册 husky
npm run prepare

// 添加 husky git hook
npx husky add .husky/pre-commit "npm run lint-staged"
npx husky add .husky/commit-msg "npx --no-install commitlint --edit"

// 添加 lint-staged -> package.json
"lint-staged": {
  "*.{js,ts}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.vue": [
    "eslint --fix",
    "prettier --write",
    "stylelint --fix"
  ],
  "*.{scss,less,styl,css}": [
    "stylelint --fix",
    "prettier --write"
  ],
  "*.md": [
    "prettier --write"
  ]
}

// 添加各种插件 config 文件
```
<a name="zzkdj"></a>
### [<br />](https://typicode.github.io/husky/)
<a name="k9Avm"></a>
## 校验规则介绍
<a name="J5d3A"></a>
### commit 规范
格式 `type(scope?): subject? body footer?`<br />[https://commitlint.js.org/#/reference-rules](https://commitlint.js.org/#/reference-rules)

- chore：构建配置相关
- docs：文档相关
- feat：添加新功能
- fix：修复 bug
- pref：性能相关
- refactor：代码重构，一般如果不是其他类型的 commit，都可以归为重构
- revert：分支回溯
- style：样式相关
- test：测试相关
<a name="OPYUF"></a>
### style 规范
[https://stylelint.io/user-guide/rules/list](https://stylelint.io/user-guide/rules/list)

- 禁止无效的十六进制颜色
- 不允许重复的字体系列名称
- 不允许在`calc`函数中使用无空格运算符
- 禁止（未转义）字符串中的换行符
- 禁止未知单位 ....
<a name="b0x8s"></a>
### JS 规范
vue 中的使用规范<br />[https://eslint.vuejs.org/rules/](https://eslint.vuejs.org/rules/)

- 组件名必须使用多单纯大驼峰写法
- 不允许箭头函数在 `watch` `computed`中使用
- 不允许重复字段名
- 不允许在与`v-for`相同的元素上使用`v-if`
- 使用 `async/await` 必须配合使用 `trycatch`
<a name="zgMhu"></a>
## 配置文件示例
<a name="wCJK8"></a>
### commitlint.config.js
```javascript
module.exports = {
  ignores: [commit => commit.includes('init')],
  extends: ['@commitlint/config-conventional'],
  rules: {
    'body-leading-blank': [2, 'always'],
    'footer-leading-blank': [1, 'always'],
    'header-max-length': [2, 'always', 108],
    'subject-empty': [2, 'never'],
    'type-empty': [2, 'never'],
    'subject-case': [0],
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'perf',
        'style',
        'docs',
        'test',
        'refactor',
        'build',
        'ci',
        'chore',
        'revert',
        'wip',
        'workflow',
        'types',
        'release'
      ]
    ]
  }
}

```
<a name="mGoKS"></a>
### prettier.config.js
```javascript
module.exports = {
  printWidth: 100,
  semi: true,
  vueIndentScriptAndStyle: true,
  singleQuote: true,
  trailingComma: 'all',
  proseWrap: 'never',
  htmlWhitespaceSensitivity: 'strict',
  endOfLine: 'auto'
}

```
<a name="uWezi"></a>
### stylelint.config.js
```javascript
module.exports = {
  root: true,
  plugins: ['stylelint-order'],
  extends: ['stylelint-config-standard', 'stylelint-config-prettier'],
  customSyntax: 'postcss-html',
  rules: {
    'function-no-unknown': null,
    'selector-class-pattern': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global']
      }
    ],
    'selector-pseudo-element-no-unknown': [
      true,
      {
        ignorePseudoElements: ['v-deep']
      }
    ],
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'tailwind',
          'apply',
          'variants',
          'responsive',
          'screen',
          'function',
          'if',
          'each',
          'include',
          'mixin'
        ]
      }
    ],
    'no-empty-source': null,
    'string-quotes': null,
    'named-grid-areas-no-invalid': null,
    'unicode-bom': 'never',
    'no-descending-specificity': null,
    'font-family-no-missing-generic-family-keyword': null,
    'declaration-colon-space-after': 'always-single-line',
    'declaration-colon-space-before': 'never',
    // 'declaration-block-trailing-semicolon': 'always',
    'rule-empty-line-before': [
      'always',
      {
        ignore: ['after-comment', 'first-nested']
      }
    ],
    'unit-no-unknown': [true, { ignoreUnits: ['rpx'] }],
    'order/order': [
      [
        'dollar-variables',
        'custom-properties',
        'at-rules',
        'declarations',
        {
          type: 'at-rule',
          name: 'supports'
        },
        {
          type: 'at-rule',
          name: 'media'
        },
        'rules'
      ],
      { severity: 'warning' }
    ]
  },
  ignoreFiles: ['**/*.js', '**/*.jsx', '**/*.tsx', '**/*.ts'],
  overrides: [
    {
      files: ['*.vue', '**/*.vue', '*.html', '**/*.html'],
      extends: ['stylelint-config-recommended'],
      rules: {
        'keyframes-name-pattern': null,
        'selector-pseudo-class-no-unknown': [
          true,
          {
            ignorePseudoClasses: ['deep', 'global']
          }
        ],
        'selector-pseudo-element-no-unknown': [
          true,
          {
            ignorePseudoElements: ['v-deep', 'v-global', 'v-slotted']
          }
        ]
      }
    },
    {
      files: ['*.less', '**/*.less'],
      customSyntax: 'postcss-less',
      extends: ['stylelint-config-standard', 'stylelint-config-recommended-vue']
    }
  ]
}

```

<a name="zfNhW"></a>
### .eslintrc.js
```javascript
module.exports = {
  root: true,

  env: {
    node: true
  },

  globals: {
    $: true,
    zbvd: true,
    wx: true
  },

  extends: ['plugin:vue/essential', 'eslint:recommended'],

  parserOptions: {
    parser: 'babel-eslint'
  },

  rules: {
    'vue/max-attributes-per-line': [
      2,
      {
        singleline: 10,
        multiline: {
          max: 3,
          allowFirstLine: false
        }
      }
    ],
    'vue/singleline-html-element-content-newline': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'vue/name-property-casing': ['error', 'PascalCase'],
    'vue/no-v-html': 'off',
    'accessor-pairs': 2,
    'arrow-spacing': [
      2,
      {
        before: true,
        after: true
      }
    ],
    'block-spacing': [2, 'always'],
    'brace-style': [
      2,
      '1tbs',
      {
        allowSingleLine: true
      }
    ],
    camelcase: [
      0,
      {
        properties: 'always'
      }
    ],
    'comma-dangle': [2, 'never'],
    'comma-spacing': [
      2,
      {
        before: false,
        after: true
      }
    ],
    'comma-style': [2, 'last'],
    'constructor-super': 2,
    curly: [2, 'multi-line'],
    'dot-location': [2, 'property'],
    'eol-last': 2,
    eqeqeq: ['off'],
    'generator-star-spacing': [
      2,
      {
        before: true,
        after: true
      }
    ],
    'handle-callback-err': [2, '^(err|error)$'],
    indent: [
      2,
      2,
      {
        SwitchCase: 1
      }
    ],
    'jsx-quotes': [2, 'prefer-single'],
    'key-spacing': [
      2,
      {
        beforeColon: false,
        afterColon: true
      }
    ],
    'keyword-spacing': [
      2,
      {
        before: true,
        after: true
      }
    ],
    'new-cap': [
      2,
      {
        newIsCap: true,
        capIsNew: false
      }
    ],
    'new-parens': 2,
    'no-array-constructor': 2,
    'no-caller': 2,
    'no-console': 'off',
    'no-class-assign': 2,
    'no-cond-assign': 2,
    'no-const-assign': 2,
    'no-control-regex': 0,
    'no-delete-var': 2,
    'no-dupe-args': 2,
    'no-dupe-class-members': 2,
    'no-dupe-keys': 2,
    'no-duplicate-case': 2,
    'no-empty-character-class': 2,
    'no-empty-pattern': 2,
    // 'no-eval': 2,
    'no-ex-assign': 2,
    'no-extend-native': 2,
    'no-extra-bind': 2,
    'no-extra-boolean-cast': 2,
    'no-extra-parens': [2, 'functions'],
    'no-fallthrough': 2,
    'no-floating-decimal': 2,
    'no-func-assign': 2,
    'no-implied-eval': 2,
    'no-inner-declarations': [2, 'functions'],
    'no-invalid-regexp': 2,
    'no-irregular-whitespace': 2,
    'no-iterator': 2,
    'no-label-var': 2,
    'no-labels': [
      2,
      {
        allowLoop: false,
        allowSwitch: false
      }
    ],
    'no-lone-blocks': 2,
    'no-mixed-spaces-and-tabs': 2,
    'no-multi-spaces': 2,
    'no-multi-str': 2,
    'no-multiple-empty-lines': [
      2,
      {
        max: 1
      }
    ],
    'no-native-reassign': 2,
    'no-negated-in-lhs': 2,
    'no-new-object': 2,
    'no-new-require': 2,
    'no-new-symbol': 2,
    'no-new-wrappers': 2,
    'no-obj-calls': 2,
    'no-octal': 2,
    'no-octal-escape': 2,
    'no-path-concat': 2,
    'no-proto': 2,
    'no-redeclare': 2,
    'no-regex-spaces': 2,
    'no-return-assign': [2, 'except-parens'],
    'no-self-assign': 2,
    'no-self-compare': 2,
    'no-sequences': 2,
    'no-shadow-restricted-names': 2,
    'no-spaced-func': 2,
    'no-sparse-arrays': 2,
    'no-this-before-super': 2,
    'no-throw-literal': 2,
    'no-trailing-spaces': 2,
    'no-undef': 2,
    'no-undef-init': 2,
    'no-unexpected-multiline': 2,
    'no-unmodified-loop-condition': 2,
    // 'no-unneeded-ternary': [2, {
    //   'defaultAssignment': false
    // }],
    'no-unreachable': 2,
    'no-unsafe-finally': 2,
    'no-unused-vars': [
      2,
      {
        vars: 'all',
        args: 'none'
      }
    ],
    'no-useless-call': 2,
    'no-useless-computed-key': 2,
    'no-useless-constructor': 2,
    'no-useless-escape': 0,
    'no-whitespace-before-property': 2,
    'no-with': 2,
    'one-var': [
      2,
      {
        initialized: 'never'
      }
    ],
    'operator-linebreak': [
      2,
      'after',
      {
        overrides: {
          '?': 'before',
          ':': 'before'
        }
      }
    ],
    'padded-blocks': [2, 'never'],
    quotes: [
      2,
      'single',
      {
        avoidEscape: true,
        allowTemplateLiterals: true
      }
    ],
    semi: [2, 'never'],
    'semi-spacing': [
      2,
      {
        before: false,
        after: true
      }
    ],
    'space-before-blocks': [2, 'always'],
    // 'space-before-function-paren': [2, 'never'],
    'space-in-parens': [2, 'never'],
    'space-infix-ops': 2,
    'space-unary-ops': [
      2,
      {
        words: true,
        nonwords: false
      }
    ],
    'spaced-comment': [
      2,
      'always',
      {
        markers: [
          'global',
          'globals',
          'eslint',
          'eslint-disable',
          '*package',
          '!',
          ','
        ]
      }
    ],
    'template-curly-spacing': [2, 'never'],
    'use-isnan': 2,
    'valid-typeof': 2,
    'wrap-iife': [2, 'any'],
    'yield-star-spacing': [2, 'both'],
    yoda: [2, 'never'],
    // 'prefer-const': 2,
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    'object-curly-spacing': [
      2,
      'always',
      {
        objectsInObjects: false
      }
    ],
    'array-bracket-spacing': [2, 'never']
  },

  extends: ['plugin:vue/essential', 'eslint:recommended']
}

```
<a name="eiO5E"></a>
### postcss.config.js
```javascript
module.exports = {
  plugins: {
    autoprefixer: {}
  }
}

```
