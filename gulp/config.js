'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var gulpNgConfig = require('gulp-ng-config');

module.exports = function (options) {
    var env = gutil.env.env || 'development';
    gulp.task('config', function () {
        gulp.src('configFile.json')
            .pipe(gulpNgConfig('gliist', {
                createModule: false,
                environment: env
            }))
            .pipe(gulp.dest(options.src + '/app/'));
    });
};