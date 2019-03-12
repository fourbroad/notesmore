/*
 * app.js - Express server with routing
 */

/*jslint         node    : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
 */

'use strict';

const
  createError = require('http-errors'),
  http = require('http'),
  express = require('express'),
  cookieParser = require('cookie-parser'),
  logger = require('morgan'),
  path = require('path'),
  utils = require('./backend/lib/utils'),
  jwt = require('./backend/lib/jwt'),  
  cors = require('cors'),
//   routes = require( './backend/lib/routes' ),
//   webpack = require('webpack'),
//   webpackDevMiddleware = require('webpack-dev-middleware'),
//   webpackHotMiddleware = require('webpack-hot-middleware'),
//   config = require('./webpack.development.js'),
//   compiler = webpack(config);
  app     = express(),
  server = http.createServer(app);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/dist', express.static(path.join(__dirname,'dist')));
// app.use('/test', express.static(path.join(__dirname,'test')));

// //Tell express to use the webpack-dev-middleware and use the webpack.development.js configuration file as a base.
// app.use(webpackDevMiddleware(compiler, {
//   publicPath: config.output.publicPath,
//   stats: { colors: true }
// }))
// app.use(webpackHotMiddleware(compiler))


//app.use(function(req, res, next){
//	var hostName = utils.getHostName(req);
//	req["domain"] = new Domain(hostName, "");
//	next();
//});

//app.use(jwt().unless({path:['/','/_login','/js','/css']}));
app.use(cookieParser());
app.use(cors());
// app.use("/", routes);

// catch 404 and forward to error handler
app.use(function(req,res,next){
 next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  var code = err.status || 500
  res.status(code);
  res.json({code:code, message:err.message});
});

module.exports = app;
