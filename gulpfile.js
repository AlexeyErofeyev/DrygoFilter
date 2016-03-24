var gulp        = require('gulp'),
	  stylus      = require('gulp-stylus'),
    autoprefixer = require('gulp-autoprefixer'),
    browserSync = require('browser-sync').create(); 


gulp.task('html',function() {
  gulp.src('./vendor/index.html')
      .pipe(gulp.dest('./app/'));
});

gulp.task('js',function() {
  gulp.src('./vendor/js/main.js')
      .pipe(gulp.dest('./app/js/'));
});

gulp.task('stylus', function () {
  gulp.src('./vendor/css/*.styl')
    .pipe(stylus())
    .pipe(autoprefixer({browsers: ['last 2 versions']}))
    .pipe(gulp.dest('./app/css'));
});


gulp.task('watch',function () {

  browserSync.init({
        server: "./app",
        port:9000
    });

	gulp.watch([
		'./vendor/index.html',
		'./vendor/css/*.styl',
    './vendor/js/main.js'
		]).on('change',function() {
            gulp.run('html');
            gulp.run('stylus');
            gulp.run('js');
            gulp.run(browserSync.reload);
        });
});



gulp.task('default',['html','stylus','js','watch']);