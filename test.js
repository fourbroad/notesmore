var WebHDFS = require('webhdfs');
var hdfs = WebHDFS.createClient({
  user: 'fourbroad', // Hadoop user
//   host: '192.168.1.107', // Namenode host
  host: 'localhost', // Namenode host
  port: 9870 // Namenode port
//   port: 14000 // Namenode port

});
var fs = require('fs');

var localFileStream = fs.createReadStream('./routes.js');
var remoteFileStream = hdfs.createWriteStream('/routes.js');

localFileStream.pipe(remoteFileStream);

remoteFileStream.on('error', function onError (err) {
  console.error(err);
});

localFileStream.on('data', function onChunk (chunk) {
  console.log(chunk.toString());
});

remoteFileStream.on('finish', function onFinish () {
  console.log('Upload is done!');
});


// var readFileStream = hdfs.createReadStream('/routes.js');

// readFileStream.on('error', function onError (err) {
//   console.error(err);
// });

// readFileStream.on('data', function onChunk (chunk) {
//   console.log(chunk.toString());
// });

// readFileStream.on('finish', function onFinish () {
//    console.log("finished");
// });
