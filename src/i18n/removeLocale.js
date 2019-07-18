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
const genAst = (ast, localeMap) => {
  traverse.default(ast, {
    enter(path) {
      // 删除  import { formatMessage } from 'umi-plugin-react/locale';
      if (path.isImportDeclaration()) {
        const { specifiers } = path.node;
        if (path.node.specifiers) {
          // 如果有 getLocale 和 setLocale 就不删除
          const item = specifiers.find(
            ({ imported }) =>
              imported && (imported.name === 'getLocale' || imported.name === 'setLocale'),
          );
          if (item) {
            path.node.specifiers = specifiers.filter(({ imported }) => {
              if (imported) {
                return imported.name !== 'formatMessage' && imported.name !== 'FormattedMessage';
              }
              return true;
            });
            return;
          }
        }
        if (path.node.source.value === 'umi-plugin-react/locale') {
          path.remove();
        }
      }

      // 替换 formatMessage
      if (path.isIdentifier({ name: 'formatMessage' })) {
        const { arguments: formatMessageArguments } = path.container;
        if (!formatMessageArguments) {
          // <ProLayout
          //  footerRender={footerRender}
          //  menuDataRender={menuDataRender}
          //  formatMessage={formatMessage}
          // >
          //   {children}
          // </ProLayout>
          if (path.parentPath.parentPath.type === 'JSXAttribute') {
            path.parentPath.parentPath.remove();
            return;
          }

          // title={getPageTitle({
          //   pathname: location.pathname,
          //   breadcrumb,
          //   formatMessage,
          //   ...props,
          // })}
          if (path.parentPath.type === 'ObjectProperty') {
            if (path.parentPath.isRemove) {
              return;
            }
            path.parentPath.remove();
            // eslint-disable-next-line no-param-reassign
            path.parentPath.isRemove = true;
            return;
          }
          return;
        }
        const params = {};
        formatMessageArguments.forEach(node => {
          node.properties.forEach(property => {
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
        attributes.forEach(node => {
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
    },
  });
};

module.exports = (code, localeMap) => {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript', 'dynamicImport', 'classProperties', 'decorators-legacy'],
  });
  genAst(ast, localeMap);
  return generateCode(ast);
};
