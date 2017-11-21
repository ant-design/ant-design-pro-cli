const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const exists = require('fs').existsSync;
const inquirer = require('inquirer');

const template = require('./template.js');
const config = require('./config.js');

const cwd = process.cwd();
const boilerplateDir = path.join(__dirname, '../boilerplate');

const PageMap = config.PageMap;

function getPath() {
  if (exists(path.join(cwd, './package.json'))) {
    return 'root';
  }
  if (exists(path.join(cwd, './components'))) {
    return 'src';
  }
  return '';
}

function setTargetPath(callback, type) {

  function q() {
    const questions = [{
      type: 'input',
      name: 'target',
      message: 'which path do you want to create template to ? (default is current directory ./): ',
    }];

    inquirer.prompt(questions).then(function (answers) {
      if (callback) {
        callback(path.join(cwd, answers.target || './'));
      }
    });
  }

  const currentPath = getPath();

  if (currentPath === 'root' && type) {

    try {
      switch (type) {
        case 'page':
          callback(path.join(cwd, './src/routes/'));
          break;
        case 'component':
          callback(path.join(cwd, './src/components/'));
          break;
        case 'model':
          callback(path.join(cwd, './src/models/'));
          break;
        case 'service':
          callback(path.join(cwd, './src/services/'));
          break;
        default:
          break;
      }
    } catch (e) {
      q();
    }

  } else if (currentPath === 'src' && type) {

    try {
      switch (type) {
        case 'page':
          callback(path.join(cwd, './routes/'));
          break;
        case 'component':
          callback(path.join(cwd, './components/'));
          break;
        case 'model':
          callback(path.join(cwd, './models/'));
          break;
        case 'service':
          callback(path.join(cwd, './services/'));
          break;
        default:
          break;
      }
    } catch (e) {
      q();
    }

  } else {
    q();
  }
}

function normal() {
  const questions = [{
    type: 'list',
    name: 'type',
    message: 'what do you want to generate ?',
    choices: [
      'page',
      'component',
      'model',
      'service',
      'custom',
    ],
  }];

  inquirer.prompt(questions).then(function (answers) {
    switch (answers.type) {
      case 'page':
        page();
        break;
      case 'component':
        component();
        break;
      case 'model':
        model();
        break;
      case 'service':
        service();
        break;
      case 'custom':
        custom();
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
    message: 'which type of page do you want to generate?',
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
        console.log(chalk.green(`generated success：${path.join(target, fileName + '.js')}`));
      } catch (e) {
      }

      // css
      try {
        fs.copySync(path.join(boilerplateDir, filePath + '.less'), path.join(target, fileName + '.less'), { overwrite: true });
        console.log(chalk.green(`generated success：${path.join(target, fileName + '.less')}`));
      } catch (e) {
      }
    }, 'page');

  });
}

function component() {
  const questions = [{
    type: 'list',
    name: 'type',
    message: 'which type of component do you want to generate ?',
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
      setTargetPath(function (target) {

        const cPath = path.join(target, `./${a2.name}`);

        fs.ensureDirSync(target);
        fs.copySync(path.join(boilerplateDir, `./component/${a1.type}.js`), `${cPath}/index.js`, { overwrite: true });
        fs.copySync(path.join(boilerplateDir, './component/index.less'), `${cPath}/index.less`, { overwrite: true });

        console.log(chalk.green(`generated component ${a2.name} success：${cPath}`));
      }, 'component');
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
        console.log(chalk.green(`generated model ${name} success：${path.join(target, name + '.js')}`));
      } catch (e) {
        console.log(chalk.red(`generated model ${name} fail`, e));
      }
    }, 'model');
  });
}

function service() {
  const questions = [{
    type: 'input',
    name: 'name',
    message: 'service name:',
  }];

  inquirer.prompt(questions).then(function (answers) {

    const name = answers.name;

    setTargetPath(function (target) {
      try {
        fs.writeFileSync(`${target}/${name}.js`, template.service({ name: name }), 'utf8');
        console.log(chalk.green(`generated service ${name} success：${path.join(target, name + '.js')}`));
      } catch (e) {
        console.log(chalk.red(`generated service ${name} fail`, e));
      }
    }, 'service');
  });
}

function custom() {
  const folder = path.join(cwd, './tpl/');
  const tplMap = [];

  fs.readdirSync(folder).forEach(file => {
    tplMap.push(file);
  })

  const questions = [{
    type: 'list',
    name: 'file',
    message: 'which type of custom template do you want to generate?',
    choices: tplMap,
  }];

  inquirer.prompt(questions).then(function (answers) {

    const fileName = answers.file;
    let prefix = fileName.match(/(\.[^\.]*)$/)[1];

    const q_name = [{
      type: 'input',
      name: 'name',
      message: 'file name:',
    }];

    inquirer.prompt(q_name).then(function (s_answers) {

      const newFileName = s_answers.name;

      const hasPrefix = newFileName.match(/(\.[^\.]*)$/)[1];
      if (hasPrefix) {
        prefix = '';
      }

      setTargetPath(function (target) {
        // css
        try {
          fs.copySync(path.join(folder, fileName), path.join(target, newFileName + prefix), { overwrite: true });
          console.log(chalk.green(`generated success：${path.join(target, newFileName + prefix)}`));
        } catch (e) {
        }
      });

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
    case 'service':
      service();
      break;
    case 'custom':
      custom();
      break;
    default:
      console.log(chalk.red('none of this type'));
      normal();
      break;
  }

};
