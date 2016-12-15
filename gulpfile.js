const gulp = require('gulp');
const args = require('yargs').argv;
let $ = require('gulp-load-plugins')({lazy: true});
const config = require('./gulp.config')

const log = (msg)=>{
  if(typeof(msg) === 'object'){
    for (let item in msg) {
      if (msg.hasOwnProperty(item)) {
        $.util.log($.util.colors.cyan(msg[item]));
      }
    }
  } else{
    $.util.log($.util.colors.cyan(msg));
  }
};

gulp.task('vet',()=>{
  log('Analyzing source with JSHint and JSCS');
  return gulp.src(config.alljs)
  .pipe($.if(args.verbose,$.print()))
  .pipe($.jscs())
  .pipe($.jshint())
  .pipe($.jshint.reporter('jshint-stylish', {verbose:true}))
  .pipe($.jshint.reporter('fail'));
});

