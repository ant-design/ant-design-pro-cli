const babel = require('@babel/core');

module.exports = filePath => {
  const { code } = babel.transformFileSync(filePath, {
    presets: [
      [
        require.resolve('@babel/env'),
        {
          targets: {
            node: true,
          },
        },
      ],
      require.resolve('@babel/preset-typescript'),
    ],
  });
  return code;
};
