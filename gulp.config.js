module.exports = ()=>{
  let client = './src/client/';
  let clientApp = client + 'app/';
  let server = './src/server/'
  let temp = './.temp/'
  let config = {
    /***********
    * File paths
    ***********/
    alljs:[
      './src/**/*.js',
      './*.js'
    ],
    client: client,
    css: temp + 'styles.css',
    index:client + 'index.html',
    js: [
      clientApp + '**/*.module.js',
      clientApp + '**/*.js',
      '!' + clientApp + '**/*.spec.js'
    ],
    less: client + 'styles/styles.less',
    server: server,
    temp:temp,

    /***
    * Browser sync
    ***/
    browserReloadDelay: 1000,
    
    /***
    * Bower and NPM locations
    ***/
    bower:{
      json: require('./bower.json'),
      directory: './bower_components/',
      ignorePath: '../..'
    },

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

  return config;
};
