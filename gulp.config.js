module.exports = ()=>{
  let client = './src/client/';
  let config = {
    temp:'./.temp',
    /***********
    * File paths
    ***********/
    alljs:[
      './src/**/*.js',
      './*.js'
    ],
    less: client + 'styles/styles.less'
  };
  return config;
};
