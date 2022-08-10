
> 💡  根据 [遗忘曲线](https://baike.baidu.com/item/%E9%81%97%E5%BF%98%E6%9B%B2%E7%BA%BF/7278665?fr=aladdin)：如果没有记录和回顾，6天后便会忘记75%的内容
      读书笔记正是帮助你记录和回顾的工具，不必拘泥于形式，其核心是：记录、翻看、思考
## 本文干货

- pont-engine 使用介绍
- 解析 swagger 自动生成 接口响应体 声明文件
- 自定义代码片段 高度自由封装
- 自动导出 api 模块提供全局调用
- 自动生成接口注释

## 前言

最近在日常的开发工作中，发现了一个问题，就是在对接后端的接口时，发现经常要去翻阅接口文档，查到对应的接口以及返回值，这个操作看上去很正常没什么问题，但是没有代码提示确实不是很方便。

通常在项目的设计中都会对接口请求做一个封装处理，目的就是统一规范，统一管理维护，方便拓展和迭代。

  常见的就是在项目的 src/api 文件夹中 添加接口配置文件 以及按模块添加接口的封装如下面这个简单的实现， 当你在业务中想要请求一个 page 列表的时候，需要自己定义请求参数的类型以及接口响应的类型。自己手写类型这个过程就会显得很繁琐且非常耗时。如果接口多的时候那简直就是灾难，有没有一种工具可以自动帮我们来完成接口的类型编写 这件事呢？ 接下来给大家简单介绍一下

  阿里开源的工具  Pont 可以来帮我们完成这件事情，大大节省了对接接口的时间。


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
## Pont 链接前后端

pont 在法语中是“桥”的意思，寓意着前后端之间的桥梁。Pont 把 swagger、rap、dip 等多种接口文档平台，转换成 Pont 元数据。Pont 利用接口元数据，可以高度定制化生成前端接口层代码，接口 mock 平台和接口测试平台。其中 swagger 数据源，Pont 已经完美支持。并在一些大型项目中使用了近两年，各种高度定制化需求都可以满足。

简单的来说 就是通过解析 swagger 的 json 数据，获取到接口的地址、入参和返回值，从而根据这些参数 生成自定义的代码封装。有点意思…

既然官方介绍得这么强大， 那我们来看看怎么解决前言中提到的问题，本文给大家介绍在 vue 中的实践，在此之前建议先简单过一下官方介绍文档。

GitHub地址：[https://github.com/alibaba/pont](https://github.com/alibaba/pont)

示例：[https://github.com/alibaba/pont/tree/master/examples](https://github.com/alibaba/pont/tree/master/examples)（官方只有 react 版本）

## 希望它能给我们解决

- 自动生成接口声明文件
- 自动生成接口封装代码
- 自动生成接口数据的基类
- 自动生成接口代码注释

## 那开始吧
  先讲讲需要用到的功能
### 配置文件

1. **originUrl**: 接口平台提供的数据源（连接一般在swagger 标题下面）
1. **templatePath**：自定义生成代码模版的文件
1. **transformPath**：可以对swagger数据源预处理
1. **outDir**：文件导出的目录
1. **prettierConfig**：喜闻乐见的 代码格式化配置
1. **templateType**：官方提供了 fetch 和 hook 的代码生成模板，但这里我们选择自己生成
1. **mocks**：喜闻乐见的 mocks 数据

官方有非常详细的介绍 更多字段解释-> [传送门](https://github.com/alibaba/pont/blob/master/docs/pontConfig.md)

```json
{
  "originUrl": "/path/to/swagger.json",
  "templateType": "fetch",
  "templatePath": "./path/to/pontTemplate",
  "transformPath": "./path/to/transformPath",
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
### 自定义解析 swagger 的接口数据

当我们拿到后端的 swagger 链接时，一般是包含整个项目的接口。可能有前台的后台的，如果一键生成就包含一些我们不必要的接口信息和冗余代码， 所以 pont 给我们提供了过滤 swagger 模版数据的 api transformPath，我们通过这个配置 export 一个自定义处理数据的方法来完成我们的自定义操作。这样就可以按我们的意愿来选择想要的模块。

mod，指的是接口模块，一个 mod 下可以有N个接口，一般对应的是后端的控制器。

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
###  自定义生成属于自己的接口封装

在每个人的项目实践中都会根据自己的业务需要去封装自己的 http 接口请求，比如常见的 axio 和 fetch，接下来我们将按照上文 前言中提到的封装格式来生成接口代码。

分析一下 下面这个代码片段我们需要生成那些部分才能组成一个 完整的接口封装

   1. 需要定义一个方法入参的接口类型 `getPageParams`
   1. 需要定义一个 api 返回的数据格式接口 `Item`
   1. 一个方法名 `getPage` 参数名 `getPageParams` 
   1. 接口请求类型 `post` 接口路径 `/api/getpage`
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
我们可以看到这6个字段，是我们希望它能够，帮我们自动的生成 各种方法名，入参和返回结果。这样就可以根据不同的接口来生成不同的代码封装代码，然后再将他们按模块一个个写入到我们项目的 `src/api`之中。


未完待续...


#### 
## 踩坑记录

1. 自定义 FileStructures 

在官方的 [customizedPont.md](https://github.com/alibaba/pont/blob/master/docs/customizedPont.md) 介绍中 export 一个 MyFileStructures 即可 重写 FileStructures 的方法，但在 1.3.3 的版本中并不生效, 通过查看源码发现 Manager 类中的 setFilesManager 取值是 FileStructures 并非  MyFileStructures 所以下面这个写法是错误的 好家伙可以提 issue 了
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


