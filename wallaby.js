var babel = require('babel-core');
var wallabyWebpack = require('wallaby-webpack');
var webpack = require('webpack');

var webpackPostprocessor = wallabyWebpack({
    entryPatterns: [
        'src/**/*.spec.js'
    ],
    module: {
    }
});

module.exports = function () {
    return {
        files: [
            {pattern: 'src/**/*.ts', load: false},
            {pattern: 'src/**/*.spec.ts', ignore: true},
            {pattern: 'node_modules/**/*.js', ignore: true, instrument: false}
        ],
        tests: [
            {pattern: 'src/**/*.spec.ts', load: false},
            {pattern: 'node_modules/**/*.js', ignore: true, instrument: false}
        ],
        preprocessors: {
            '**/*.js': file => babel.transform(file.content, {sourceMap: true})
        },
        'testFramework': 'jasmine',
        postprocessor: webpackPostprocessor,
        bootstrap: function () {
            window.__moduleBundler.loadTests();
        }
    };
};

