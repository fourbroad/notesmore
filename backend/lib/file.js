/*
 * notes.js - module to provide CRUD db capabilities
 */

/*jslint         node    : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
 */

// ------------ BEGIN MODULE SCOPE VARIABLES --------------
'use strict';

const
  extend = require('extend'),
  fileWrapper = new __FileWrapper();

var
  fileProto, create;

// ------------- END MODULE SCOPE VARIABLES ---------------

// ---------------- BEGIN INITIALIZE MODULE SCOPE VARIABLES -----------------

fileProto = {
  append: function(part){
	const self = this;
	fileWrapper.append(this.token, this.domainId, this.id, part, function(err, result) {
      callback(err, result);	  
	});	
  },
  
  close: function(){
	const self = this;
	fileWrapper.close(this.token, this.domainId, this.id, function(err, result) {
      callback(err, result);	  
	});	
  },

  replace: function(fileRaw, callback) {
	const self = this;
	
	fileWrapper.replace(this.token, this.domainId, this.id, fileRaw, function(err, fileData) {
	  if(err) return callback(err);
		  
	  for(var key in self) {
		if(self.hasOwnProperty(key)) try{delete self[key];}catch(e){}
	  }

	  extend(self, fileData);
	  callback(null, true);	  
	});
  },

  patch: function(patch, callback) {
	const
	  self = this;
		
	fileWrapper.patch(this.token, this.domainId, this.id, patch, function(err, fileData) {
	  if(err) return callback(err);
			  
	  for(var key in self) {
		if(self.hasOwnProperty(key)) try{delete self[key];}catch(e){}
	  }

	  extend(self, fileData);
	  callback(null, true);	  
	});
  },
  
  remove: function(callback) {
	fileWrapper.remove(this.token, this.domainId, this.id, function(err, result) {
	  callback(err, result);	  
	});
  },

  openInputStream: function(){
	var start = 0, callback;

	if(arguments.length == 1 && typeof arguments[0] == 'function'){
	  callback = arguments[0];
	} else if(arguments.length == 2 && typeof arguments[1] == 'function'){
	  start = arguments[0];
	  callback = arguments[1];
	} else {
	  throw utils.makeError('Error', 'Number or type of Arguments is not correct!', arguments);
	}	  
	  
  	fileWrapper.openInputStream(this.token, this.domainId, this.id, start, function(err, result){
  		callback(err, result);
  	});
  },

  openOutputStream: function(callback){
  	fileWrapper.openOutputStream(this.token, this.domainId, this.id, function(err, result){
  		callback(err, result);
  	});
  },

  getData: function(callback){
  	fileWrapper.getData(this.token, this.domainId, this.id, function(err, data, eof){
  		callback(err, data, eof);
  	});
  },

  sendData: function(data, callback){
  	fileWrapper.sendData(this.token, this.domainId, this.id, data, function(err, result){
  		callback(err, result);
  	});
  },

  closeStream: function(callback){
  	fileWrapper.closeStream(this.token, this.domainId, this.id, function(err, result){
  		callback(err, result);
  	});
  },

  getACL: function(callback) {
	fileWrapper.getACL(this.token, this.domainId, this.id, function(err, acl) {
	  callback(err, acl);
	});
  },
  
  replaceACL: function(acl, callback) {
	fileWrapper.replaceACL(this.token, this.domainId, this.id, acl, function(err, result) {
	  callback(err, result);
	});
  },
  
  patchACL: function(aclPatch, callback) {
	fileWrapper.patchACL(this.token, this.domainId, this.id, aclPatch, function(err, result) {
	  callback(err, result);
	});
  },
  
  removePermissionSubject: function(acl, callback) {
	fileWrapper.removePermissionSubject(this.token, this.domainId, this.id, acl, function(err, result) {
	  callback(err, result);
	});
  },
  
  findDocuments: function(query, callback) {
    fileWrapper.findDocuments(this.token, this.domainId, this.id, query, function(err, docsData) {
	  callback(err, docsData);
	});
  },
	  
  refresh: function(callback) {
    fileWrapper.refresh(this.token, this.domainId, this.id, function(err, result){
	  callback(err, result);	  
	});
  }  
};

// ----------------- END INITIALIZE MODULE SCOPE VARIABLES ------------------

// ---------------- BEGIN PUBLIC METHODS ------------------

create = function(token, domainId, fileData) {
  var 
    file = Object.create(fileProto, {
      token:{
  	    value: token,
  	    configurable: false,
  	    writable: false,
  	    enumerable: false   	  
      },
      domainId:{
  	    value: domainId,
    	configurable: false,
  	    writable: false,
  	    enumerable: true   	  
      }
    });

  return extend(true, file, fileData)
};

module.exports = {
  create: create
};

// ----------------- END PUBLIC METHODS -----------------
