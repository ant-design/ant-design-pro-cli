const path = require('path');
const chalk = require('chalk');
const fs = require('fs-extra');
const inquirer = require('inquirer');
const ora = require('ora');
const download = require('download-git-repo');
const exists = require('fs').existsSync;

const cwd = process.cwd();
const origin = 'ant-design/test2';

module.exports = function() {

  const questions = [{
    type: 'input',
    name: 'name',
    message: 'input project name:',
  }, {
    type: 'input',
    name: 'path',
    message: 'witch directory do you want to init to ? (default is current directory ./):',
  }];

  inquirer.prompt(questions).then(function (answers) {

    const projectName = answers.name || 'ant-design-pro-template';
    const targetPath = path.join(cwd, answers.path || './');

    if (exists(path.join(targetPath, projectName))) {
      console.log(chalk.red('exit: template is already exists'));
      return;
    }

    const spinner = ora('downloading template...');
    spinner.start();

    download(origin, path.join(targetPath, projectName), { clone: false }, function (err) {
      spinner.stop();
      if (err) {
        console.log(chalk.red(`Failed to download repo https://github.com/${origin}`, err));
      } else {
        console.log(chalk.green(`Success to download repo https://github.com/${origin} to ${targetPath}`));
      }
    })
  });
};
