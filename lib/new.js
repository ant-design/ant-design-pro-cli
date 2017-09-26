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
    message: 'witch path do you want to create template to ? (default is current directory ./): ',
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
    message: 'what do you want to add ?',
    choices: [
      'pages',
      'components',
      'model',
    ],
  }];

  inquirer.prompt(questions).then(function (answers) {
    switch (answers.type) {
      case 'pages':
        page();
        break;
      case 'components':
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
    message: 'which type of page do you want to add add?',
    choices: Object.keys(PageMap),
  }];

  inquirer.prompt(questions).then(function (answers) {
    const filePath = PageMap[answers.pageType];
    const fileName = filePath.replace(/.*\//, '');

    if (!PageMap) {
      console.log(chalk.red('none of this type'));
      return;
    }

    setTargetPath(function (target) {
      // js
      try {
        fs.copySync(path.join(boilerplateDir, filePath + '.js'), path.join(target, fileName + '.js'), { overwrite: true });
        console.log(chalk.green(`add success：${path.join(target, fileName + '.js')}`));
      } catch (e) {
      }

      // css
      try {
        fs.copySync(path.join(boilerplateDir, filePath + '.less'), path.join(target, fileName + '.less'), { overwrite: true });
        console.log(chalk.green(`add success：${path.join(target, fileName + '.less')}`));
      } catch (e) {
      }
    });

  });
}

function component() {
  const questions = [{
    type: 'list',
    name: 'type',
    message: 'which type of component do you want to add add?',
    choices: [
      'normal',
      'stateless',
    ],
  }];

  inquirer.prompt(questions).then(function (a1) {
    const q = [{
      type: 'input',
      name: 'name',
      message: 'component name: ',
    }];

    inquirer.prompt(q).then(function (a2) {
      setTargetPath(function(target) {

        const cPath = path.join(target, `./${a2.name}`);

        fs.ensureDirSync(target);
        fs.copySync(path.join(boilerplateDir, `./component/${a1.type}.js`), `${cPath}/index.js`, { overwrite: true });
        fs.copySync(path.join(boilerplateDir, './component/index.less'), `${cPath}/index.less`, { overwrite: true });

        console.log(chalk.green(`add component ${a2.name} success：${cPath}`));
      });
    });
  });
}

function model() {
  const questions = [{
    type: 'input',
    name: 'name',
    message: 'model name:',
  }];

  inquirer.prompt(questions).then(function (answers) {

    const name = answers.name;

    setTargetPath(function (target) {
      try {
        fs.writeFileSync(`${target}/${name}.js`, template.model({ name: name }), 'utf8');
        console.log(chalk.green(`add model ${name} success：${path.join(target, name + '.js')}.`));
      } catch (e) {
        console.log(chalk.red(`add model ${name} fail.`, e));
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
      console.log(chalk.red('none of this type'));
      normal();
      break;
  }

};
