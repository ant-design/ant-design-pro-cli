const parser = require('@babel/parser');
const traverse = require('@babel/traverse');
const generate = require('@babel/generator');
const t = require('babel-types');

/**
 * 生成代码
 * @param {*} ast
 */
function generateCode(ast) {
  return generate.default(ast, {}).code;
}

const genMessage = ({ id, defaultMessage, values }, localeMap) => {
  if (id && localeMap[id]) {
    const message = localeMap[id];
    if (values) {
      console.log(`${id} - ${message} 不支持带逻辑的 values`);
      return defaultMessage || id;
    }
    return localeMap[id];
  }
  if (defaultMessage) {
    return defaultMessage;
  }
  return id;
};

/**
 * 替换文件中的 formatMessage
 * @param {*} ast
 * @param {*} localeMap
 */
const genAst = (ast, localeMap, filePath) => {
  traverse.default(ast, {
    enter(path) {
      if (filePath === 'config/config.ts') {
        if (
          path.isIdentifier({ name: 'locale' }) &&
          path.container.value.type === 'ObjectExpression'
        ) {
          // path.replaceWith(t.Identifier(''))
          path.parentPath.remove();
        }
      }

      if (path.isIdentifier({ name: 'useIntl' })) {
        if (path.parentPath.parentPath.type === 'VariableDeclarator') {
          path.parentPath.parentPath.remove();
        }
      }

      if (path.isImportDeclaration()) {
        const { specifiers } = path.node;
        if (path.node.specifiers) {
          path.node.specifiers = specifiers.filter(({ imported }) => {
            if (imported) {
              return (
                imported.name !== 'formatMessage' &&
                imported.name !== 'FormattedMessage' &&
                imported.name !== 'useIntl' &&
                imported.name !== 'SelectLang'
              );
            }
            return true;
          });
        }
        if (path.node.source.value === 'umi-plugin-react/locale') {
          path.remove();
          return;
        }
      }
      // 替换 formatMessage
      if (path.isIdentifier({ name: 'formatMessage' })) {
        const { arguments: formatMessageArguments } = path.container;
        if (!formatMessageArguments) {
          if (path.parentPath.parentPath.type === 'JSXAttribute') {
            path.parentPath.parentPath.remove();
            return;
          }
          if (path.parentPath.type === 'ObjectProperty') {
            if (path.parentPath.isRemove) {
              return;
            }
            path.parentPath.remove();
            path.parentPath.isRemove = true;
            return;
          }
          if (
            path.parentPath.type === 'MemberExpression' &&
            path.parentPath.container.type === 'CallExpression' &&
            path.parentPath.container.arguments
          ) {
            const { arguments: containerFormatMessageArguments } = path.parentPath.container;
            const params = {};

            containerFormatMessageArguments.forEach((node) => {
              node.properties.forEach((property) => {
                params[property.key.name] = property.value.value;
              });
            });
            const message = genMessage(params, localeMap);

            const container = path.parentPath.parentPath;

            if (message) {
              container.replaceWith(t.identifier(`'${message}'`));
            }
          }
          return;
        }
        const params = {};
        formatMessageArguments.forEach((node) => {
          node.properties.forEach((property) => {
            params[property.key.name] = property.value.value;
          });
        });

        const message = genMessage(params, localeMap);
        let container = path.parentPath;

        // JSXExpressionContainer = {}, 如果是 JSXExpressionContainer 一起删掉
        if (container.parentPath.type === 'JSXExpressionContainer') {
          container = path.parentPath.parentPath;
        }
        if (message) {
          // 如果是 <></> 类型不需要加string
          const isJSXElement = container.parentPath.type === 'JSXElement';
          if (!isJSXElement) {
            if (message.includes("'")) {
              container.replaceWithSourceString(`"${message}"`);
            } else {
              container.replaceWithSourceString(`'${message}'`);
            }
          } else {
            container.replaceWith(t.identifier(message));
          }
        }
      }

      // 替换 FormattedMessage
      if (path.isJSXIdentifier({ name: 'FormattedMessage' })) {
        const { attributes } = path.container;
        const params = {};
        attributes.forEach((node) => {
          if (node.value.value) {
            params[node.name.name] = node.value.value;
          } else {
            params[node.name.name] = node.value.expression;
          }
        });
        const message = genMessage(params, localeMap);
        let container = path.parentPath.parentPath;

        // 如果是 <></> 类型不需要加string
        // JSXExpressionContainer = {}
        if (container.parentPath.type === 'JSXExpressionContainer') {
          container = container.parentPath;
        }

        const isJSXElement = container.parentPath.type === 'JSXElement';
        if (message) {
          if (isJSXElement) {
            container.replaceWith(t.identifier(message));
          } else {
            container.replaceWithSourceString(`"${message}"`);
          }
        }
      }
      if (path.isJSXIdentifier({ name: 'data-lang' })) {
        // path.parentPath.parentPath.replaceWith(t.JSXOpeningElement(t.JSXIdentifier('span'), [t.JSXAttribute(t.JSXIdentifier('data-lang-tag'))], true));
        path.parentPath.parentPath.parentPath.remove();
      }

      if (path.isJSXIdentifier({ name: 'SelectLang' })) {
        // path.parentPath.replaceWith(t.JSXOpeningElement(t.JSXIdentifier('span'), [t.JSXAttribute(t.JSXIdentifier('data-lang-tag'))], true));
        path.parentPath.parentPath.remove();
      }

      if (path.node.source && path.node.source.value === 'umi' && !path.node.specifiers.length) {
        path.remove();
        return;
      }
    },
    CallExpression(p) {
      if (p.container && p.container.property && p.container.property.name === 'formatMessage') {
        const parent = p.parentPath;
        const { arguments: formatMessageArguments } = parent.container;
        // eslint-disable-next-line prefer-rest-params
        if (arguments && arguments.length) {
          const params = {};
          formatMessageArguments.forEach((node) => {
            node.properties.forEach((property) => {
              params[property.key.name] = property.value.value;
            });
          });
          const message = genMessage(params, localeMap);
          parent.parentPath.replaceWith(t.identifier(`'${message}'`));
        }
      }
    },
  });
};

module.exports = (code, localeMap, filePath) => {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript', 'dynamicImport', 'classProperties', 'decorators-legacy'],
  });
  genAst(ast, localeMap, filePath);
  return generateCode(ast);
};
