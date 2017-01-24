const browserSync = require('browser-sync');
const gulp = require('gulp');
const args = require('yargs').argv;
let $ = require('gulp-load-plugins')({lazy: true});
const config = require('./gulp.config')();
const del = require('del');
let port = process.env.PORT || config.defaultPort;

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

gulp.task('help', $.taskListing);
gulp.task('default',['help']);

gulp.task('vet',()=>{
  log('Analyzing source with JSHint and JSCS');
  return gulp.src(config.alljs)
  .pipe($.if(args.verbose,$.print()))
  .pipe($.jscs())
  .pipe($.jshint())
  .pipe($.jshint.reporter('jshint-stylish', {verbose:true}))
  .pipe($.jshint.reporter('fail'));
});

gulp.task('styles',['clean-styles'],()=>{
  log('Compiling Less --> CSS');
  return gulp
            .src(config.less)
            .pipe($.plumber())
            .pipe($.less())
            //Manual error handling/logging
            //.on('error',errorLogger())
            .pipe($.autoprefixer({browsers:['last 2 version','> 5%']}))
            .pipe(gulp.dest(config.temp));
});

gulp.task('fonts',()=>{
  log('Copying our fonts');

  return gulp.src(config.fonts)
             .pipe(gulp.dest(config.build + 'fonts'));
});

gulp.task('images',()=>{
  log('Copying and compressing the images');

  return gulp.src(config.images)
             .pipe($.imagemin({optimizationLevel: 4}))
             .pipe(gulp.dest(config.build + 'images'));

});

const clean = (path) =>{
  log('Cleaning: '+ $.util.colors.red(path));
  return del(path);
};

gulp.task('clean',(done)=>{
  let delconfig = [].concat(config.build, config.temp);
  log('Cleaning: ' + $.util.colors.blue(delconfig));
  del(delconfig,done);
});

gulp.task('clean-styles',(done)=>{
  return clean(config.temp + '**/*.css',done);
});

gulp.task('clean-fonts',(done)=>{
  return clean(config.build + 'fonts/**/*.*',done);
});

gulp.task('clean-images',(done)=>{
  return clean(config.build + 'images/**/*.*',done);
});

gulp.task('clean-code',(done)=>{
  let files = [].concat(
                config.temp +'**/*.js',
                config.build + '**/*.html',
                config.build + 'js/*.js');
  return clean(files,done);
});

gulp.task('less-watcher',()=>{
  gulp.watch([config.less],['styles']);
});

gulp.task('templatecache',['clean-code'],()=>{
  log('Creating AngujarJS $templateCache');

  return gulp
              .src(config.htmltemplates)
              .pipe($.minifyHtml({empty: true}))
              .pipe($.angularTemplatecache(
                            config.templateCache.file,
                            config.templateCache.options
                            ))
              .pipe(gulp.dest(config.temp))

});

gulp.task('wiredep',()=>{
  let options = config.getWiredepDefaultOptions;
  let wiredep = require('wiredep').stream;
  return gulp
      .src(config.index)
      .pipe(wiredep(options))
      .pipe($.inject(gulp.src(config.js)))
      .pipe(gulp.dest(config.client));
});

gulp.task('inject',['wiredep','styles','templatecache'],()=>{
  return gulp
      .src(config.index)
      .pipe($.inject(gulp.src(config.css)))
      .pipe(gulp.dest(config.client));
});

gulp.task('optimize',['inject'],()=>{
  log('Optimizing the javascript, css, html');
  let templateCache = config.temp + config.templateCache.file;

  return gulp
         .src(config.index)
         .pipe($.plumber())
         .pipe($.inject(gulp.src(templateCache,{read:false}),{starttag: '<!-- inject:templates:js -->'}))
         .pipe($.useref({searchPath:'./'}))
         .pipe($.if('*.css',$.csso()))
         .pipe($.if(config.optimized.app,$.ngAnnotate({add: true})))
         .pipe($.if(config.optimized.lib,$.uglify()))
         .pipe($.rev())
         .pipe($.revReplace())
         .pipe(gulp.dest(config.build))
         .pipe($.rev.manifest());
});

gulp.task('serve-build',['optimize'],()=>{
  serve(false);
});

gulp.task('serve-dev',['inject'],()=>{
  serve(true);
});

//////// Functions //////////

const serve = (isDev)=>{

  let nodeOptions = {
    script: config.nodeServer,
    delayTime: 1,
    env:{
      'PORT':port,
      'NODE_ENV': isDev? 'dev':'build'
    },
    watch: [config.server]
  }
    return $.nodemon(nodeOptions)
    .on('restart',(env)=>{
      log('*** Server restarted ***');
      log('Files changed on restart: '+env);
      setTimeout(()=>{
        browserSync.notify('Reloading now ...');
        browserSync.reload({stream:false});
      }, config.browserReloadDelay);
    }).on('start',()=>{
      log('*** Server started ***');
      startBrowserSync(isDev);
    });
}

const startBrowserSync = (isDev) =>{
  if(args.nosync || browserSync.active){
    return;
  }

  log('Starting browser-synx on port '+ port);

  if (isDev) {
    gulp.watch([config.less],['styles']).on('change',(event)=>{
      changeEvent(event);
    });
  }else{
    gulp.watch([config.less, config.js, config.html],['optimize', browserSync.reload]).on('change',(event)=>{
      changeEvent(event);
    });
  }


  let options = {
    proxy: 'localhost:'+ port,
    port: 3000,
    files: isDev?[
            config.client + '**/*.*',
            '!' + config.less,
            config.temp + '**/*.css'
          ]:[],
    gostMode: {
      clicks: true,
      location: true,
      forms: true,
      scroll: true
    },
    injectChanges: true,
    logFileChanges: true,
    logLevel: 'debug',
    logPrefix: 'gulp-patterns',
    reloadDelay: 0
  };

  browserSync(options);
}

const errorLogger = (error)=>{
  log('*** ERROR ***');
  log(error);
  log('-----------------------');
};
