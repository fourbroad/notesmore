const
  createError = require('http-errors'),
  http = require('http'),
  express = require('express'),
  cookieParser = require('cookie-parser'),
  logger = require('morgan'),
  path = require('path'),
  cors = require('cors'),
  debug = require('debug')('notesmore:server'),
  socketIO = require('socket.io'),
  acg = require('./backend/acg'),
  jwt = require('./backend/lib/jwt'),
// chat = require('./chat'),
  routes = require( './routes' ),
  app     = express(),
  server = http.createServer(app),
  io = socketIO.listen(server);

function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

app.use(cors({credentials: true, origin: 'http://localhost:8080'}));

// app.use(cors());

app.use(logger('dev'));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use('/dist', express.static(path.join(__dirname,'dist')));
// app.use('/test', express.static(path.join(__dirname,'test')));

app.use(cookieParser());
app.use(jwt().unless({
  path: [
    '/index.html',
    { url: '/_login', methods: ['POST']}
  ]
}))
app.use("/", routes);

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


acg.connect(io);
// chat.connect(io);

server.on('error', function(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
  case 'EACCES':
    console.error(bind + ' requires elevated privileges');
    process.exit(1);
    break;
  case 'EADDRINUSE':
    console.error(bind + ' is already in use');
    process.exit(1);
    break;
  default:
    throw error;
  }
});

process.on('unhandledRejection', function (error, promise) {
  console.error(error);
});

server.on('listening', function() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  debug('Listening on ' + bind);
});

server.listen(port);