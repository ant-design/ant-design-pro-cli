# Cli for Ant Design Pro [![npm package](https://img.shields.io/npm/v/ant-design-pro-cli.svg)](https://www.npmjs.com/package/ant-design-pro-cli)

A simple CLI for Ant Design Pro projects.

## Feature

- Standard Ant Design Pro template.
- Interactive command line.
- Common pages & components & models & services template.

## Usage

### Installation

Prerequisites: [Node.js](https://nodejs.org/en/) (>=6.x, 8.x preferred), npm version 3+ and [Git](https://git-scm.com/).

```bash
$ npm install ant-design-pro-cli -g
```

### New a Ant Design Pro template

```bash
$ pro new // will download ant-design-pro in current directory
```

### Generate pages / components / models to project

```bash
$ cd your application
$ pro generate 
```

<img width="400" src="https://gw.alipayobjects.com/zos/rmsportal/VhiILFUpYxGUBgbnuUny.png" />

### Custom template 

Creating a directory named 'tpl' in your project's root path, and all file in this folder will can be choose in pro cli: 

<img width="300" src="https://user-images.githubusercontent.com/1179603/32481313-76601bc2-c358-11e7-8513-15bc5f29c59b.gif" />

### CHANGELOG

#### 0.2.2

- change the command
  - support shorthand of command
    - pro new -> pro n
    - pro generate -> pro g
  - support custom file template

#### 0.2.1

- change the command
  - new -> generate
  - init -> new

#### 0.2.0 `deprecated`

- change the command
  - new -> generate
  - init -> new

#### 0.1.5

- change the command
  - init -> `new a Ant Design Pro scaffold`
  - new -> `generate templates`

