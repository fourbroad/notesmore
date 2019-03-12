/*
 * cache.js - Redis cache implementation
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
  redisDriver = require('redis'),
  redisClient = redisDriver.createClient(),
  toString, del, get, set;
// ------------- END MODULE SCOPE VARIABLES ---------------

// --------------- BEGIN UTILITY METHODS ------------------
toString = function ( key_data ) {
  return (typeof key_data === 'string' ) ? key_data : JSON.stringify( key_data );
};
// ---------------- END UTILITY METHODS -------------------

// ---------------- BEGIN PUBLIC METHODS ------------------
del = function(key){
  redisClient.del(toString(key));
};

get = function(key, callback) {
  redisClient.get(toString(key), function(err, value){
    if(err) return callback(err);
    callback(null, JSON.parse(value));
  });
};

set = function(key, value) {
  redisClient.set(toString(key), toString(value));
};

redisClient.on('error', function (err) { 
  console.error('error event - ' + redisClient.host + ':' + redisClient.port + ' - ' + err); 
});

module.exports = {
  del : del,
  get  : get,
  set  : set
};
// ----------------- END PUBLIC METHODS -------------------
