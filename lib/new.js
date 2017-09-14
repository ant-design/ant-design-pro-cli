const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const inquirer = require('inquirer');

const template = require('./template.js');
const config = require('./config.js');

const cwd = process.cwd();
const boilerplateDir = path.join(__dirname, '../boilerplate');

const PageMap = config.PageMap;

function setTargetPath(callback) {
  const questions = [{
    type: 'input',
    name: 'target',
    message: '创建模板的相对路径（默认为当前目录）',
  }];

  inquirer.prompt(questions).then(function (answers) {
    if (callback) {
      callback(path.join(cwd, answers.target || './'));
    }
  });
}

function normal() {
  const questions = [{
    type: 'list',
    name: 'type',
    message: '请问需要增加什么内容？',
    choices: [
      '页面模板',
      '组件模板',
      'model',
    ],
  }];

  inquirer.prompt(questions).then(function (answers) {
    switch (answers.type) {
      case '页面模板':
        page();
        break;
      case '组件模板':
        component();
        break;
      case 'model':
        model();
        break;
      default:
        break;
    }
  });
}

function page() {
  const questions = [{
    type: 'list',
    name: 'pageType',
    message: '请问需要增加什么类型的页面？',
    choices: Object.keys(PageMap),
  }];

  inquirer.prompt(questions).then(function (answers) {
    const filePath = PageMap[answers.pageType];
    const fileName = filePath.replace(/.*\//, '');

    if (!PageMap) {
      console.log(chalk.red('没有此类型'));
      return;
    }

    setTargetPath(function (target) {
      // js
      try {
        fs.copySync(path.join(boilerplateDir, filePath + '.js'), path.join(target, fileName + '.js'), { overwrite: true });
        console.log(chalk.green(`创建模板文件成功：${path.join(target, fileName + '.js')}`));
      } catch (e) {
        console.log(e);
      }

      // css
      try {
        fs.copySync(path.join(boilerplateDir, filePath + '.less'), path.join(target, fileName + '.less'), { overwrite: true });
        console.log(chalk.green(`创建模板文件成功：${path.join(target, fileName + '.less')}`));
      } catch (e) {
        console.log(e);
      }
    });

  });
}

function component() {
  console.log('component');
}

function model() {
  const questions = [{
    type: 'input',
    name: 'name',
    message: '新增的 model 名称',
  }];

  inquirer.prompt(questions).then(function (answers) {

    const name = answers.name;

    setTargetPath(function (target) {
      try {
        fs.writeFileSync(`${target}/${name}.js`, template.model({ name: name }), 'utf8');
        console.log(chalk.green(`创建 model ${name} 文件成功：${path.join(target, name + '.js')}`));
      } catch (e) {
        console.log(chalk.red(`创建 model ${name} 失败`, e));
      }
    });
  });
}

module.exports = function (args) {
  const name = args[3];
  if (!name) {
    normal();
    return;
  }

  switch (name) {
    case 'page':
      page();
      break;
    case 'component':
      component();
      break;
    case 'model':
      model();
      break;
    default:
      console.log(chalk.red('没有此类型'));
      normal();
      break;
  }

};
