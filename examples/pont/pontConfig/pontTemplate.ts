import * as Pont from 'pont-engine'
import { CodeGenerator, Interface, Mod, StandardDataType, BaseClass } from 'pont-engine'

/** 接口模板 */
// import { get } from '@/utils/http'
// import { exhibit } from '@/utils/http/baseUrl'

// interface getHallPageParams {
//   /** 商家id */
//   mcId?: number
//   /** 第几页，默认1 */
//   page?: number
//   /** 每页大小, 默认10，-1表示不分页 */
//   size?: number
//   /** 展厅标题 */
//   title?: string
// }

// /**
//  * @description 获取展厅列表
//  * @method get
//  * @param mcId number;
//  * @param page number;
//  * @param size number;
//  * @param title string;
//  */
// export function getHallPage(data: getHallPageParams) {
//   return get<defs.PageVo<defs.HallVo>, getHallPageParams>(`${exhibit}/manage/hall/page`, data)
// }

export enum Surrounding {
  typeScript = 'typeScript',
  javaScript = 'javaScript'
}

export class FileStructures extends Pont.FileStructures {
  /** 获取 index 内容 */
  // getModsDeclaration(originCode: string, usingMultipleOrigins: boolean) {
  //   // 由于我们不适用 pont 的 request模板，所以这里我们导出接口的定义
  //   // API 的定义声明，源码是 originCode ，这里不需要所以返回空
  //   if (usingMultipleOrigins) {
  //     return ''
  //   } else {
  //     return ''
  //   }
  // }

  getFileStructures() {
    const isMultiple = this.usingMultipleOrigins || this.generators.length > 1
    const result = isMultiple ? this.getMultipleOriginsFileStructures() : this.getOriginFileStructures(this.generators[0])
    // 过滤掉单个接口文件
    Object.keys(result).forEach(el => {
      console.log(el)
      if (!el.includes('.ts') && !el.includes('.json')) {
        const modsData = isMultiple ? result[el].mods : result[el]
        // 遍历所有mods
        for (const key in modsData) {
          if (Object.prototype.hasOwnProperty.call(modsData, key)) {
            const el = modsData[key]
            // 只保留 mods 中的index文件， 在 getModIndex 中将接口代码写入到同一个文件
            if (el['index.ts']) {
              const newmod = {
                'index.ts': el['index.ts']
              }
              modsData[key] = newmod
            }
          }
        }
      }
    })

    return result
  }
}

export default class MyGenerator extends CodeGenerator {
  getInterfaceContent(inter: Interface, modsName = 'exhibit') {
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
    const po = '`'

    // 将 class 定义 转为接口声明（属于强迫症行为）
    const funcParams = paramsCode.replace(/class /, `interface `)
    // 格式化后获取到 请求封装的入参
    const paramsCodeString = formatParameter(method, hasGetParams, interfaceName, bodyParamsCode)

    // 取到接口生成的 返回值 view model
    // const resultVo = formatResultVo(inter.response, modsName)

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
      return ${method}<${inter.responseType}, ${hasGetParams ? interfaceName : bodyParamsCode || 'any'}>
        (
          ${po}${'${' + modsName + '}'}${inter.path}${po}${totalParams}
        )
    }
    `
  }

  /** 获取所有基类文件代码 */
  getBaseClassesIndex() {
    const clsCodes = this.dataSource.baseClasses.map(base => {
      return `
        export class ${base.name} {
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
    const dsName = mod.getDsName() || 'exhibit'
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
          return this.getInterfaceContent(inter, dsName)
        })
        .join('\n')}
    `

    return `
    ${importAxiosConfig}
    import { ${dsName} } from '@/utils/http/baseUrl'
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
    let conclusion = `
      export default {
        ${this.dataSource.mods.map(mod => reviseModName(mod.name)).join(', \n')}
      }
    `

    // dataSource name means multiple dataSource
    if (this.dataSource.name) {
      conclusion = `
        export {
          ${this.dataSource.mods.map(mod => reviseModName(mod.name)).join(', \n')}
        }
      `
    }

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
        import  * as ${this.dataSource.name} from './mods/';
        export { defs, ${this.dataSource.name} };
      `
    }

    return conclusion
  }

  /** 获取某个基类的类型定义代码 */
  getBaseClassInDeclaration(base: BaseClass) {
    if (base.templateArgs && base.templateArgs.length) {
      return `class ${base.name}<${base.templateArgs.map((_, index) => `T${index} = any`).join(', ')}> {
        ${base.properties
          .map(prop => {
            prop.required = true
            return prop.toPropertyCode(Surrounding.typeScript, true)
          })
          .join('\n')}
      }
      `
    }
    return `class ${base.name} {
      ${base.properties
        .map(prop => {
          prop.required = true
          return prop.toPropertyCode(Surrounding.typeScript, true)
        })
        .join('\n')}
    }
    `
  }
  /** 获取模块的类型定义代码，一个 namespace ，一般不需要覆盖 */
  getModsDeclaration() {
    const mods = this.dataSource.mods
    const content = `namespace ${this.dataSource.name || 'API'} {
        ${mods
          .map(
            (mod: Mod) => `
            /**
             * ${mod.description}
             */
            export namespace ${reviseModName(mod.name)} {
              ${mod.interfaces
                .map((inter: Interface) => {
                  return `
                  /**
                    * ${inter.method} ${inter.description}
                    * ${inter.path}
                    */
                  ${this.getInterfaceContentInDeclaration(inter)}
                `
                })
                .join('\n')}
            }`
          )
          .join('\n\n')}
      }
    `
    return content
  }

  /** 获取接口内容的类型定义代码 */
  getInterfaceContentInDeclaration(inter: Interface) {
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
    // 格式化后获取到 请求封装的入参
    const paramsCodeString = formatParameter(method, hasGetParams, interfaceName, bodyParamsCode)
    // 将 class 定义 转为接口声明（属于强迫症行为）
    const funcParams = paramsCode.replace(/class /, `interface `)
    return `
      ${hasGetParams ? funcParams : ''}
      export function ${inter.name}(${paramsCodeString}): Promise<${inter.responseType}>;
    `
  }
}

/**
 * 处理接口的返回值类型定义
 * @param {StandardDataType} response 接口响应描述
 * @return void
 */
function formatResultVo(response: StandardDataType, modsName: string) {
  let resultVo = ''
  const baseTypes = ['string', 'number', 'boolean', 'Array', 'void', 'null', 'object', 'ObjectMap']
  // 是否有嵌套的泛型 如：defs.PageVo<defs.HallVo>
  if (response.typeArgs.length) {
    // 这里的逻辑 看后端定义的 响应体 泛型的参数个数
    // 本项目 ApiResponse 只有一个泛型参数所有取第一个即可
    const defsvo = response.typeArgs[0]
    resultVo = `${defsvo.typeName}`

    if (defsvo.typeArgs.length) {
      resultVo += `<${defsvo.typeArgs
        .map(arg => {
          const allargs = arg.generateCode(modsName)
          return allargs
        })
        .join(', ')}>`
    }
  } else {
    resultVo = response.typeName
  }
  // 兼容其他类型（非基础类型则返回带定义的引用 defs 为全局声明文件）
  if (baseTypes.includes(resultVo) || resultVo.startsWith('Array') || resultVo.startsWith('ObjectMap')) {
    return resultVo
  } else {
    resultVo = `defs.${modsName + '.'}${resultVo}`
    return resultVo
  }
}

type MethodType = 'get' | 'post'
/**
 * 格式化输chu 接口的入参
 * @param {MethodType} method 请求方法
 * @param {boolean} hasGetParams 是否有 get 参数
 * @param {string} interfaceName get 的参数名
 * @param {string} bodyParamsCode post 的请求实体类型
 * @return void
 */
function formatParameter(method: MethodType, hasGetParams: boolean, interfaceName: string, bodyParamsCode: string) {
  /**
   * get -> (data: get query params)
   * post -> (data: post body, config: AxiosRequestConfig)
   */
  // 根据请求方式生成 入参的参数定义（默认post）
  let paramsCodeString = `data: ${bodyParamsCode || 'any'}`
  // get 请求判断是否需要参数
  if (method == 'get') {
    paramsCodeString = hasGetParams ? `data: ${interfaceName}` : ''
  }
  // post 请求判断是否有 body 参数和 query 参数
  if (method == 'post') {
    if (bodyParamsCode) {
      paramsCodeString = `data: ${bodyParamsCode}`
    }
    if (hasGetParams) {
      paramsCodeString += `, config: AxiosRequestConfig<${bodyParamsCode || 'any'}, ${interfaceName}>`
    }
  }
  return paramsCodeString
}

// 取到 params代码 解析出字段注释
function getParamsNote(paramsCode: string) {
  const paramsNote = paramsCode.split('\n').filter(el => el.includes(':'))
  const notlist = paramsNote.map(el => '* @param ' + el.trim().replace('?:', '').replace(':', ''))
  return notlist
}

// 转换 / .为下划线
function reviseModName(modName: string) {
  // exp: /api/v1/users  => api_v1_users
  // exp: api.v1.users => api_v1_users
  return modName.replace(/\//g, '.').replace(/^\./, '').replace(/\./g, '_')
}
