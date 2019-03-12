const _ = require('lodash');

exports.uniqueId = function(domainId, collectionId, documentId){
  return domainId+'~'+collectionId+'~'+documentId;
}

exports.makeError = function(code, name, msg, data){
  var error = new Error();
  error.code = code;
  error.name = name;
  error.message = msg;
  if(data){error.data = data;}
  return error;
}

exports.inherits = function inherits(Child, Parent, proto) {
  var F = function() {};
  F.prototype = Parent.prototype;
  Child.prototype = new F();
  Child.prototype.constructor = Child;
  Child.parent = Parent.prototype;
  _.assign(Child.prototype, proto);
  return Child;
}
