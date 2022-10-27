const updateDependency = require('./updateDependency');
const updateImports = require('./updateImports');

module.exports = async ({
  cwd,
  // 是否自动更新 package.json 中的 dependencies 的添加/删除，默认开启
  writePkg = true,
  // 是否开启 cleanup 模式，默认开启
  cleanup = true,
  // 默认转换 src 目录下的文件
  path = 'src',
}) => {
  // console.log({cwd, writePkg, cleanup, path})
  // 1. update package.json
  if (writePkg) {
    // TODO: 是否需要考虑兼容 monorepo 的 package.json，一般都是安装在根目录下的（要兼容的话，可设置 depth 处理下）
    await updateDependency({
      cwd,
    });
  }

  // 2. update import
  await updateImports({ cwd, cleanup, path });

  process.exit();
};
