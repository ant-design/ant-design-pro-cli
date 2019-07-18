#!/usr/bin/env node

const yParser = require('yargs-parser');
const semver = require('semver');
const { existsSync } = require('fs');
const { join } = require('path');
const chalk = require('chalk');

// print version and @local
const args = yParser(process.argv.slice(2));

if (args.v || args.version) {
  // eslint-disable-next-line global-require
  console.log(require('./package').version);
  if (existsSync(join(__dirname, '.local'))) {
    console.log(chalk.cyan('@local'));
  }
  process.exit(0);
}

if (!semver.satisfies(process.version, '>= 8.0.0')) {
  console.error(chalk.red('✘ The generator will only work with Node v8.0.0 and up!'));
  process.exit(1);
}
const cwd = process.cwd();

const option = args._[0];

switch (option) {
  case 'screenshot':
    // eslint-disable-next-line global-require
    require('./src/screenshot/index')({ cwd, ...args });
    break;
  case 'i18n-remove':
    // eslint-disable-next-line global-require
    require('./src/i18n/index')({ cwd, ...args });
    break;
  case 'fetch-blocks':
    // eslint-disable-next-line global-require
    require('./src/fetch-blocks/index')({ cwd, ...args });
    break;
  default:
    if (args.h || args.help) {
      const details = `
      Commands:
        ${chalk.cyan('screenshot ')}     对区块进行截图
        ${chalk.cyan('i18n-remove')}     从项目中移除国际化
        ${chalk.cyan('fetch-blocks')}    下载 pro 所有的官方区块
      
      Options for the ${chalk.cyan('screenshot')} command:
        ${chalk.green('--path              ')} 区块的路径，可以用于只截图一个
          
      Options for the ${chalk.cyan('i18n-remove')} command:
        ${chalk.green('--locale            ')} 设置语言
        ${chalk.green('--write            ')}  是否写入文件
      
      Examples:
        ${chalk.gray('pro')}
        pro -h

        ${chalk.gray('screenshot')}
        pro screenshot 
        pro screenshot --path DashboardWorkplace
      
        ${chalk.gray('i18n-remove')}
        pro i18n-remove --write

        pro i18n-remove --locale en-US --write
      
        ${chalk.gray('fetch-blocks')}
        pro fetch-blocks

        `.trim();
      console.log(details);
    }
    break;
}
