const { CLIEngine } = require('eslint');
const { strictEslint } = require('@umijs/fabric');

const engine = new CLIEngine({
  fix: true,
  baseConfig: strictEslint,
});

function eslintJS(content) {
  const report = engine.executeOnText(content);
  if (report.results[0].output) {
    return report.results[0].output;
  }
  return content;
}

module.exports = eslintJS;
