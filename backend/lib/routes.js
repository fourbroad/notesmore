/*
 * routes.js - module to provide routing
*/

/*jslint         node    : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global */

// ------------ BEGIN MODULE SCOPE VARIABLES --------------
'use strict';
var
  router = require('express').Router(),
//  crud        = require( './crud' ),
//  makeMongoId = crud.makeMongoId,
  uuidv4 = require('uuid/v4'),
  fs = require('fs'),
  inspect = require('util').inspect,
  Busboy = require('busboy'),
  StringDecoder = require('string_decoder').StringDecoder,
  notes = require('./notes.js'),
  utils = require('./utils');
// ------------- END MODULE SCOPE VARIABLES ---------------

// ---------------- BEGIN PUBLIC METHODS ------------------
//router.get('/', function(request, response){
//  response.redirect( '/index.html' );
//});

function openFile(token, domainId, fileId, fieldName, fileName, encoding, mimeType, callback) {
  notes.connect(token, function(err, client) {
	if (err) return callback && callback(err);
	client.getDomain(domainId, function(err, domain) {
	  if (err) return callback && callback(err);
	  domain.createFile(fileId, {
	    fieldName: fieldName,
	    fileName: fileName,
	    mimeType: mimeType,
	    encoding: encoding
	  }, function(err, fileActor) {
	    if (err) return callback && callback(err);
	    fileActor.openOutputStream(function(err, result) {
	      if (err) return callback && callback(err);
	      callback && callback(null, fileActor)
	    });
	  });
	});
  });
}

function getFile(token, domainId, fileId, callback) {
  notes.connect(token, function(err, client) {
	if (err) return callback && callback(err);
	client.getDomain(domainId, function(err, domain) {
	  if (err) return callback && callback(err);
	  domain.getFile(fileId, callback);
	});
  });
}

router.post('/upload-files', function(req, res) {
  var busboy = new Busboy({ headers: req.headers });
  var files = {};
  var busboyFinished = false;
  var token = req.cookies.token || req.headers.token;
  
  function sendResponse(){
    if(!busboyFinished) return;

    var fs = new Array();
    var hdfsFinished = true;
	for(var name in files) {
	  if(files.hasOwnProperty(name)){
		if(files[name].process){
		  hdfsFinished = false;
		  break;
		}else{
		  fs.push(files[name]);  
		}    		  
	  }
    }
    
	if(hdfsFinished){
	  res.send({ files: fs});
	}
  }

  busboy.on('file', function(fieldname, file, filename, encoding, mimetype) {
	var domainId = "localhost";
	var fileId = uuidv4();
    openFile(token, domainId, fileId, fieldname, filename, encoding, mimetype, function(err, fileActor) {
	  file.on('data', function(data) {
		if(!files[filename]){
		  files[filename] = {
			name: filename,
		    size: 0,
		    process: true
		  }
		}
		if(!files[filename].error){
		  fileActor.sendData(data, function(err, result) {
			if (err) {
			  files[filename].error = files[filename].error || err.message;
			  return; 
			}
			files[filename].size = files[filename].size + data.length; 
		  });
		}
	  });
      file.on('end', function() {
        fileActor.patch([{op:'add', path:'/size', value: files[filename].size}], function(err, result){
          fileActor.closeStream(function(err, result) {
            if (err || files[filename].error) {
           	  files[filename].error = files[filename].error || err.message;
            }else {
              files[filename].url = "http://localhost:8080/files/" + domainId + "/" + fileId;
              files[filename].thumbnailUrl = "http://localhost:8080/files/" + domainId + "/" + fileId;
              files[filename].deleteUrl = "http://localhost:8080/files/" + domainId + "/" + fileId;
              files[filename].deleteType = "DELETE";
            }

            delete files[filename].process;
          	sendResponse();
          });
        });
      });
    });
  });

  busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated) {
	console.log('Field [' + fieldname + ']: value: ' + inspect(val));
  });

  busboy.on('finish', function() {
	busboyFinished = true;
	sendResponse();
  });

  req.pipe(busboy);
});

function sendData(response, fileActor){
  fileActor.getData(function(err, data, eof){
	if(err) return console.log(err);
	response.write(new Buffer(data), 'binary');
	if(eof){
	  fileActor.closeStream(function(err, result){
		if(err) return console.log(err);
	    response.end();
	  });
	} else {
	  sendData(response, fileActor);
	}
  });
}

router.get('/files/:domainId/:fileId', function(request, response){
  var token = request.cookies.token || request.headers.token, domainId = request.params.domainId, fileId = request.params.fileId;
  getFile(token, domainId, fileId, function(err, fileActor){
    if (err) return console.log(err);
    var fileSize = fileActor.size;
	var range = request.headers.range;
	var startPos = 0;
	if( typeof range != 'undefined') {
	  var startPosMatch = /^bytes=([0-9]+)-$/.exec(range);
	  startPos = Number(startPosMatch[1]);
	}
	
	fileActor.openInputStream(startPos, function(err, result) {
	  if (err) return console.log(err);
	  
	  if(startPos == 0) {
		response.setHeader('Accept-Range', 'bytes');
	  } else {
		response.setHeader('Content-Range', 'bytes ' + startPos + '-' + (fileSize - 1) + '/' + fileSize);
	  }
	  response.writeHead(206, 'Partial Content', {'Content-Type' : fileActor.mimeType});
	  
	  sendData(response, fileActor);
	});
  });
});

router.delete('/files/:domainId/:fileId', function(request, response){
  var token = request.cookies.token || request.headers.token, domainId = request.params.domainId, fileId = request.params.fileId;
  getFile(token, domainId, fileId, function(err, fileActor){
	fileActor.remove(function(err, result){
	  var resObj = {};
	  resObj[fileActor.fileName] = result ? true : false
	  response.send({ files:[resObj]});
	});
  });
});

router.all('/:obj_type/*?', function(request, response, next){
  response.contentType('json');
  next();
});

router.get('/:obj_type/list', function(request, response){
  crud.read(request.params.obj_type,{}, {}, function(map_list) { 
	  response.send( map_list ); 
  });
});

router.post('/:obj_type/create', function(request, response){
  crud.construct(request.params.obj_type, request.body, function(result_map){ 
	  response.send( result_map ); 
  });
});

router.get('/:obj_type/read/:id', function(request, response){
  crud.read(request.params.obj_type, {_id: makeMongoId(request.params.id)}, {}, function(map_list){ 
	  response.send( map_list ); 
  });
});

router.post('/:obj_type/update/:id', function(request, response){
  crud.update(request.params.obj_type, {_id:makeMongoId(request.params.id)}, request.body, function(result_map){
	  response.send( result_map ); 
  });
});

router.get('/:obj_type/delete/:id', function(request, response){
  crud.destroy(request.params.obj_type, {_id:makeMongoId(request.params.id)}, function(result_map){
	  response.send( result_map ); 
  });
});

module.exports = router;
// ----------------- END PUBLIC METHODS -------------------
