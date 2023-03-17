const glob = require('glob');
const ora = require('ora');
const { winPath } = require('umi-utils');
const { join, relative } = require('path');
const chalk = require('chalk');
const { readFileSync, writeFileSync } = require('fs');
const transformImportProComponents = require('./transform');
const { CHILD_PACKAGES, PRO_PACKAGE } = require('./PACKAGE_CONSTANT');

const spinner = ora();

const getFileList = (cwd, path) => {
  const _cwd = winPath(join(cwd, path));

  const files = glob.sync('**/*.{ts,tsx,js,jsx}', {
    cwd: _cwd,
    ignore: ['**/node_modules/**', '**/dist/**', '**/public/**'],
  });

  return files.map((filePath) => join(_cwd, filePath));
};

module.exports = async ({ cwd, path, cleanup }) => {
  if (typeof path !== 'string') {
    console.log(`🙈 ${chalk.yellow('Please input a string type of path')} `);
    process.exit(1);
  }

  spinner.start('🕵️‍  Find files that need updating');
  const files = getFileList(cwd, path);
  spinner.succeed();

  if (!files || files.length === 0) {
    console.log(`🎊 ${chalk.red('No files found')}`);
    process.exit(1);
  }

  // 记录转换文件的个数
  let total = 0;

  spinner.start(`🚀  Start update ${chalk.green(PRO_PACKAGE)} import `);
  files.forEach((filePath) => {
    const source = readFileSync(filePath, 'utf-8');

    if (source && CHILD_PACKAGES.some((pkgName) => source.includes(pkgName))) {
      total += 1;
      console.log(chalk.green(`${total == 1 ? '\n' : ''}[${total}] Transform ${relative(cwd, filePath)}`));
      const code = transformImportProComponents(source, {
        cleanup,
      });

      writeFileSync(filePath, code, 'utf-8');
    }
  });

  spinner.succeed();

  console.log(`
    👌  ${chalk.green.bold(total)} files transform success
  `);
};
