const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const mkdirp = require('mkdirp');
const yeoman = require('yeoman-environment');

const runGenerator = async (generatorPath, { name = '', cwd = process.cwd(), ...args }) => {
  return new Promise((resolve) => {
    if (name) {
      mkdirp.sync(name);
      // eslint-disable-next-line no-param-reassign
      cwd = path.join(cwd, name);
    }

    const Generator = require(generatorPath);
    const env = yeoman.createEnv([], {
      cwd,
    });
    const generator = new Generator({
      name,
      env,
      resolved: require.resolve(generatorPath),
      args,
    });

    return generator.run(() => {
      console.log('✨ File Generate Done');
      resolve(true);
    });
  });
};

const run = async (config) => {
  try {
    return runGenerator(`./generators/ant-design-pro`, config);
  } catch (e) {
    console.error(chalk.red(`> Generate failed`), e);
    process.exit(1);
  }
};

module.exports = run;
