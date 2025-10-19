module.exports = function (config) {
  config.set({
    logLevel: config.LOG_INFO,
    frameworks: ['jasmine'],
    files: [
      { pattern: 'test/test-runner.js', watched: false }, // único entry
    ],
    preprocessors: {
      'test/test-runner.js': ['esbuild'],
    },
    esbuild: {
      jsx: 'automatic',
      jsxImportSource: 'react',
      sourcemap: 'inline',
      target: 'es2018',
      loader: { '.css': 'text', '.svg': 'dataurl', '.png': 'dataurl', '.jpg': 'dataurl' },
    },
    reporters: ['progress', 'kjhtml', 'coverage'],
    coverageReporter: { dir: 'coverage', reporters: [{ type: 'html' }, { type: 'text-summary' }] },
    browsers: ['ChromeHeadless'],
    singleRun: false,
    client: { clearContext: false },
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-esbuild'),
      require('karma-coverage'),
      require('karma-jasmine-html-reporter'),
    ],
  });
};
