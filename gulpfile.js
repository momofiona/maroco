var gulp = require('gulp');
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');

gulp.task('default', function() {
    return gulp.src([
            'public/js/vendor/json2.js',
            'public/js/vendor/sea.js',
            'public/js/vendor/seajs-text.js',
            'public/js/vendor/seajs-css.js',
            'public/js/vendor/jquery.min.js',
            //dot 考虑使用reactor
            'public/js/vendor/doT.min.js',
            'public/js/vendor/underscore-min.js',
            'public/js/vendor/jquery.cookie.min.js',
            //UI menu + notify
            'public/js/ui/menu.js',
            //position drag drop sortable继续留用或找其他方案
            'public/js/vendor/jqueryui/jquery.ui.core.min.js',
            'public/js/vendor/jqueryui/jquery.ui.widget.min.js',
            'public/js/vendor/jqueryui/jquery.ui.mouse.min.js',
            'public/js/vendor/jqueryui/jquery.ui.position.min.js',
            //下面可精简
            'public/js/vendor/jqueryui/jquery.ui.draggable.min.js', //notify.js 使用，19K 可精简
            'public/js/vendor/jqueryui/jquery.ui.sortable.min.js' //table.js 使用，这货居然24K，算法肯定不咋的
        ])
        .pipe(concat('public/maroco.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('public'));
});
