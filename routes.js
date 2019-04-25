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
  , ACL = require('./backend/acg/acl')
  , hdfs = WebHDFS.createClient(config.get('elasticSearch'));

const
  { Collection, Document, Domain, Form, Group, Meta, Page, Action, Role, Profile, File, User, View, Utils} = model,
  { getClass, filterQuery, checkPermission, checkCreate, checkAcl1, checkAcl2, checkAcl3 } = ACL;


//router.get('/', function(request, response){
//  response.redirect( '/index.html' );
//});

router.post('/_login', function(req, res){
  let user = req.body;  
  User.login(user.id, user.password).then(token => {
    res.send(token);
  }).catch(err => res.status(err.status).json(err));
});

router.post('/:domainId/:collectionId/_bulk', function(req, res){
  let visitorId = req.visitorId, domainId = req.params.domainId, collectionId = req.params.collectionId, docs = req.body;
  checkAcl2(visitorId, Collection, domainId, collectionId, 'bulk', null).then( collection => {
    return collection.bulk(visitorId, docs);
  }).then(result => res.json(result)).catch(err => {
    console.error(err);
    res.status(err.status).json(err);
  });
});

router.post('/:domainId/:collectionId/:documentId/_patch', function(req, res){
  let visitorId = req.visitorId, domainId = req.params.domainId, collectionId = req.params.collectionId, documentId = req.params.documentId, patch = req.body;
  checkAcl3(visitorId, getClass(collectionId), domainId, collectionId, documentId, 'patch', patch).then( document => {
    return document.patch(visitorId, patch);
  }).then(doc => res.json(doc)).catch(err => {
    console.error(err);
    res.status(err.status).json(err);
  });
});

router.delete('/_logout', function(req, res){
  let visitorId = req.visitorId;
  User.logout(visitorId).then( result => {
    return visitorId + " has logged out";
  }).then(result => res.send(result)).catch(err => {
    console.error(err);
    res.status(err.status).json(err);
  });
});

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
