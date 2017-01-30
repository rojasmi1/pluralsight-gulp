module.exports = ()=>{
  let client = './src/client/';
  let clientApp = client + 'app/';
  let server = './src/server/';
  let root = './';
  let temp = './.temp/';
  let report = './report/';
  const wiredep = require('wiredep');
  let bowerFiles = wiredep({devDependencies: true})['js'];

  let config = {
    /***********
    * File paths
    ***********/
    alljs:[
      './src/**/*.js',
      './*.js'
    ],
    build:'./dist/',
    client: client,
    css: temp + 'styles.css',
    fonts:'./bower_components/font-awesome/fonts/**/*.*',
    images:client + 'images/**/*.*',
    html: clientApp + clientApp + '**/*.html',
    htmltemplates: clientApp + '**/*.html',
    index:client + 'index.html',
    js: [
      clientApp + '**/*.module.js',
      clientApp + '**/*.js',
      '!' + clientApp + '**/*.spec.js'
    ],
    less: client + 'styles/styles.less',
    server: server,
    temp:temp,
    report:report,
    root:root,

    /***
    * Browser sync
    ***/
    browserReloadDelay: 1000,

    /***
    * Optimized files
    ***/
    optimized: {
      app: 'app.js',
      lib: 'lib.js'
    },

    /***
    * Template cache
    ***/
    templateCache: {
      file: 'template.js',
      options:{
        module: 'app.core',
        standAlone: false,
        root: 'app/'
      }
    },

    /***
    * Bower and NPM locations
    ***/
    bower:{
      json: require('./bower.json'),
      directory: './bower_components/',
      ignorePath: '../..'
    },
    packages : [
      './package.json',
      './bower.json'
    ],

    /**
    * Karma and testing settigns
    **/
    specHelpers: [client + 'tests-helpers/*.js'],
    serverIntegrationSpecs:[client + 'tests/server-integration/**/*.spec.js'],

    /**
    * Node settings
    **/
    defaultPort: 7203,
    nodeServer: server + 'app.js'
  };

  const getWiredepDefaultOptions = ()=>{
    let options = {
      bowerJson: config.bower.json,
      directory: config.bower.directory,
      ignorePath: config.bower.ignorePath
    };

    return options;
  };

  const getKarmaOptions = ()=>{
    let options = {
      files: [].concat(
        bowerFiles,
        config.specHelpers,
        client + '**/*.module.js',
        client + '**/*.js',
        temp + config.templateCache.file,
        config.serverIntegrationSpecs
      ),
      exclude: [],
      coverage: {
        dir: report + 'coverage',
        reporters: [
          {type: 'html', subdir: 'report-html'},
          {type: 'lcov', subdir: 'report-lcov'},
          {type: 'text-summary'}
        ]
      },
      preprocessors: {}
    };
    options.preprocessors[clientApp + '**/!(*.spec)+(.js)'] = ['coverage'];

    return options;
  };

  config.karma = getKarmaOptions();

  return config;
};
