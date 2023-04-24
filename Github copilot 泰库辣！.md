# Github copilot 泰库辣！
使用 OpenAI Codex 实现AI智能提示代码或生成代码片段，支持绝大部分的变成语言。[官网](https://github.com/features/copilot/)

## vscode 插件

1. Github Copilot `AI智能提示`
2. Github Copilot Labs `集成工具`

## Github Copilot 使用技巧

### 快捷键
1. 按 tab 选择提示的内容
2. 按 alt + [ 或者 ] 选择建议的 上一个下一个
3. 按 ctrl + enter 帮你生成10个建议

### 用注释唤起 copilot 使用技巧
简单示例一下不至于此，大胆发挥你的想象力
```javascript
// 生成一个输出10-20的随机数函数
function random(){
  return Math.floor(Math.random() * 10 + 10);
}
```


## Github Copilot labs 使用技巧
一个集成了 GitHub copilot 的工具

1. 翻译代码 直接输出描述介绍 方便快速理解代码片段
2. 编程语言转换 如 ts -> python
3. 优化代码 健壮性 可读性 逐行注释 
3. debug 自动添加 log 修复可能出错的地方
4. 拆分代码 自动提取封装代码
5. 最后可以自定义要求 copilot 