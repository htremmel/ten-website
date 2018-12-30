var ngannotate = require('gulp-ng-annotate');

var gulp = require('gulp'),
    minifycss = require('gulp-minify-css'),
    jshint = require('gulp-jshint'),
    stylish = require('jshint-stylish'),
    uglify = require('gulp-uglify'),
    usemin = require('gulp-usemin'),
    imagemin = require('gulp-imagemin'),
    rename = require('gulp-rename'),
    concat = require('gulp-concat'),
    notify = require('gulp-notify'),
    cache = require('gulp-cache'),
   changed = require('gulp-changed'),
    rev = require('gulp-rev'),
    browserSync = require('browser-sync'),
    php = require('gulp-connect-php'),
    sass = require('gulp-sass'),
    del = require('del');
    

gulp.task('jshint', function() {
  return gulp
    .src('src/scripts/**/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter(stylish))
    .pipe(gulp.dest('./dist/scripts/'));
});

// Clean
gulp.task('clean', function() {
  return del(['dist', '../json-server/public'], { force: true });
});

// Default task
gulp.task('default', ['clean'], function() {
  gulp.start('usemin', 'imagemin', 'fonts', 'sass');
});

gulp.task('sass', function () {
    return gulp.src('./src/styles/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(gulp.dest('./dist/styles/'));
});

gulp.task('usemin', ['jshint'], function() {
  return gulp
    .src('./src/**/*.html')
    .pipe(
      usemin({
        css: [minifycss(), rev()],
        js: [ngannotate(), rev()]
      })
    )

    .pipe(gulp.dest('dist/'));
});

// Images
gulp.task('imagemin', function() {
  return (
    del(['dist/images']),
    gulp
      .src('src/images/**/*')
      .pipe(
        cache(
          imagemin({
            cache: false,
            optimizationLevel: 3,
            progressive: true,
            interlaced: true
          })
        )
      )
      .pipe(gulp.dest('dist/images'))
      .pipe(
        notify({
          message: 'Images task complete'
        })
      )
      .pipe(gulp.dest('../json-server/public/images'))
  );
});

gulp.task('fonts', function() {
    gulp
        .src('./bower_components/font-awesome/fonts/**/*.{ttf,woff,eof,svg}*')
        .pipe(gulp.dest('./dist/fonts'));
    gulp
        .src('./bower_components/bootstrap/dist/fonts/**/*.{ttf,woff,eof,svg}*')
        .pipe(gulp.dest('./dist/fonts'))
        .pipe(gulp.dest('../json-server/public/fonts'));
    gulp
        .src('./src/fonts/**/*.{ttf,woff,eof,svg}*')
        .pipe(gulp.dest('./dist/fonts/'));
});

// Watch
gulp.task('watch', ['sync'], function() {
  // Watch .js files
  gulp.watch(
    '{./src/style/**/*.scss, src/views/**/*.html,src/scripts/**/*.js,src/styles/**/*.css,src/**/*.html}',
    ['usemin']
  );
  // Watch image files
  gulp.watch('src/images/**/*', ['imagemin']);
});

gulp.task('supervise', function() {
  gulp.watch(
    '{src/views/**/*.html,src/scripts/**/*.js,src/styles/**/*.css,src/**/*.html}',
    ['usemin']
  );
  gulp.watch('src/images/**/*', ['imagemin']);
});

gulp.task('sync', ['default'], function() {
  var files = [
    'src/**/*.html',
    'src/styles/**/*.css',
    'src/images/**/*.png',
    'src/scripts/**/*.js',
    'src/views/**/*.html',
    'dist/**/*'
  ];

  browserSync.init(files, {
    server: {
      baseDir: 'dist',
      index: 'index.html'
    },
    reloadDelay: 500
  });
  // Watch any files in dist/, reload on change
  gulp.watch(['dist/**']).on('change', browserSync.reload);
});
