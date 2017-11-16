const program = require('commander');
const path = require('path');
const fs = require('fs-extra');
const cwd = process.cwd();
const chalk = require('chalk');
const exec = require('child_process').exec;
const portfinder = require('portfinder');
const isWindows = require('is-windows');

module.exports = function (args) {

  console.log('under construction.');
  return;

  const port = args[3] || '';

  // 1. 创建临时文件夹
  const tempDir = path.join(cwd, './_ant_design_editor');
  const boilerplateDir = path.join(__dirname, '../editor');

  process.on('exit', function () {
  });

  process.on('SIGINT', function () {

    fs.removeSync(tempDir);

    program.runningCommand && program.runningCommand.kill('SIGKILL');
    process.exit(0);
  });

  fs.ensureDirSync(tempDir);

  // 2. 移动模板到当前目录
  fs.copySync(boilerplateDir, tempDir, { overwrite: true });

  // 4. package.json
  const pkg = (port) => `{
  "name": "ant-design-editor",
  "scripts": {
    "start": "${isWindows() ? `cross-env PORT=${port}` : `PORT=${port}`} ../node_modules/.bin/roadhog server",
    "build": "../node_modules/.bin/roadhog build"
  },
  "dependencies": {},
  "devDependencies": {}
}`;

  portfinder.getPort(function (err, port) {

    fs.writeFileSync(path.join(tempDir, './package.json'), pkg(port), 'utf-8');

    // 5. 启动 roadhog
    exec('cd _ant_design_editor && npm start', function (err, stdout, stderr) {
      if (err) {
        throw new Error(err);
      } else {
        console.log(stdout);
      }
    });
  });
};
