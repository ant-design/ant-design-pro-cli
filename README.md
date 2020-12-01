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

## Options for the screenshot command

- --path 区块的路径，可以用于只截图一个
- --mobile 使用手机大小的屏幕进行截图

## Options for the i18n-remove command

- --locale 设置语言
- --write 是否写入文件

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

- pro screenshot 
- pro screenshot --path DashboardWorkplace
- pro screenshot --mobile 
### i18n-remove

- pro i18n-remove --write

- pro i18n-remove --locale en-US --write

### fetch-blocks

- pro fetch-blocks
