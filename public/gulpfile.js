var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var clean = require('gulp-clean');
var transport = require('gulp-seajs-transport');

gulp.task('default', ['transportformaroco'], function() {
    return gulp.src([
            'js/vendor/json2.js',
            'js/vendor/sea.js', //2.3.0
            'js/vendor/seajs-text.js',
            'js/vendor/seajs-css.js',
            'js/vendor/jquery.min.js',
            //dot 考虑使用reactor
            'js/vendor/doT.min.js',
            'js/vendor/underscore-min.js', //1.8.3
            'js/vendor/jquery.cookie.min.js',
            //position drag drop sortable继续留用或找其他方案
            'js/vendor/jqueryui/jquery.ui.core.min.js',
            'js/vendor/jqueryui/jquery.ui.widget.min.js',
            'js/vendor/jqueryui/jquery.ui.mouse.min.js',
            'js/vendor/jqueryui/jquery.ui.position.min.js',
            //UI menu + notify
            'js/sea.config.js',
            'temp/js/ui/menu.js',
            'temp/js/ui/notify.js',
            'temp/js/ui/ui.js'
            //下面可精简
            //'js/vendor/jqueryui/jquery.ui.draggable.min.js', //notify.js 使用，19K 可精简
            //'js/vendor/jqueryui/jquery.ui.sortable.min.js' //table.js 使用，这货居然24K，算法肯定不咋的
        ])
        .pipe(concat('maroco.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./'));
});
gulp.task("transportformaroco", function() {
    return gulp.src("./js/ui/*.js", {
            base: './'
        })
        .pipe(transport())
        .pipe(uglify())
        .pipe(gulp.dest("./temp"));
});
/*
var newId = parseId(options.relative ? options.relative+file.relative : file.relative)
调用的时候用.pipe(transport({relative:'js/ui/'}))
 */
gulp.task("backup", function() {
    return gulp.src("./js/ui/*.*")
        .pipe(gulp.dest("./js/_ui"));
});
gulp.task("transport", ['backup'], function() {
    return gulp.src("./js/ui/*.js", {
            base: './'
        })
        .pipe(transport())
        .pipe(uglify())
        .pipe(gulp.dest("./"));
});

gulp.task("clean",function() {
    return gulp.src("./temp/*",{read:false})
        .pipe(clean());
});
