const { spawn } = require('child_process');
const { join } = require('path');
const fs = require('fs');
const chalk = require('chalk');
const getNpmRegistry = require('getnpmregistry');
const execa = require('execa');
const PNGImage = require('pngjs-image');
const { kill } = require('cross-port-killer');
const ora = require('ora');

const getBrowser = require('./getBrowser');

const portAvailable = require('./portAvailable');
const diffPng = require('./diff');

const spinner = ora();

const env = Object.create(process.env);
env.BROWSER = 'none';
env.PORT = process.env.PORT || '2144';
env.TEST = true;
env.COMPRESS = 'none';
env.PROGRESS = 'none';
env.BLOCK_PAGES_LAYOUT = 'blankLayout';

let browser;

let diffFile = [];

/**
 * 启动区块服务
 * @param {string} path
 */
const startServer = async path => {
  let once = false;
  return new Promise(resolve => {
    env.PAGES_PATH = `${path}/src`;

    const server = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'start'], {
      env,
    });
    server.stdout.on('data', data => {
      // hack code , wait umi
      if (!once && data.toString().indexOf('Compiled successfully') >= 0) {
        once = true;
        resolve(server);
      }
    });
    server.on('exit', () => {
      kill(env.PORT || 8000);
    });
  });
};

const autoScroll = page =>
  page.evaluate(
    () =>
      new Promise(resolve => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          const { scrollHeight } = document.body;
          window.scrollBy(0, distance);
          totalHeight += distance;
          if (totalHeight >= scrollHeight) {
            clearInterval(timer);
            resolve();
          }
        }, 100);
      }),
  );

const setFontFamily = page => {
  page.evaluate(
    () =>
      new Promise(resolve => {
        const link = document.createElement('style');
        link.href = 'https://fonts.googleapis.com/css?family=Space+Mono&display=swap';
        link.rel = 'stylesheet';
        const style = document.createElement('style');
        const textNode = document.createTextNode(`
          *{
            font-family: 'Space Mono', monospace !important; 
          }
        `);
        style.appendChild(textNode);
        link.onload = () => {
          resolve();
        };
        document.head.appendChild(link);
        document.head.appendChild(style);
      }),
  );
};

const readPng = path =>
  new Promise((resolve, reject) => {
    PNGImage.readImage(path, (error, image) => {
      if (error) {
        reject(error);
      }
      resolve(image);
    });
  });

const screenshot = async ({ page, path, diff, index, total, mobile }) => {
  try {
    const isAvailable = await portAvailable(8000);
    if (!isAvailable) {
      kill(env.PORT || 8000);
    }
  } catch (error) {
    console.log(error);
  }

  spinner.start(`🚀  start server  (${index + 1}/${total})`);
  const server = await startServer(path);
  spinner.succeed();

  await page.goto(`http://127.0.0.1:${env.PORT}`);

  await page.setViewport({
    width: mobile ? 375 : 1440,
    height: mobile ? 667 : 800,
  });

  spinner.start(`💄  set style (${index + 1}/${total})`);
  await autoScroll(page);
  await setFontFamily(page);
  spinner.succeed();

  const imagePath = join(path, 'snapshot.png');
  let png = null;
  // if diff read file
  if (diff) {
    png = await readPng(imagePath);
  }

  spinner.start(`📷  snapshot block image  (${index + 1}/${total})`);

  await page.screenshot({
    path: imagePath,
    fullPage: true,
  });
  spinner.succeed();

  if (diff) {
    const diffPngPath = join(path, 'diff.png');
    spinner.start(`👀  diff ${imagePath}`);
    const isDiff = await diffPng(png, imagePath, diffPngPath);
    if (!isDiff) {
      diffFile.push(path);
    }
    spinner.succeed();
  }
  server.kill();
};

const openBrowser = async () => {
  browser = await getBrowser();
  const page = await browser.newPage();
  return page;
};

/**
 * 取得所有区块
 */
const getAllFile = async (cwd, filePath) => {
  const files = fs.readdirSync(cwd);

  return files.filter(path => {
    const itemPath = join(cwd, path);
    const stat = fs.statSync(itemPath);
    if (path.includes('.') || path.includes('_') || path.includes('node_modules')) {
      return false;
    }
    // 支持单独的 文件夹
    if (filePath && !filePath.toLowerCase().includes(path.toLowerCase())) {
      return false;
    }
    if (stat.isDirectory()) {
      const havePackage = fs.existsSync(join(itemPath, 'package.json'));

      if (havePackage) {
        return true;
      }
    }
    return false;
  });
};

module.exports = async ({ cwd, diff, path, mobile }) => {
  diffFile = [];
  spinner.start('🔍  Get block');
  const dirList = await getAllFile(cwd, path);
  spinner.succeed();

  const total = dirList.length;
  spinner.start('🌏  Start puppeteer');
  const registry = await getNpmRegistry();
  const page = await openBrowser();
  spinner.succeed();

  const loopGetImage = async index => {
    try {
      spinner.start(`📦  Install ${dirList[index]} dependencies`);
      await execa('yarn', ['install', `--registry=${registry}`, '--force'], {
        cwd: join(cwd, `./${dirList[index]}`),
      });
      spinner.succeed();

      await screenshot({
        page,
        path: dirList[index],
        diff,
        index,
        total,
        mobile,
      });

      if (dirList.length > index && dirList[index + 1]) {
        return loopGetImage(index + 1);
      }
    } catch (error) {
      console.log(error);
    }
    return Promise.resolve(true);
  };
  await loopGetImage(0);

  if (diffFile.length > 0) {
    console.log(`End of diff, ${diffFile.length} failed.`);
    console.log(chalk.red(diffFile.join('\n')));
  }

  browser.close();
  return diffFile;
};
