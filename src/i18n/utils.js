
const fs = require('fs')
const path = require('path')

function winPath (path) {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path);
  if (isExtendedLengthPath) {
    return path;
  }

  return path.replace(/\\/g, '/');
}
  
/**
 * @description
 * - `'javascript'`: try to match the file with extname `.{ts(x)|js(x)}`
 * - `'css'`: try to match the file with extname `.{less|sass|scss|stylus|css}`
 */

const extsMap = {
  javascript: ['.ts', '.tsx', '.js', '.jsx'],
  css: ['.less', '.sass', '.scss', '.stylus', '.css'],
}

/**
 * Try to match the exact extname of the file in a specific directory.
 * @returns
 * - matched: `{ path: string; filename: string }`
 * - otherwise: `null`
 */
function getFile(opts) {
  const exts = extsMap[opts.type];
  for (const ext of exts) {
    const filename = `${opts.fileNameWithoutExt}${ext}`;
    const absolutePath = winPath(path.join(opts.base, filename));
    if (fs.existsSync(absolutePath)) {
      return {
        absolutePath,
        filename,
      };
    }
  }
  return null;
}

module.exports = {
  getFile,
  winPath
}
