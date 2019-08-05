// eslint-disable-next-line eslint-comments/disable-enable-pair
/* eslint-disable import/no-dynamic-require */
const path = require('path');
const { CLIEngine } = require('eslint');
const importCache = require('import-fresh');

const engine = new CLIEngine({
  fix: true,
  baseConfig: importCache(path.resolve(__dirname, '../../eslintrc.js')),
});

function eslintJS(content) {
  const report = engine.executeOnText(content);
  if (report.results[0].output) {
    return report.results[0].output;
  }
  return content;
}

module.exports = eslintJS;
