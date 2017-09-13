const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const inquirer = require('inquirer');

const cwd = process.cwd();
const boilerplateDir = path.join(__dirname, '../boilerplate');

const PageMap = {
  "空页面": './layouts/BlankLayout',
  "Dashboard 监控页": './routes/Dashboard/Monitor',
  "基础表单页": './routes/Forms/BasicForm',
};

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
    ],
  }];

  inquirer.prompt(questions).then(function (answers) {
    if (answers.type === '页面模板') {
      page();
    } else {
      component();
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

module.exports = function (args) {

  const name = args[3];
  if (!name) {
    normal();
    return;
  }

  if (name === 'page') {
    page();
  } else if (name === 'component') {
    component();
  } else {
    console.log(chalk.red('没有此类型'));
    normal();
  }

};
