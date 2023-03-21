const glob = require('glob');
const { join } = require('path');
const fs = require('fs');
const { winPath } = require('umi-utils');
const prettier = require('prettier');
const fabric = require('@umijs/fabric');
const ora = require('ora');

const getLocalFileList = require('./getLocalFileList');
const removeLocale = require('./removeLocale');
const formatRoute = require('./formatRoute')


const spinner = ora();

const globList = (patternList, options) => {
  let fileList = [];
  patternList.forEach(pattern => {
    fileList = [...fileList, ...glob.sync(pattern, options)];
  });

  return fileList;
};
const prettierCode = (code, filepath) =>
  prettier.format(code, {
    ...fabric.prettier,
    filepath,
  });

const getFileContent = path => fs.readFileSync(winPath(path), 'utf-8');

module.exports = ({ cwd, locale = 'zh-CN', write }) => {
  // 寻找项目下的所有 ts
  spinner.start('🕵️‍  find js or ts files');
  const tsFiles = globList(['**/*.tsx', '**/*.ts', '**/*.js', '**/*.jsx'], {
    cwd,
    ignore: ['**/*.d.ts', '**/dist/**', '**/public/**', '**/locales/**', '**/node_modules/**'],
  });
  spinner.succeed();

  if (!tsFiles || tsFiles.length < 1) {
    console.log('🎊 No files found');
    return;
  }

  spinner.start('📦  load all locale file and build ts ');
  // 获得 locale 的配置
  const localeMap = getLocalFileList(cwd, locale);
  spinner.succeed();

  spinner.start(`✂️  format routes`)
  formatRoute(localeMap, prettierCode)
  spinner.succeed();

  tsFiles.forEach(path => {
    const source = getFileContent(join(cwd, path));
    if (source.includes('formatMessage') || source.includes('FormattedMessage') || source.includes('SelectLang') || path === 'config/config.ts') {
      let content = removeLocale(source, localeMap, path);
      spinner.start(`✂️  remove locale for ${path}.`);

      if (write) {
        content = prettierCode(content, path);
        fs.writeFileSync(join(cwd, path), content, 'utf-8');
        spinner.succeed();
        return;
      }
      spinner.succeed();
    }
  });
};
