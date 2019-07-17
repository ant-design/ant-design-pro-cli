const BlinkDiff = require('blink-diff');

module.exports = (imageA, imageBPath, imageOutputPath) =>
  new Promise((resolve, reject) => {
    const diff = new BlinkDiff({
      imageA, // Use file-path
      imageBPath,
      thresholdType: BlinkDiff.THRESHOLD_PERCENT,
      threshold: 0.05, // 1% threshold
      imageOutputPath,
      hideShift: true,
    });

    diff.run((error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(diff.hasPassed(result.code));
      }
    });
  });
