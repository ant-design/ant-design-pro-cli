const { transformFromAstSync, parseSync } = require('@babel/core');
const { parse, print } = require('recast');
const { CHILD_PACKAGES, PRO_PACKAGE } = require('./PACKAGE_CONSTANT');

const CommonParserOpts = {
  sourceType: 'module',
  plugins: ['jsx', 'typescript'],
};

const UpdateImportPlugin = (api, options) => {
  const { template, types } = api;
  const { cleanup } = options;

  const generateImportDeclarationAst = (localName) =>
    template.ast(`import { ${localName} } from '${PRO_PACKAGE}'`);

  return {
    visitor: {
      Program: {
        enter(path) {
          // 保存 comments ，traverse 处理完再保存到第一个 astNode 上
          const firstNode = path.node.body[0];
          const { leadingComments = [], innerComments = [], trailingComments = [] } = firstNode;

          /**
           * cleanup：提供两种 import 模式
           *  1. 全部合并到一条 import 语句导入
           *     import { ProTable, ProList} from '@ant-design/pro-components'
           *  2. 只更新子包的名称为 @ant-design/pro-components，保留旧项目的 import 方式
           *    import { ProTable } from '@ant-design/pro-components'
           *    import { ProList } from '@ant-design/pro-components'
           */
          if (cleanup) {
            const specifierSet = new Set();
            const namespaceSpecifierSet = new Set();
            // type import
            const typeSpecifierSet = new Set();
            const typeNamespaceSpecifierSet = new Set();
            path.traverse({
              ImportDeclaration(path) {
                const { node } = path;

                if (!node) return;

                const { importKind, source } = node;

                if (CHILD_PACKAGES.includes(source.value)) {
                  node.specifiers.forEach((spec) => {
                    // specifiers: ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier
                    const localName = spec.local.name;
                    const importType = importKind === 'type' || spec.importKind == 'type';

                    if (types.isImportSpecifier(spec)) {
                      const importedName = spec.imported.name;
                      const _localName =
                        importedName === localName ? localName : `${importedName} as ${localName}`;

                      importType ? typeSpecifierSet.add(_localName) : specifierSet.add(_localName);
                    } else if (types.isImportDefaultSpecifier(spec)) {
                      importType ? typeSpecifierSet.add(localName) : specifierSet.add(localName);
                    } else if (types.isImportNamespaceSpecifier(spec)) {
                      importType
                        ? typeNamespaceSpecifierSet.add(localName)
                        : namespaceSpecifierSet.add(localName);
                    }
                  });

                  path.remove();
                }
              },
            });

            if (namespaceSpecifierSet.size) {
              for (const namespaceSpecifier of namespaceSpecifierSet) {
                const ast = template.ast(`import * as ${namespaceSpecifier} from '${PRO_PACKAGE}'`);
                path.node.body.unshift(ast);
              }
            }

            if (specifierSet.size) {
              path.node.body.unshift(
                template.ast(
                  `import { ${Array.from(specifierSet).join(', ')} } from '${PRO_PACKAGE}'`,
                ),
              );
            }

            if (typeNamespaceSpecifierSet.size) {
              for (const namespaceSpecifier of typeNamespaceSpecifierSet) {
                path.node.body.unshift(
                  template.ast(
                    `import type * as ${namespaceSpecifier} from '${PRO_PACKAGE}'`,
                    CommonParserOpts,
                  ),
                );
              }
            }

            if (typeSpecifierSet.size) {
              path.node.body.unshift(
                template.ast(
                  `import type { ${Array.from(typeSpecifierSet).join(
                    ', ',
                  )} } from '${PRO_PACKAGE}'`,
                  CommonParserOpts,
                ),
              );
            }
          } else {
            path.traverse({
              ImportDeclaration(path) {
                const { node } = path;
                if (!node) return;

                const { source } = node;

                if (CHILD_PACKAGES.includes(source.value)) {
                  path.node.source.value = PRO_PACKAGE;

                  const { specifiers } = node;
                  const hasImportNamespaceSpecifier = specifiers.some((spec) =>
                    types.isImportNamespaceSpecifier(spec),
                  );

                  if (hasImportNamespaceSpecifier) {
                    // case: default import with namespace import
                    if (specifiers.length > 1) {
                      const localName = specifiers[0].local.name;
                      path.get(`specifiers.0`).remove();
                      path.insertAfter(generateImportDeclarationAst(localName));
                    }
                  } else {
                    specifiers.forEach((spec, index) => {
                      const specPath = path.get(`specifiers.${index}`);
                      // replace ImportDefaultSpecifier with importSpecifier
                      if (types.isImportDefaultSpecifier(spec)) {
                        specPath.replaceWith(types.importSpecifier(spec.local, spec.local));
                      }
                    });
                  }
                }
              },
            });
          }

          // 保留文件开头 leadingComments 的位置
          const firstNode2 = path.node.body[0];
          if (firstNode2 !== firstNode) {
            firstNode2.comments = [...leadingComments];
            firstNode.comments = [...innerComments, ...trailingComments];
          }
        },
      },
    },
  };
};

const transformImportProComponents = (sourceCode, options = {}) => {
  // 通过 recast 处理 ast，保证输出文件的代码风格和输入前保持一致
  const ast = parse(sourceCode, {
    parser: {
      parse: (source) => {
        const ast = parseSync(source, {
          parserOpts: {
            sourceType: 'module',
            plugins: ['jsx', 'typescript'],
            // recast uses this
            tokens: true,
          },
        });

        return ast;
      },
    },
  });

  const { ast: transformedAST } = transformFromAstSync(ast, sourceCode, {
    plugins: [[UpdateImportPlugin, options]],
    // allowing it to preserve formatting
    cloneInputAst: false,
    code: false,
    ast: true,
  });

  const { code } = print(transformedAST);

  return code;
};

module.exports = transformImportProComponents;
