const
  context = require('./webpack.context.js'),
  development = require('./webpack.development.js'),
  production = require('./webpack.production.js');

module.exports = (env, argv) => {
  if(argv.mode === 'production'){
    return production;
  } else if(argv.mode === 'context'){
    return context;
  }
  
  return development;;
};