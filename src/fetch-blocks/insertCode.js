const parser = require('@babel/parser');
const traverse = require('@babel/traverse');
const generate = require('@babel/generator');
const fs = require('fs');
const path = require('path');
const prettier = require('prettier');
const chalk = require('chalk');
const ora = require('ora');

const spinner = ora();

const parseCode = code =>
  parser.parse(code, {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  }).program.body[0];

/**
 * 生成代码
 * @param {*} ast
 */
function generateCode(ast) {
  const newCode = generate.default(ast, {}).code;
  return prettier.format(newCode, {
    // format same as ant-design-pro
    singleQuote: true,
    trailingComma: 'es5',
    printWidth: 100,
    parser: 'typescript',
  });
}

const SettingCodeString = `
  <SettingDrawer
    settings={settings}
    onSettingChange={config =>
    dispatch({
        type: 'settings/changeSetting',
        payload: config,
    })
    }
  />
`;

const mapAst = (configPath, callBack) => {
  const ast = parser.parse(fs.readFileSync(configPath, 'utf-8'), {
    sourceType: 'module',
    plugins: ['typescript', 'jsx'],
  });
  // 查询当前配置文件是否导出 routes 属性
  traverse.default(ast, {
    Program({ node }) {
      const { body } = node;
      callBack(body);
    },
  });
  return generateCode(ast);
};

const insertBasicLayout = configPath =>
  mapAst(configPath, configBody => {
    configBody.findIndex(item => item.type !== 'ImportDeclaration');

    configBody.forEach(item => {
      // 从包中导出 SettingDrawer
      if (item.type === 'ImportDeclaration') {
        if (item.source.value === '@ant-design/pro-layout') {
          item.specifiers.push(parseCode('SettingDrawer').expression);
        }
      }
      if (item.type === 'VariableDeclaration') {
        const {
          id,
          init: { body },
        } = item.declarations[0];
        // 给 BasicLayout 中插入 button 和 设置抽屉
        if (id.name === 'BasicLayout') {
          body.body.forEach(node => {
            if (node.type === 'ReturnStatement') {
              const JSXFragment = parseCode('<></>').expression;
              JSXFragment.children.push({ ...node.argument });
              JSXFragment.children.push(parseCode(SettingCodeString).expression);
              node.argument = JSXFragment;
            }
          });
        }
      }
    });
  });

const insertBlankLayout = configPath =>
  mapAst(configPath, body => {
    const index = body.findIndex(item => item.type !== 'ImportDeclaration');
    // 从组件中导入 CopyBlock
    body.splice(
      index,
      0,
      parseCode(`import CopyBlock from '@/components/CopyBlock';
    `),
    );
    body.forEach(item => {
      if (item.type === 'VariableDeclaration') {
        const { id, init } = item.declarations[0];
        // 给 BasicLayout 中插入 button 和 设置抽屉
        if (id.name === 'Layout') {
          const JSXFragment = parseCode('<></>').expression;
          JSXFragment.children.push({ ...init.body });
          JSXFragment.children.push(parseCode('<CopyBlock id={Date.now()}/>').expression);
          init.body = JSXFragment;
        }
      }
    });
  });

const insertRightContent = configPath =>
  mapAst(configPath, body => {
    const codeIndex = body.findIndex(item => item.type !== 'ImportDeclaration');
    // 从组件中导入 CopyBlock
    body.splice(codeIndex, 0, parseCode('import NoticeIconView from "./NoticeIconView";'));

    body.forEach(item => {
      if (item.type === 'VariableDeclaration') {
        const classBody = item.declarations[0].init.body;
        classBody.body.forEach(node => {
          if (node.type === 'ReturnStatement') {
            const index = node.argument.children.findIndex(argumentItem => {
              if (argumentItem.type === 'JSXElement') {
                if (argumentItem.openingElement.name.name === 'Avatar') {
                  return true;
                }
              }
              return undefined;
            });
            node.argument.children.splice(index, 1, parseCode('<Avatar menu />').expression);
            node.argument.children.splice(index, 0, parseCode('<NoticeIconView />').expression);
          }
        });
      }
    });
  });

const getJsxOrTsx = (cwd, fileName) => {
  let filePath = path.join(cwd, fileName);
  if (!fs.existsSync(filePath)) {
    filePath = path.join(cwd, fileName.replace('.tsx', '.jsx'));
  }
  return filePath;
};

module.exports = cwd => {
  spinner.start(`🎁  insert ${chalk.hex('#1890ff')('BasicLayout')} success`);
  const basicLayoutPath = getJsxOrTsx(cwd, '/src/layouts/BasicLayout.tsx');
  if (fs.existsSync(basicLayoutPath)) {
    fs.writeFileSync(basicLayoutPath, insertBasicLayout(basicLayoutPath));
  }
  spinner.succeed();

  spinner.start(`🎁  insert ${chalk.hex('#1890ff')('RightContent')} success`);
  const rightContentPath = getJsxOrTsx(cwd, '/src/components/GlobalHeader/RightContent.tsx');
  if (fs.existsSync(rightContentPath)) {
    fs.writeFileSync(rightContentPath, insertRightContent(rightContentPath));
  }
  spinner.succeed();

  spinner.start(`🎁  insert ${chalk.hex('#1890ff')('blankLayoutPath')} success`);
  const blankLayoutPath = getJsxOrTsx(cwd, '/src/layouts/BlankLayout.tsx');
  if (fs.existsSync(blankLayoutPath)) {
    fs.writeFileSync(blankLayoutPath, insertBlankLayout(blankLayoutPath));
  }
  spinner.succeed();
};
