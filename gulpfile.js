var gulp = require('gulp');
var nodemon = require('gulp-nodemon');
var livereload = require('gulp-livereload');
var config = require('./config.json');

gulp.task('develop', function () {
  livereload.listen();
  nodemon({
    script: 'bin/www',
    ext: 'js json css hbs',
  }).on('restart', function () {
    setTimeout(function () {
      livereload.changed(__dirname);
    }, 500);
  });
});

gulp.task('migrate', function () {
  var version = require('./db/version');
  console.log(version.error, version);
  if (version.error) {
    console.error(version.error);
  } else {
    version.migrate();
  }
});

gulp.task('default', [
  'migrate',
  config.task
]);

gulp.task('nomigrate', [
  config.task
]);
