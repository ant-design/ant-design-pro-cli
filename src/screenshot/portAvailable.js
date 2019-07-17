const net = require('net');

/**
 * 判断端口是否空闲
 * 如果返回true，端口空闲
 * 返回false 端口被占用
 */
module.exports = async port =>
  new Promise(resolve => {
    // 创建服务并监听该端口
    const server = net.createServer().listen(port);
    server.on('listening', () => {
      // 执行这块代码说明端口未被占用
      server.close();
      resolve(true);
    });

    server.on('error', err => {
      if (err.code === 'EADDRINUSE') {
        // 端口已经被使用
        resolve(false);
      }
    });
  });
