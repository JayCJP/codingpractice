// transfrom.ts 根据 Mod.name进行过滤
import { StandardDataSource } from 'pont-engine'
/** 由于后端生成的 swagger 是个项目的接口，所以会包含一些我们不需要的模块
 * 所以 视情况我们 过滤出我们想要的接口模块 本项目用到的模块如下
  common
 */

// 从原数据中过滤我们所需要的接口模块
export default function transform(data: StandardDataSource) {
  const filterMods = [
    'common'
  ]
  // 取到所需要的 mods 和 baseClass
  const { mods, baseClasses } = filterModsAndBaseClass(filterMods, data)
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
