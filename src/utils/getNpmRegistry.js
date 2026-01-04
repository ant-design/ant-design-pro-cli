const fetch = require('node-fetch');

const registryMap = {
  npmmirror: 'https://registry.npmmirror.com',
  npm: 'https://registry.npmjs.org',
};

/**
 * 并发请求多个 registry，返回最快响应的那个
 */
const getNpmRegistry = async () => {
  const timeout = 5000;

  const fetchWithTimeout = (url) =>
    Promise.race([
      fetch(url).then(() => url),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), timeout)
      ),
    ]);

  try {
    return await Promise.race(
      Object.values(registryMap).map((url) => fetchWithTimeout(url))
    );
  } catch {
    // 所有请求都失败或超时，使用 npm 官方
    return registryMap.npm;
  }
};

module.exports = getNpmRegistry;
