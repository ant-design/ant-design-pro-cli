const fetch = require('node-fetch');

const registryMap = {
  npmmirror: 'https://registry.npmmirror.com',
  npm: 'https://registry.npmjs.org',
};

/**
 * 并发请求多个 registry，返回最快响应的那个
 */
const getNpmRegistry = async () => {
  return new Promise((resolve) => {
    Object.keys(registryMap).forEach(async (key) => {
      try {
        await fetch(registryMap[key], { timeout: 5000 });
        resolve(registryMap[key]);
      } catch {
        // ignore
      }
    });

    // 5秒后如果都没响应，默认使用 npm 官方
    setTimeout(() => {
      resolve(registryMap.npm);
    }, 5000);
  });
};

module.exports = getNpmRegistry;
