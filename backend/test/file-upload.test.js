process.chdir(__dirname);

var express = require('express');
var app = express();
var router = express.Router();
var path = require('path');
var fs = require('fs');
var inspect = require('util').inspect
var Busboy = require('busboy');
var StringDecoder = require('string_decoder').StringDecoder;
var notes = require('../lib/notes.js');

process.on('SIGWINCH', ()=>{asyncCallback();});

//配置引擎模板以及静态文件访问文件夹
//app.set('view engine', 'ejs');
//app.set('views', path.join(__dirname, 'view'));
//app.engine('html', require('ejs').__express);
//app.use(express.static(path.join(__dirname, 'static')));
//
////首页
//app.get(['/', '/index', '/index.html'], function(req, res, next) {
//  res.render('index.html');
//});

function openFile(token, fieldName, fileName, encoding, mimeType, callback) {
  notes.connect(token, function(err, client) {
    if (err) return callback && callback(err);
    client.getDomain('localhost', function(err, domain) {
      if (err) return callback && callback(err);
      domain.createFile({
        fieldName: fieldName,
        fileName: fileName,
        mimeType: mimeType,
        encoding: encoding
      }, function(err, file) {
        if (err) return callback && callback(err);
        file.openOutputStream(function(err, result) {
          if (err) return callback && callback(err);
          callback && callback(null, file)
        });
      });
    });
  });
}

//路由配置
router.post('/file-upload', function(req, res) {
  /**设置响应头允许ajax跨域访问**/
  res.setHeader("Access-Control-Allow-Origin", "*");
  var busboy = new Busboy({
	    headers: req.headers
	  });
  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
	openFile(req.headers.token, fieldname, filename, encoding, mimetype, function(err, fileActor) {
	  file.on('data', function(data) {
	    fileActor.sendData(data, function(err, result) {
	      if (err) return console.log(err);
	    });
	  });
	  file.on('end', function() {
	    fileActor.closeStream(function(err, result) {
	      if (err) return console.log(err);
	    });
	  });
	});
  });
  busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
    console.log('Field [' + fieldname + ']: value: ' + inspect(val));
  });
  busboy.on('finish', function() {
    res.writeHead(303, {
      Connection: 'close',
      Location: '/'
    });
    res.end();
  });
  req.pipe(busboy);
});
app.use(router);

var hostname = '127.0.0.1';
var port = 8080;
app.listen(port, hostname, function(err) {
  if (err)
    throw err;
  console.log('server running at http://' + hostname + ':' + port);
});
