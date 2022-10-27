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

const screenshot = async (props) => {
  // eslint-disable-next-line global-require
  await require('./src/screenshot/index')(props);
  process.exit(0);
};

const screenshotDumi = async (props) => {
  // eslint-disable-next-line global-require
  await require('./src/screenshot/dumi')(props);
  process.exit(0);
};

switch (option) {
  case 'screenshot':
    if (args.dumi) {
      screenshotDumi({ cwd, ...args });
    } else {
      screenshot({ cwd, ...args });
    }
    break;
  case 'i18n-remove':
    // eslint-disable-next-line global-require
    require('./src/i18n/index')({ cwd, ...args });
    break;
  case 'fetch-blocks':
    // eslint-disable-next-line global-require
    require('./src/fetch-blocks/index')({ cwd, ...args });
    break;
  case 'create':
    const name = args._[1] || '';
    // eslint-disable-next-line global-require
    require('./src/create/index')({ cwd, name, ...args });
    break;
  case 'pro-components-codemod':
    // eslint-disable-next-line global-require
    require('./src/pro-components-codemod/index')({ cwd, ...args });
    break;
  default:
    if (args.h || args.help) {
      const details = `
      Commands:
        ${chalk.cyan('screenshot ')}     对区块进行截图
        ${chalk.cyan('i18n-remove')}     从项目中移除国际化
        ${chalk.cyan('fetch-blocks')}    下载 pro 所有的官方区块
        ${chalk.cyan('pro-components-codemod')}    自动更新 pro-components 的 import 方式
      
      Options for the ${chalk.cyan('screenshot')} command:
        ${chalk.green('--path              ')} 区块的路径，可以用于只截图一个
        ${chalk.green('--mobile              ')} 使用手机大小的屏幕进行截图
      
      Options for the ${chalk.cyan('i18n-remove')} command:
        ${chalk.green('--locale            ')} 设置语言
        ${chalk.green('--write            ')}  是否写入文件

      Options for the ${chalk.cyan('pro-components-codemod')} command:
        ${chalk.green('--writePkg          ')} 是否更新 package.json 中的 dependencies
        ${chalk.green('--path          ')}     更新 pro-components import 的路径
        ${chalk.green('--cleanup          ')}  是否开启 cleanup 模式，多个 import 合并为 单个 import
      
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

        ${chalk.gray('fetch-blocks')}
        pro create demo_path

        ${chalk.gray('pro-components-codemod')}
        pro pro-components-codemod --writePkg
        pro pro-components-codemod --path src --cleanup

        `.trim();
      console.log(details);
    }
    break;
}
