# Cli for Ant Design Pro

## Install

```shell
npm i @ant-design/pro-cli
# or
yarn add @ant-design/pro-cli
```

## Commands

- screenshot 对区块进行截图
- i18n-remove 从项目中移除国际化
- fetch-blocks 下载 pro 所有的官方区块
- pro-components-codemod 自动更新 @ant-design/pro-components 的 import 方式

## Options for the screenshot command

- --path 区块的路径，可以用于只截图一个
- --mobile 使用手机大小的屏幕进行截图

## Options for the i18n-remove command

- --locale 设置语言
- --write 是否写入文件

## Options for the pro-components-codemod command

- --writePkg 是否自动更新 package.json 中的 dependencies 的添加/删除，默认开启
- --cleanup 是否开启 cleanup 模式，默认开启
- --path 需要更新文件的目录，默认 src 目录下的文件

## debug

### bash

```bash
DEBUG=pro-cli pro XXX
```

### PowerShell

```powershell
$env:DEBUG="pro-cli"
pro xxx
```

### CMD

```cmd
set DEBUG=pro-cli
pro xxx
```

## Examples

### pro

pro -h

### screenshot

- pro screenshot 对所有区块进行截图
- pro screenshot --path DashboardWorkplace 对单个区块进行截图
- pro screenshot --mobile 对所有区块进行截图
- pro screenshot --dumi 使用 dumi 构建的资产，支持手机模式

### i18n-remove

- pro i18n-remove --write

- pro i18n-remove --locale en-US --write

### fetch-blocks

- pro fetch-blocks

### pro-components-codemod

- pro pro-components-codemod  自动更新 package.json 中的 dependencies 的添加/删除，并将导入模块全部合并到一条 import 语句导入
- pro pro-components-codemod --writePkg 0 不处理 package.json 中的 dependencies 的添加/删除，只进行 import 导入方式的更新
- pro pro-components-codemod --path packages 处理 packages 目录下的文件
- pro pro-components-codemod --cleanup 0 只更新子包的名称为 @ant-design/pro-components，保留旧项目的 import 方式
