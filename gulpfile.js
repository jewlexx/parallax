const gulp = require('gulp');
const path = require('path');

const autoprefixer = require('autoprefixer');
const browserify = require('browserify');
const browsersync = require('browser-sync').create();
const buffer = require('vinyl-buffer');
const notifier = require('node-notifier');
const rename = require('gulp-rename');
const rimraf = require('rimraf');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');

gulp.task('clean', (cb) => {
  rimraf('./dist', cb);
});

gulp.task('build', ['clean'], () => {
  gulp.start('build:js');
});

function showError(arg) {
  notifier.notify({
    title: 'Error',
    message: '' + arg,
    sound: 'Basso',
  });
  console.log(arg);
  this.emit('end');
}

gulp.task('build:js', () => {
  return browserify({
    entries: path.join('src', 'parallax.js'),
    debug: false,
    standalone: 'Parallax',
  })
    .transform('babelify', { presets: ['es2015'] })
    .bundle()
    .on('error', showError)
    .pipe(source('parallax.js'))
    .pipe(buffer())
    .pipe(gulp.dest('dist'))
    .pipe(rename('parallax.min.js'))
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(uglify())
    .on('error', showError)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('dist'))
    .pipe(browsersync.stream({ match: path.join('**', '*.js') }));
});

gulp.task('watch', ['build'], () => {
  browsersync.init({
    notify: false,
    port: 9000,
    server: {
      baseDir: [
        path.join('examples', 'pages'),
        path.join('examples', 'assets'),
        'dist',
      ],
      directory: true,
    },
  });
  gulp.watch(path.join('src', '*.js'), ['build:js']);
  gulp.watch(path.join('examples', 'pages', '*.html'), browsersync.reload);
});

gulp.task('default', ['watch']);
