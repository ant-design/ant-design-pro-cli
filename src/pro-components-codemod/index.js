const updateDependency = require('./updateDependency');
const updateImports = require('./updateImports');
const { listVersions } = require('./updateDependency');

module.exports = async ({
  cwd,
  // 是否自动更新 package.json 中的 dependencies 的添加/删除，默认开启
  writePkg = true,
  // 是否开启 cleanup 模式，默认开启
  cleanup = true,
  // 默认转换 src 目录下的文件
  path = 'src',
  // 指定 pro-components 版本（非交互式模式）
  version,
  // 列出可用版本
  listVersions: shouldListVersions,
}) => {
  // 仅列出可用版本
  if (shouldListVersions) {
    await listVersions();
    process.exit(0);
  }

  // console.log({cwd, writePkg, cleanup, path})
  // 1. update package.json
  if (writePkg) {
    // TODO: 是否需要考虑兼容 monorepo 的 package.json，一般都是安装在根目录下的（要兼容的话，可设置 depth 处理下）
    await updateDependency({
      cwd,
      version,
    });
  }

  // 2. update import
  await updateImports({ cwd, cleanup, path });

  process.exit();
};
