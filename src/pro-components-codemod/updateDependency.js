const PkgApi = require('./pkgApi');
const fetch = require('node-fetch');
const { CHILD_PACKAGES, PRO_PACKAGE } = require('./PACKAGE_CONSTANT');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const semver = require('semver');
const getNpmRegistry = require('../utils/getNpmRegistry');

const spinner = ora();

const fetchPkgVersion = async () => {
  spinner.start(`🚚  Start fetch ${chalk.green(PRO_PACKAGE)} version... `);
  const registryUrl = await getNpmRegistry();
  const data = await fetch(`${registryUrl}/${PRO_PACKAGE}`);
  spinner.succeed();

  if (data.status !== 200) {
    console.error(chalk.red('🤔 download error'));
    process.exit(1);
  }

  const {
    versions,
    'dist-tags': { latest },
  } = await data.json();
  
  const versionsList = Object.keys(versions);
  const maxMajor = semver.parse(latest).major;
  const uniqueVersions = [];

  for (const major in new Array(maxMajor + 1).fill(null)) {
    // 只保存每个大版本的最新版本
    const latestVersion = semver.maxSatisfying(versionsList, major);
    if (latestVersion) {
      uniqueVersions.push(latestVersion);
    }
  }

  return uniqueVersions;
};

const listVersions = async () => {
  const versions = await fetchPkgVersion();
  console.log(`\nAvailable versions for ${chalk.green(PRO_PACKAGE)}:\n`);
  versions.forEach((v, i) => {
    const isLatest = i === versions.length - 1;
    console.log(`  ${chalk.cyan(v)}${isLatest ? chalk.gray(' (latest)') : ''}`);
  });
  console.log(`\nUsage: pro pro-components-codemod --version <version>\n`);
};

const updateDependency = async ({ cwd, version: specifiedVersion }) => {
  const pkgApi = new PkgApi({
    cwd,
  });
  // remove child dependencies (e.g., @ant-design/pro-table, @ant-design/pro-layout)
  await pkgApi.removeDependency(CHILD_PACKAGES);

  // 支持非交互式模式：通过 --version 参数指定版本
  let version;
  if (specifiedVersion) {
    if (specifiedVersion === 'latest') {
      const versions = await fetchPkgVersion();
      version = versions[versions.length - 1]; // 最新版本
    } else {
      version = specifiedVersion;
    }
    console.log(`📦  Using ${chalk.green(PRO_PACKAGE)}@${chalk.cyan(version)}`);
  } else {
    // select @ant-design/pro-components version
    const versions = await fetchPkgVersion();
    const result = await inquirer.prompt([
      {
        name: 'version',
        type: 'list',
        message: `🐂  请选择 ${chalk.green(PRO_PACKAGE)} 的版本: `,
        choices: versions,
      },
    ]);
    version = result.version;
  }

  await pkgApi.addDependency(PRO_PACKAGE, version);
};

module.exports = updateDependency;
module.exports.listVersions = listVersions;
