const gulp = require('gulp');
const args = require('yargs').argv;
let $ = require('gulp-load-plugins')({lazy: true});
const config = require('./gulp.config');
const del = require('del');

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
  return gulp.src(config().alljs)
  .pipe($.if(args.verbose,$.print()))
  .pipe($.jscs())
  .pipe($.jshint())
  .pipe($.jshint.reporter('jshint-stylish', {verbose:true}))
  .pipe($.jshint.reporter('fail'));
});

gulp.task('styles',['clean-styles'],()=>{
  log('Compiling Less --> CSS');
  return gulp
            .src(config().less)
            .pipe($.plumber())
            .pipe($.less())
            //Manual error handling/logging
            //.on('error',errorLogger())
            .pipe($.autoprefixer({browsers:['last 2 version','> 5%']}))
            .pipe(gulp.dest(config().temp));
});

const clean = (path) =>{
  log('Cleaning: '+ $.util.colors.red(path));
  return del(path);
};

gulp.task('clean-styles',()=>{
  let files = config().temp + '**/*.css';
  return clean(files);
});

gulp.task('less-watcher',()=>{
  gulp.watch([config().less],['styles']);
});

const errorLogger = (error)=>{
  log('*** ERROR ***');
  log(error);
  log('-----------------------');
};
