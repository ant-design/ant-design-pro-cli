const { join } = require('path');
const { existsSync, readFileSync, writeFileSync } = require('fs');
const chalk = require('chalk');
const execa = require('execa');
const ora = require('ora');

const spinner = ora();

const LOCKFILES = {
  'pnpm-lock.yaml': 'pnpm',
  'yarn.lock': 'yarn',
  'package-lock.json': 'npm',
  'npm-shrinkwrap.json': 'npm',
};

// TODO: 使用 zx 安装依赖
const NPM_CLIENT_COMMANDS = {
  npm: {
    install: 'npm install',
    uninstall: 'npm uninstall',
  },
  pnpm: {
    install: 'pnpm add',
    uninstall: 'pnpm remove',
  },
  yarn: {
    install: 'yarn add',
    uninstall: 'yarn remove',
  },
};

/**
 * 操作 package.json 的工具类
 */
class PkgApi {
  constructor({ cwd } = {}) {
    this.cwd = cwd;
    this.pkgPath = join(cwd, 'package.json');

    if (!existsSync(this.pkgPath)) {
      console.error(chalk.red('🤔 package.json not found'));
      process.exit(1);
    }

    this.npmClient = this.getNpmClient();
    this.commands = NPM_CLIENT_COMMANDS[this.npmClient];
  }

  execCmd({ command, dependencies = [], isDev }) {
    execa.commandSync([command, ...dependencies, isDev ? '-D' : null].filter(Boolean).join(' '), {
      encoding: 'utf8',
      cwd: this.cwd,
      env: {
        ...process.env,
      },
      stderr: 'pipe',
      stdout: 'pipe',
    });
  }

  async removeDependency(dependency) {
    const dependencies = typeof dependency === 'string' ? [dependency] : [...dependency];
    const pkg = this.getPkg();

    if (pkg.dependencies) {
      const removeDependencies = {};

      for (const dep in pkg.dependencies) {
        if (dependencies.includes(dep)) {
          removeDependencies[dep] = pkg.dependencies[dep];
        }
      }

      const removeDependencyNames = Object.keys(removeDependencies);

      if (removeDependencyNames.length) {
        spinner.start(`🗑  ${this.commands['uninstall']} ${chalk.blueBright('dependencies')} `);
        this.execCmd({
          command: this.commands['uninstall'],
          dependencies: removeDependencyNames,
        });
        spinner.succeed();

        console.log(
          `\n${removeDependencyNames
            .map((name) => `${chalk.red('-')} ${name} ${chalk.gray(removeDependencies[name])}`)
            .join('\n')}\n`,
        );
      }
    }
  }

  async addDependency(name, version) {
    const command = this.commands['install'];

    spinner.start(`🚚  ${command} ${chalk.blueBright('dependencies')} `);
    this.execCmd({
      command,
      dependencies: [`${name}${version ? '@^' + version : ''}`],
    });
    spinner.succeed();

    console.log(`\n${chalk.green('+')} ${name} ${chalk.gray(version)} \n`);
  }

  getPkg() {
    return JSON.parse(readFileSync(this.pkgPath, 'utf-8'));
  }

  writePkg(pkg) {
    writeFileSync(this.pkgPath, JSON.stringify(pkg, null, 2), 'utf-8');
  }

  getNpmClient() {
    const pkg = this.getPkg();
    let client = null;

    // 1. 优先从 packageManager 获取 npm client
    if (pkg.packageManager) {
      const [name] = pkg.packageManager.split('@');

      if (name in NPM_CLIENT_COMMANDS) {
        client = name;
      }

      if (!client) {
        console.error(chalk.red(`Unknown packageManager: ${pkg.packageManager}`));
        process.exit(1);
      }
    }

    // 2. 通过 lockfiles 获取 npm client
    if (!client) {
      const lockfile = Object.keys(LOCKFILES).find((lockFilePath) =>
        existsSync(join(this.cwd, lockFilePath)),
      );

      if (lockfile) {
        client = LOCKFILES[lockfile];
      }
    }

    return client || 'npm';
  }
}

module.exports = PkgApi;
