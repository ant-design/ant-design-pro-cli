const path = require("path");
const chalk = require("chalk");
const fs = require("fs-extra");
const exists = require("fs").existsSync;
const format = require("prettier-eslint");

const cwd = process.cwd();

module.exports = function(args) {
  const file = args[3];
  if (!file) {
    console.log(
      chalk.yellow("Need to appoint a javascript file path: `pro p ./test.js`")
    );
  }

  let eslintConfig;
  try {
    eslintConfig = fs.readJsonSync(path.join(cwd, "./.eslintrc"));
  } catch (e) {
    try {
      eslintConfig = fs.readJsonSync(path.join(cwd, "./.eslintrc.json"));
    } catch (e) {
      throw new Error(
        "no found .eslintrc[.json], please run `pro p` in project root path."
      );
    }
  }

  const source = fs.readFileSync(path.join(cwd, file), "utf8");

  const options = {
    text: source,
    eslintConfig,
    prettierOptions: {
      bracketSpacing: true
    },
    fallbackPrettierOptions: {
      singleQuote: true
    }
  };

  const formattedCode = format(options);

  fs.writeFileSync(path.join(cwd, file), formattedCode, "utf8");

  console.log(chalk.green("Format file success :)"));
};
