var gulp = require('gulp');
var plumber = require('gulp-plumber');
var nodemon = require('gulp-nodemon');
var livereload = require('gulp-livereload');
var less = require('gulp-less');

var path = require('path');
var config = require('./config.json');
var LessPluginCleanCSS = require('less-plugin-clean-css');
var cleancss = new LessPluginCleanCSS({ advanced: true });

gulp.task('less', function () {
  gulp.src('./less/*.less')
    .pipe(plumber())
    .pipe(less({
      plugins: [cleancss],
      paths: [
        path.join(__dirname, 'less', 'include'),
        path.join(__dirname, 'less', 'bootstrap')
      ]
    }))
    .pipe(gulp.dest('./public/css'));
});

gulp.task('develop', function () {
  livereload.listen();
  nodemon({
    script: 'bin/www',
    ext: 'js json less hbs',
  }).on('restart', function () {
    setTimeout(function () {
      livereload.changed(__dirname);
    }, 500);
  });
  gulp.watch([path.join(__dirname, 'less', '**', '*.less')], ['less']);
});

gulp.task('migrate', function () {
  var version = require('./db/version');
  if (version.error) {
    console.error(version.error);
  } else {
    version.migrate();
  }
});

gulp.task('default', [
  'less',
  'migrate',
  config.task
]);

gulp.task('nomigrate', [
  config.task
]);
