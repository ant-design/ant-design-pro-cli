const PkgApi = require('./pkgApi');
const fetch = require('node-fetch');
const { CHILD_PACKAGES, PRO_PACKAGE } = require('./PACKAGE_CONSTANT');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const semver = require('semver');
const getNpmRegistry = require('getnpmregistry');

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

module.exports = async ({ cwd }) => {
  const pkgApi = new PkgApi({
    cwd,
  });
  // remove child dependencies (e.g., @ant-design/pro-table, @ant-design/pro-layout)
  await pkgApi.removeDependency(CHILD_PACKAGES);

  // select @ant-design/pro-components version
  const versions = await fetchPkgVersion();
  const { version } = await inquirer.prompt([
    {
      name: 'version',
      type: 'list',
      message: `🐂  请选择 ${chalk.green(PRO_PACKAGE)} 的版本: `,
      choices: versions,
    },
  ]);

  await pkgApi.addDependency(PRO_PACKAGE, version);
};
