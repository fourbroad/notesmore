const _ = require('lodash')
  , router = require('express').Router()
  , Path = require('path')
  , WebHDFS = require('webhdfs')//  crud        = require( './crud' ),
//  makeMongoId = crud.makeMongoId,
  , uuidv4 = require('uuid/v4')
  , fs = require('fs')
  , inspect = require('util').inspect
  , Busboy = require('busboy')
  , StringDecoder = require('string_decoder').StringDecoder
  , config = require('config')
  , model = require('./backend/acg/model')
  , hdfs = WebHDFS.createClient(config.get('elasticSearch'));

//router.get('/', function(request, response){
//  response.redirect( '/index.html' );
//});

const {Domain, User, File, Collection, Profile, Utils} = model;

router.post('/:domainId/.files', function(req, res) {
  var visitorId = req.visitorId
    , domainId = req.params.domainId
    , files = {}
    , busboyFinished = false
    , busboy = new Busboy({
    headers: req.headers
  });

  function sendResponse() {
    if (!busboyFinished)
      return;

    var fs = new Array();
    var hdfsFinished = true;
    for (var name in files) {
      if (files.hasOwnProperty(name)) {
        if (files[name].process) {
          hdfsFinished = false;
          break;
        } else {
          fs.push(files[name]);
        }
      }
    }

    if (hdfsFinished) {
      Collection.get(domainId, '.files').then(function(collection) {
        return collection.bulk(visitorId, fs);
      }).then(function() {
        res.send({
          files: fs
        });
      }).catch(function(e) {
        console.error(e);
      });
    }
  }

  busboy.on('file', function(fieldName, stream, fileName, encoding, mimeType) {
    var domainId = ".root"
      , fileId = uuidv4()
      , path = '/' + domainId + '/' + fileId + Path.extname(fileName);
    files[path] = {
      id: fileId,
      title: fileName,
      fieldName: fieldName,
      mimeType: mimeType,
      encoding: encoding,
      name: fileName,
      size: 0,
      process: true
    };

    stream.on('data', function(chunk) {
      files[path].size = files[path].size + chunk.length;
    });
    stream.on('end', function() {
      _.merge(files[path], {
        url: "http://localhost:3000/" + domainId + "/.files/" + fileId,
        thumbnailUrl: "http://localhost:3000/" + domainId + "/.files/" + fileId,
        deleteUrl: "http://localhost:3000/" + domainId + "/.files/" + fileId,
        deleteType: "DELETE"
      });
      delete files[path].process;
      sendResponse();
    });

    stream.pipe(hdfs.createWriteStream(path));
  });

  busboy.on('field', function(fieldName, val, fieldnameTruncated, valTruncated) {
    console.log('Field [' + fieldName + ']: value: ' + inspect(val));
  });

  busboy.on('finish', function() {
    busboyFinished = true;
    sendResponse();
  });

  req.pipe(busboy);

});

router.get('/:domainId/.files/:fileId', function(request, response) {
  var visitorId = request.visitorId
    , domainId = request.params.domainId
    , fileId = request.params.fileId
    , range = request.headers.range
    , startPos = 0;
  Profile.get(domainId, visitorId).then(profile=>{
    File.get(domainId, fileId).then(file=>{
      Utils.checkPermission(profile, _.at(file, '_meta.acl.get')[0]).then(result=>{
        if (result) {
          var path = '/' + domainId + '/' + fileId + Path.extname(file.name);
          if (typeof range != 'undefined') {
            var startPosMatch = /^bytes=([0-9]+)-$/.exec(range);
            startPos = Number(startPosMatch[1]);
          }

          if (startPos == 0) {
            response.setHeader('Accept-Range', 'bytes');
          } else {
            response.setHeader('Content-Range', 'bytes ' + startPos + '-' + (file.size - 1) + '/' + fileSize);
          }
          response.writeHead(206, 'Partial Content', {
            'Content-Type': file.mimeType
          });
          hdfs.createReadStream(path, {
            offset: startPos
          }).pipe(response);

        }
      }
      );
    }
    );
  })
});

router.delete('/:domainId/.files/:fileId', function(request, response) {
  var visitorId = request.visitorId
    , domainId = request.params.domainId
    , fileId = request.params.fileId;

  File.get(domainId, fileId).then(function(file) {
    file.delete(visitorId);
    return file;
  }).then(function(file) {
    var path = '/' + domainId + '/' + fileId + Path.extname(file.name), resObj = {};
    resObj[file.fileName] = true;
    hdfs.unlink(path);
    response.send({
      files: [resObj]
    });
  }).catch(e=>console.error(e));
});

router.all('/:obj_type/*?', function(request, response, next) {
  response.contentType('json');
  next();
});

router.get('/:obj_type/list', function(request, response) {
  crud.read(request.params.obj_type, {}, {}, function(map_list) {
    response.send(map_list);
  });
});

router.post('/:obj_type/create', function(request, response) {
  crud.construct(request.params.obj_type, request.body, function(result_map) {
    response.send(result_map);
  });
});

router.get('/:obj_type/read/:id', function(request, response) {
  crud.read(request.params.obj_type, {
    _id: makeMongoId(request.params.id)
  }, {}, function(map_list) {
    response.send(map_list);
  });
});

router.post('/:obj_type/update/:id', function(request, response) {
  crud.update(request.params.obj_type, {
    _id: makeMongoId(request.params.id)
  }, request.body, function(result_map) {
    response.send(result_map);
  });
});

router.get('/:obj_type/delete/:id', function(request, response) {
  crud.destroy(request.params.obj_type, {
    _id: makeMongoId(request.params.id)
  }, function(result_map) {
    response.send(result_map);
  });
});

module.exports = router;
