const { spawn } = require('child_process');
const { join } = require('path');
const fs = require('fs');
const chalk = require('chalk');
const PNGImage = require('pngjs-image');
const { kill } = require('cross-port-killer');
const ora = require('ora');

const getBrowser = require('./getBrowser');

const portAvailable = require('./portAvailable');
const diffPng = require('./diff');

const spinner = ora();

const env = Object.create(process.env);
env.BROWSER = 'none';
env.PORT = process.env.PORT || '8000';
env.TEST = true;
env.COMPRESS = 'none';
env.PROGRESS = 'none';
env.BLOCK_PAGES_LAYOUT = 'blankLayout';

let browser;

let diffFile = [];

/**
 * 启动区块服务
 */
const startServer = async () => {
  let once = false;
  return new Promise(resolve => {
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

const screenshot = async ({ page, routesList, diff, mobile, out }) => {
  try {
    const isAvailable = await portAvailable(8000);
    if (!isAvailable) {
      kill(env.PORT || 8000);
    }
  } catch (error) {
    console.log(error);
  }
  let outPath = out || `${process.cwd()}/screenshot/`;

  if (!fs.existsSync(outPath)) {
    spinner.start(`🐆  create outPath`);
    await fs.mkdirSync(outPath);
    spinner.succeed();
  }
  spinner.start(`🚀  start server`);
  const server = await startServer();
  spinner.succeed();
  // /~demos/card-demo
  const loopGetImage = async index => {
    try {
      const route = routesList[index];
      await page.goto(`http://127.0.0.1:${env.PORT}/~demos/${route}`);

      await page.setViewport({
        width: mobile ? 375 : 1440,
        height: mobile ? 667 : 800,
      });

      spinner.start(`💄  set style (${route})`);
      await autoScroll(page);
      await setFontFamily(page);
      spinner.succeed();

      const imagePath = join(outPath, `${route}.png`);
      let png = null;
      // if diff read file
      if (diff) {
        try {
          png = await readPng(imagePath);
        } catch (error) {
          diff = false;
        }
      }

      spinner.start(`📷  snapshot block image  (${route})`);

      await page.screenshot({
        path: imagePath,
        fullPage: true,
      });
      spinner.succeed();

      if (diff) {
        const diffPngPath = join(outPath, `${route}-diff.png`);
        spinner.start(`👀  diff ${imagePath}`);
        const isDiff = await diffPng(png, imagePath, diffPngPath);
        if (!isDiff) {
          diffFile.push(path);
        }
        spinner.succeed();
      }

      if (routesList.length > index && routesList[index + 1]) {
        return loopGetImage(index + 1);
      }
    } catch (error) {
      console.log(error);
    }
    return Promise.resolve(true);
  };
  await loopGetImage(0);
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
  let assetsJson;
  if (filePath) {
    assetsJson = filePath;
  } else if (fs.existsSync(join(cwd, 'assets.json'))) {
    assetsJson = join(cwd, 'assets.json')
  } else {
    console.error('no find the dumi assets json.');
    console.log('Please try to execute: dumi assets!');
    return;
  }
  const data = JSON.parse(fs.readFileSync(assetsJson, 'utf-8') || '[]')
  let examples = [];
  if (data && data.assets && data.assets.examples) {
    examples = data.assets.examples;
  }
  return (examples).map(demo => demo.identifier);
};

module.exports = async ({ cwd, diff, path, mobile, out }) => {
  diffFile = [];
  spinner.start('🔍  Get block');
  const routesList = await getAllFile(cwd, path);
  spinner.succeed();

  spinner.start('🌏  Start puppeteer');
  const page = await openBrowser();
  spinner.succeed();
  await screenshot({
    page,
    routesList,
    diff,
    mobile,
    out
  });

  if (diffFile.length > 0) {
    console.log(`End of diff, ${diffFile.length} failed.`);
    console.log(chalk.red(diffFile.join('\n')));
  }

  browser.close();
  return diffFile;
};
