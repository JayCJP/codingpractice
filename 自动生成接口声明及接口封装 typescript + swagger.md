
>💡根据 [遗忘曲线](https://baike.baidu.com/item/%E9%81%97%E5%BF%98%E6%9B%B2%E7%BA%BF/7278665?fr=aladdin)：如果没有记录和回顾，6天后便会忘记75%的内容<br />      读书笔记正是帮助你记录和回顾的工具，不必拘泥于形式，其核心是：记录、翻看、思考

<a name="HP1DO"></a>
## 本文干货

- pont-engine 使用介绍
- 解析 swagger 自动生成 接口响应体 声明文件
- 自定义代码片段 高度自由封装
- 自动导出 api 模块提供全局调用
- 自动生成接口注释

<a name="YRys8"></a>
## 前言

最近在日常的开发工作中，发现了一个问题，就是在对接后端的接口时，发现经常要去翻阅接口文档，查到对应的接口以及返回值。这个操作看上去很正常没什么问题，但是没有代码提示确实不是很方便。需要在浏览器请求中查看返回值

通常在项目的设计中都会对接口请求做一个封装处理，目的就是统一规范，统一管理维护，方便拓展和迭代。常见的就是在项目的 src/api 文件夹中 添加接口配置文件 以及按模块添加接口的封装

如下面这个简单的实现， 当你在业务中想要请求一个 page 列表的时候，需要自己定义请求参数的类型以及接口响应的类型。自己手写类型这个过程就会显得很繁琐且非常耗时。如果接口多的时候那简直就是灾难，有没有一种工具可以自动帮我们来完成接口的类型编写 这件事呢？ 接下来给大家简单介绍一下   阿里开源的工具  Pont 可以来帮我们完成这件事情，大大节省了对接接口的时间。

```typescript
// src/api/http.ts  公共的 http 请求 axios 封装
class Http {
  // 请求类型
  post<T, U>(url: string, data: U, config?: AxiosRequestConfig) {
    return this.handleResponse<T>({
      url: url,
      method: 'POST',
      data: data,
      ...config
    })
  }
  get<T, U>(url: string, data: U, config?: AxiosRequestConfig): Promise<T>
  // 请求方法
  handleResponse<T>(config: AxiosRequestConfig): Promise<T>
}
  
  const httpReq = new Http({
    timeout: 5000
  })
  
  // 请求方式封装 (T 定义接口放回的数据实体, U 定义接口入参的结构)
  export function post<T, U>(url: string, data: U, config?: AxiosRequestConfig) {
    return httpReq.post<T, U>(url, data, config)
  }

// ----------------------  分割线 ----------------------------- //

// src/api/mods/xxx.ts  封装接口对应的方法

interface getPageParams {
  page: number
  size: number
}
interface Item {
  id: number
  title: string
}
// 获取列表
export function getPage(data: getPageParams) {
  return post<Item[], getPageParams>('/api/getpage', data)
}

```

<a name="mZ5VA"></a>
## Pont 链接前后端

pont 在法语中是“桥”的意思，寓意着前后端之间的桥梁。Pont 把 swagger、rap、dip 等多种接口文档平台，转换成 Pont 元数据。Pont 利用接口元数据，可以高度定制化生成前端接口层代码，接口 mock 平台和接口测试平台。其中 swagger 数据源，Pont 已经完美支持。并在一些大型项目中使用了近两年，各种高度定制化需求都可以满足。

简单的来说 就是通过解析 swagger 的 json 数据，获取到接口的地址、入参和返回值，从而根据这些参数 生成自定义的代码封装。有点意思…

既然官方介绍得这么强大， 那我们来看看怎么解决前言中提到的问题，本文给大家介绍在 vue 中的实践，在此之前建议先简单过一下官方介绍文档。

GitHub地址：[https://github.com/alibaba/pont](https://github.com/alibaba/pont)

示例：[https://github.com/alibaba/pont/tree/master/examples](https://github.com/alibaba/pont/tree/master/examples)（官方只有 react 版本）

<a name="z7syQ"></a>
## 希望它能给我们解决

- 自动生成接口声明文件
- 自动生成接口封装代码
- 自动生成接口数据的基类
- 自动生成接口代码注释
- yarn apis 自动输出文件

<a name="QE7no"></a>
## 那开始吧

1. 找一个 swagger 接口文档 ，注意 pont 只支持 swagger 2 以上的版本
2. 在项目的根目录创建一个 `pont-config.json`文件
3. 创建一个目录 `pontConfig` 
4. 创建两个文件到 `pontTemplate.ts` `transformPath.ts` 到  `pontConfig` 
5. 全局安装 pont-engine

<a name="mwJ5l"></a>
### 初始配置文件

1. **originUrl**：接口平台提供的数据源（连接一般在swagger 标题下面）
1. **templatePath**：自定义生成代码模版的文件
1. **transformPath**：可以对swagger数据源预处理
1. **outDir**：文件导出的目录
1. **prettierConfig**：喜闻乐见的 代码格式化配置
1. **templateType**：官方提供了 fetch 和 hook 的代码生成模板，但这里我们选择自己生成
1. **mocks**：喜闻乐见的 mocks 数据

官方有非常详细的介绍 更多字段解释-> [传送门](https://github.com/alibaba/pont/blob/master/docs/pontConfig.md)

`pont-config.json` 添加下面的信息

```json
{
  "originUrl": "/path/to/swagger.json",
  "templateType": "fetch",
  "templatePath": "./pontConfig/pontTemplate",
  "transformPath": "./pontConfig/transformPath",
  "outDir": "./src/api",
  "mocks": {
    "enable": false
  },
  "prettierConfig": {
    "tabWidth": 2,
    "semi": false,
    "singleQuote": true,
    "bracketSpacing": true,
    "arrowParens": "avoid",
    "trailingComma": "none",
    "proseWrap": "never",
    "printWidth": 300,
    "htmlWhitespaceSensitivity": "ignore",
    "endOfLine": "auto"
  }
}
```

<a name="ZKPaZ"></a>
### 自定义解析 swagger 的接口数据

当我们拿到后端的 swagger 链接时，一般是包含整个项目的接口。可能有前台的后台的，如果一键生成就包含一些我们不必要的接口信息和冗余代码， 所以 pont 给我们提供了过滤 swagger 模版数据的 api transformPath，我们通过这个配置 export 一个自定义处理数据的方法来完成我们的自定义操作。这样就可以按我们的意愿来选择想要的模块。

mod，指的是接口模块，一个 mod 下可以有N个接口，一般对应的是后端的控制器。

<a name="nv5qz"></a>
#### transformPath

`transformPath.ts` 添加下面的代码，再配置自己想要的接口模块，也可以不加默认导出全部，如果不加 配置文件 `transformPath`字段留空即可。

```javascript
// transfrom.ts 根据 Mod.name进行过滤
import { StandardDataSource } from 'pont-engine'
const useMods = ['模块A', '模块B', '模块B']

// 从原数据中过滤我们所需要的接口模块
export default function transform(data: StandardDataSource) {
  // 取到所需要的 mods 和 baseClass
  const { mods, baseClasses } = filterModsAndBaseClass(useMods, data)
  data.mods = mods
  data.baseClasses = baseClasses
  // 返回给 pont，它将只会处理这些模块数据
  return data
}

/**
 * 过滤mod及所依赖的baseClass
 * @param filterMods Mod.name数组
 * @param data StandardDataSource
 */
function filterModsAndBaseClass(filterMods: string[], data: StandardDataSource) {
  const mods = data.mods.filter(mod => {
    const pickOne = filterMods.includes(mod.name)
    pickOne && console.log('模块: ' + mod.name)
    return pickOne
  })
  // 获取所有 typeName (实体的名称)
  let typeNames = JSON.stringify(mods).match(/"typeName":".+?"/g)

  typeNames = Array.from(new Set(typeNames)) // 去重
    // 取typeName的值
    .map(item => item.split(':')[1].replace(/"/g, ''))

  // 过滤 baseClasses (根据实体名称生成baseclass)
  const baseClasses = data.baseClasses.filter(cls => typeNames && typeNames.includes(cls.name))

  return { mods, baseClasses }
}
```

<a name="ppLbb"></a>
###  自定义生成属于自己的接口封装

在每个人的项目实践中都会根据自己的业务需要去封装自己的 http 接口请求，比如常见的 axio 和 fetch。接下来我们将按照上文 前言 中提到的封装来生成接口代码。

分析一下 下面这个代码片段我们需要生成那些部分才能组成一个 完整的接口封装

   1. 需要定义一个方法入参的接口类型 `getPageParams`
   2. 需要定义一个 api 返回的数据格式接口 `Item`
   3. 一个方法名 `getPage` 参数名 `getPageParams` 
   4. 接口请求类型 `post` 接口路径 `/api/getpage`

```typescript
interface getPageParams {
  page: number
  size: number
}
interface Item {
  id: number
  title: string
}
// 需要一个方法名 参数名
export function getPage(data: getPageParams) {
  return post<Item[], getPageParams>('/api/getpage', data)
}
```

我们可以看到这6个字段是我们希望它能够帮我们自动的生成的，如各种方法名，入参和返回结果。这样就可以根据不同的接口来生成不同的代码封装代码，然后再将他们按模块一个个写入到我们项目的 `src/api`之中，这样就很完美了

pont 提供的能力就是通过重写他们的 方法 来实现高度定制化的需求，可以给你定义代码模板以及输出的文件目录结构。以下是我们使用到 api，pont 给我们提供了很多功能 大家可以去看看文档，下面是官方介绍。

代码生成器： pont 将即刻生成一份默认的自定义代码生成器。通过覆盖默认的代码生成器，来自定义生成代码。默认的代码生成器包含两个类，一个负责管理目录结构 `FileStructures`，一个负责管理目录结构每个文件如何生成代码 `CodeGenerator`。自定义代码生成器通过继承这两个类，覆盖对应的代码来达到自定义的目的。

```typescript
export class FileStructures extends Pont.FileStructures {
  /** 获取模块的类型定义代码, generator.hasContextBund 为true时覆盖 generator的同名方法 */
  getModsDeclaration(originCode: string, usingMultipleOrigins: boolean): string
  /** 获取总文件结构  */
  getFileStructures(): FileStructure
}

export default class MyGenerator extends CodeGenerator {
  /** 获取接口实现内容的代码 */
  getInterfaceContent(inter: Interface): string
  /** 获取所有基类文件代码 */
  getBaseClassesIndex(): string
  /** 获取单个模块的 index 入口文件 */
  getModIndex(mod: Mod): string
  /** 获取所有模块的 index 入口文件 */
  getModsIndex(): string
  /** 获取接口类和基类的总的 index 入口文件代码 */
  getIndex(): string
}

```
<a name="tZq1f"></a>
#### CodeGenerator 类

1. getInterfaceContent

这个接口的入参为 Interface（[建议看下源码定义](https://github.com/JayCJP/pont/blob/master/packages/pont-engine/src/standard.ts)） 这个api给我们提供了接口所有相关的信息，也满足我们上面提到的6个字段，我们就可以用它来完成接口自定义封装。将参数拼装成我们想要的样子。

inter 应用介绍

```typescript
getInterfaceContent(inter: Interface): string

inter.description // 接口描述
inter.method // 请求类型

// 接口参数代码块
host // 业务域名
paramsCode = inter.getParamsCode(interfaceName) // get 参数 querystring
inter.getBodyParamsCode() // post 参数 body payload
inter.response // 描述接口的响应类型
inter.path // 接口路径

// 取到接口生成的 返回值 view model
const resultVo = formatResultVo(inter.response)
// 格式化后获取到 请求封装的入参
const paramsCodeString = formatParameter(...)
// 将 paramsCode 转为接口注释
const getParamsNoteList = getParamsNote(paramsCode)

// 类似这样的拼装即完成了接口的自定义封装
export function ${inter.name}(${paramsCodeString}) {
  return ${method}<${resultVo}, ${bodyParamsCode}>(
    ${host}${inter.path}(data, config)
  )
}

// 我们想要的格式模板
// export function getPage(data: getPageParams) {
//   return post<Item[], getPageParams>('/api/getpage', data)
// }
```

2. getModIndex

pont 在输出文件的时候，会按照一个接口生成一个 ts 文件，这样接口一多就会生成很多的独立文件。为了避免接口文件太多影响编译打包速度的问题，所以我们可以在这一步将所有接口生成到一个 index.ts 文件中，就可以达到优化的目的。 这里的方法入参为一个接口模块，可以在这个模块中拿到所有的接口，再将他们集合起来，具体实现看下面完整实现代码

3. getModsIndex

将所有的接口模块 一起导入到一个 index.ts 再导出为一个模块<br />具体实现看下面完整实现代码

```typescript
import * as common from './common'
import * as user './user'
export default { common, user }
```

4. getIndex

这一步操作我们将所有的接口模块和接口定义声明合并导出。如果想要绑定到全局，可以直接 import 这个文件具体实现看下面完整实现代码

```typescript
import * as defs from './baseClass'
import mods from './mods/'
export { defs, mods }
```

5. getBaseClassesIndex

这里主要是处理 baseclass 中 number 类型的兼容（踩坑记录第二条）

下面请看接口的完整实现代码

```typescript
import { CodeGenerator, Interface, Mod, StandardDataType } from 'pont-engine'

export default class MyGenerator extends CodeGenerator {
  getInterfaceContent(inter: Interface) {
    // 优化参数名
    // 定义参数接口类型名称
    const interfaceName = `${inter.name}Params`
    // 获取 get 请求，接口声明的内容字段 -> 指定接口名称 生成代码块
    const paramsCode = inter.getParamsCode(interfaceName)
    // 获取 post 请求，入参的实体 -> 代码块
    const bodyParamsCode = inter.getBodyParamsCode()
    // 请求方法
    const method = inter.method.toLowerCase() as MethodType
    // 判断接口是否需要请求参数
    const hasGetParams = !paramsCode.replace(/\n| /g, '').includes('{}')
    const host = '`${exhibit}'
    const po = '`'

    // 将 class 定义 转为接口声明（属于强迫症行为）
    const funcParams = paramsCode.replace(/class /, `interface `)
    // 格式化后获取到 请求封装的入参
    const paramsCodeString = formatParameter(method, hasGetParams, interfaceName, bodyParamsCode)

    // 取到接口生成的 返回值 view model
    const resultVo = formatResultVo(inter.response)

    // 根据入参定义传参的格式（封装好的 get post 请求）
    let totalParams = ''
    // 需要携带参数
    if (paramsCodeString.length) {
      // 判断是否需要 axios config 配置
      if (paramsCodeString.includes('config')) {
        totalParams = ', data, config'
      } else {
        totalParams = ', data'
      }
    }
    const getParamsList = getParamsNote(paramsCode)
    // 添加接口注释
    const note = `/**
  * @description ${inter.description}
  * @method ${method}
  ${getParamsList.join('\n')} 
  */`

    // 返回整体的代码模板
    return `
    ${hasGetParams ? funcParams : ''}

    ${note}
    export function ${inter.name}(${paramsCodeString}) {
      return ${method}<${resultVo}, ${bodyParamsCode || (hasGetParams ? interfaceName : 'any')}>(
        ${host}${inter.path}${po}${totalParams}
      )
    }
    `
  }

  /** 获取所有基类文件代码 */
  getBaseClassesIndex() {
    const clsCodes = this.dataSource.baseClasses.map(base => {
      return `
        class ${base.name} {
          ${base.properties
            .map(prop => {
              const propValue = prop.toPropertyCodeWithInitValue(base.name)
              // 由于 pont 没有对 number 类型进行处理，初始值给了 undefined
              // 所以这里需要将基类属性类型为number的初始值 改为 0
              if (prop.dataType.typeName === 'number') {
                return propValue.replace(/undefined/g, '0')
              } else {
                return propValue
              }
            })
            .filter(id => id)
            .join('\n')}
        }
      `
    })

    if (this.dataSource.name) {
      return `
        ${clsCodes.join('\n')}
        export const ${this.dataSource.name} = {
          ${this.dataSource.baseClasses.map(bs => bs.name).join(',\n')}
        }
      `
    }

    return clsCodes.map(cls => `export ${cls}`).join('\n')
  }

  /** 获取单个模块的 index 入口文件 */
  getModIndex(mod: Mod) {
    const methods = new Set<string>()
    let importAxiosConfig = ''
    const modContent = `
      /**
       * @description ${mod.description}
       */
      ${mod.interfaces
        .map(inter => {
          methods.add(inter.method)
          // 获取 post 请求
          if (inter.method == 'post') {
            // 接口声明的内容字段 -> 指定接口名称 生成代码块
            const paramsCode = inter.getParamsCode()
            // 判断接口是否需要请求参数
            const hasGetParams = !paramsCode.replace(/\n| /g, '').includes('{}')
            if (hasGetParams) {
              importAxiosConfig = `import type { AxiosRequestConfig } from '@/types/axios'`
            }
          }
          return this.getInterfaceContent(inter)
        })
        .join('\n')}
    `

    return `
    ${importAxiosConfig}
    import { exhibit } from '@/utils/http/baseUrl'
    import { ${Array.from(methods)
      .map(type => {
        return type.toLowerCase()
      })
      .join(', ')} } from '@/utils/http'

    ${modContent}
    `
  }

  /** 获取所有模块的 index 入口文件 */
  getModsIndex() {
    const conclusion = `
      export default { ${this.dataSource.mods.map(mod => reviseModName(mod.name)).join(', \n')} }
    `
    return `
    ${this.dataSource.mods
      .map(mod => {
        const modName = reviseModName(mod.name)
        console.log('导出接口:' + modName)
        return `import * as ${modName} from './${modName}';`
      })
      .join('\n')}

      ${conclusion}
    `
  }

  /** 获取接口类和基类的总的 index 入口文件代码 */
  getIndex() {
    let conclusion = `
      import * as defs from './baseClass';
      import mods from './mods/';

      export { defs, mods }
    `

    // dataSource name means multiple dataSource
    if (this.dataSource.name) {
      conclusion = `
        import { ${this.dataSource.name} as defs } from './baseClass';
        export { ${this.dataSource.name} } from './mods/';
        export { defs };
      `
    }

    return conclusion
  }
}
```

<a name="ptxaj"></a>
### 自定义生成文件结构目录

<a name="PKgRo"></a>
#### FileStructures 类

1. getModsDeclaration

在 pont 官方的模板代码中会 生成 `api.d.ts` 的声明文件，但其中包含了 `API` 接口方法的定义，这部分是我们不需要的，因为我们采用自己生成的模板，所以这部分在我们这里是不适用，我们只需要其中的  `defs` 类型的定义即可。因此我们将重写这个方法 让其返回一个空的字符串

2. getFileStructures

pont 在输出文件的时候，会按照一个接口生成一个 ts 文件，如果接口几十个，这将会生成几十个文件，很明显在这点上会影响到打包和编译 ts 的速度。所以我们要将 一个 mod 下面的所有接口 合成一个 ts 文件，这一步在上面的 `getModIndex`中已经完成，所以我们在这个地方只需要创建 index.ts 即可，其他可以不创建

```typescript
import * as Pont from 'pont-engine'

export class FileStructures extends Pont.FileStructures {
  /** 获取 index 内容 */
  getModsDeclaration(originCode: string, usingMultipleOrigins: boolean) {
    // 由于我们不使用 pont 的 request模板，所以这里我们只需要导出接口的定义
    // API 的定义声明，这里不需要所以返回空
    if (usingMultipleOrigins) {
      return ''
    } else {
      return ''
    }
  }
  /** 获取总文件结构   */
  getFileStructures() {
    // 文件结构
    const result = this.getOriginFileStructures(this.generators[0])
    // 遍历所有mods
    for (const key in result.mods) {
      if (Object.prototype.hasOwnProperty.call(result.mods, key)) {
        const el = result.mods[key]
        // 只保留 mods 中的index文件， 在 getModIndex 中将接口代码写入到同一个文件
        if (el['index.ts']) {
          const newmod = {
            'index.ts': el['index.ts']
          }
          result.mods[key] = newmod
        }
      }
    }
    return result
  }
}
```
<a name="AM6ag"></a>
## 踩坑记录

<a name="Y4Nt1"></a>
### 自定义 FileStructures 

在官方的 [customizedPont.md](https://github.com/alibaba/pont/blob/master/docs/customizedPont.md) 介绍中 export 一个 MyFileStructures 即可 重写 FileStructures 的方法，但在 1.3.3 的版本中并不生效, 通过查看源码发现 Manager 类中的 setFilesManager 取值是 FileStructures 并非  MyFileStructures 所以下面这个写法是错误的 好家伙

```javascript
// pontTransfrom.ts  文档推荐写法 
export class MyFileStructures extends FileStructures {}

// 实际源码 manage.ts 解析代码时 结构取值为 FileStructures
setFilesManager() {
  this.report('文件生成器创建中...')
  const { default: Generator, FileStructures: MyFileStructures } = getTemplate(
    this.currConfig.templatePath,
    this.currConfig.templateType
  )
  // 其他源码 .... 
}

```
更正如下
```javascript
import * as Pont from 'pont-engine'
export class FileStructures extends Pont.FileStructures {}
```

<a name="LOivr"></a>
### baseclass 中 number 类型的字段初始值为 undefined
经过查找源码发现 class StandardDataType->getInitialValue  这个方法在生成 baseClass 的 key 		value 是，没有给 number 类型的属性做初始值处理，初始值给了 undefined， 所以出现基类属性

初始值的类型和接口定义 api.d.ts 的类 属性类型不一致导致类型错误。
通过重写 下面这个方法 纠正这个类型错误

```typescript
/** 获取所有基类文件代码 */
getBaseClassesIndex() {}
```


<a name="DC9dr"></a>
## 实践一下

在 package.json 中 添加一个 script 

```json
'script': {
   'apis': 'pont generate'
}
```

yarn apis -> pont 会根据我们配置的信息自动生成 api 下资源文件
```
src
├─api             #api文件夹
│  ├─mods            #模块
│  │  ├─common          #公共
│  │  ├─user            #用户
│  │  └─index.ts        #集合所有接口
|  ├─baseClass.ts    #基类
|  ├─api.d.ts        #接口声明文件
│  └─index.ts        #集合导出基类&模块&声明
```

在 vue 中按需引用接口 如下示例:

```typescript
// user.vue
import { userVo } from '@/api/baseClass'
import { getDetail } from '@/api/mods/user'

const userInfo = reactive(new userVo())

function getUserDetail(id: number) {
  getDetail({ id })
    .then(res => {
        userInfo = res.data
    })
    .catch(error => {
      Message.error(error.msg)
    })
}
```
