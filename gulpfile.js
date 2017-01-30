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
              .pipe(gulp.dest(config.temp));

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
         .pipe($.rev.manifest())
         .pipe(gulp.dest(config.build));
});

/**
* Bump the version
* --type=pre will bump the prerelease version *.*.*-x
* --type=patch or no flag will bump the patch version *.*.x
* --type=minor will bump the minor version *.x.*
* --type=major will bump the major version x.*.*
* --version=1.2.3 will bump to a specific version and ignore other flags
*/
gulp.task('bump',()=>{
  let msg = 'Bumping versions';
  let type = args.type;
  let version = args.version;
  let options = {};
  if(version){
    options.version = version;
    msg += ' to '+ version;
  }else{
    options.type = type;
    msg += ' for a '+ type;
  }
  log(msg);
  return gulp
         .src(config.packages)
         .pipe($.print())
         .pipe($.bump(options))
         .pipe(gulp.dest(config.root));
});

gulp.task('serve-build',['optimize'],()=>{
  serve(false);
});

gulp.task('serve-dev',['inject'],()=>{
  serve(true);
});

gulp.task('test',['vet','templatecache'],(done)=>{
  startTests(true/*singleRun*/,done);
});
//////// Functions //////////

function serve(isDev){

  let nodeOptions = {
    script: config.nodeServer,
    delayTime: 1,
    env:{
      'PORT':port,
      'NODE_ENV': isDev? 'dev':'build'
    },
    watch: [config.server]
  };
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

function startBrowserSync(isDev) {
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


function startTests(singleRun,done) {
  let karma = require('karma').server;
  let excludeFiles = [];
  let serverSpecs = config.serverIntegrationSpecs;
  excludeFiles = excludeFiles.concat(serverSpecs);

  karma.start({configFile:__dirname + '/karma.conf.js',
              singleRun:!!singleRun,
              exclude:excludeFiles
              },
              karmaCompleted
             );

  function karmaCompleted(karmaResult) {
    log('Karma completed');
    if(karmaResult === 1){
      done('Karma: tests failed with code ' + karmaResult);
    }else{
      done();
    }
  }
}

function errorLogger(error){
  log('*** ERROR ***');
  log(error);
  log('-----------------------');
}

function changeEvent(event){
  log('*** CHANGED ***');
  log(event);
  log('-----------------------');
}
