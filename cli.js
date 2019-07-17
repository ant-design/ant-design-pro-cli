#!/usr/bin/env node

const yParser = require('yargs-parser');
const semver = require('semver');
const { existsSync } = require('fs');
const { join } = require('path');
const chalk = require('chalk');
const screenshot = require('./src/screenshot/index');
const i18n = require('./src/i18n/index');
const fetchBlocks = require('./src/fetch-blocks/index');

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
    screenshot({ cwd, ...args });
    break;
  case 'i18n-remove':
    i18n({ cwd, ...args });
    break;
  case 'fetch-blocks':
    fetchBlocks({ cwd, ...args });
    break;
  default:
    break;
}
