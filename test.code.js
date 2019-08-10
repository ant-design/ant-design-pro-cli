const puppeteer = require('puppeteer-core');
const childProcess = require('child_process');
const execa = require('execa');
const fetch = require('node-fetch');

const openChrome = () =>
  new Promise(async resolve => {
    const temp = await execa('mktemp', ['-d', '-t', 'chrome-remote_data_dir']);
    const tempFile = temp.stdout.toString();
    childProcess.spawn(
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      [
        '--remote-debugging-port=9222',
        '--no-first-run',
        '--debug-devtools',
        '--no-default-browser-check',
        `--user-data-dir=${tempFile}`,
      ],
      {
        stdio: 'inherit',
      },
    );
    setTimeout(async () => {
      const data = await fetch('http://localhost:9222/json/version').then(req => req.json());
      const { webSocketDebuggerUrl } = data;
      resolve(webSocketDebuggerUrl);
    }, 2000);
  });
const open = async () => {
  const webSocketDebuggerUrl = await openChrome();
  console.log(webSocketDebuggerUrl);
  try {
    const browser = await puppeteer.connect({
      browserWSEndpoint: webSocketDebuggerUrl,
    });
    const page = await browser.newPage();
    page.goto('https://www.baidu.com');
  } catch (error) {
    console.log(error);
  }
};

open();
