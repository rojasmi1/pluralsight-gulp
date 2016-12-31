module.exports = ()=>{
  let client = './src/client/';
  let clientApp = client + 'app/';
  let temp = './.temp/'
  let config = {
    temp:temp,
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

    /***
    * Bower and NPM locations
    ***/
    bower:{
      json: require('./bower.json'),
      directory: './bower_components/',
      ignorePath: '../..'
    }
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
