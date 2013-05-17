#!/usr/bin/env node
var request = require('request'),
    zlib = require('zlib'),
    fs = require('fs'),
    headers = require('./headers');
 
var compressedRequest = function(options, outStream) {
  var req = request(options);
 
  req.on('response', function (res) {
    if (res.statusCode !== 200) throw new Error('Status not 200');
 
    var encoding = res.headers['content-encoding'];
    if (encoding == 'gzip') {
      res.pipe(zlib.createGunzip()).pipe(outStream);
    } else if (encoding == 'deflate') {
      res.pipe(zlib.createInflate()).pipe(outStream);
    } else {
      res.pipe(outStream);
    }
  });
 
  req.on('error', function(err) {
    throw err;
  })
}
 
// Dummy write stream. Substitute with any other writeable stream
var outStream = fs.createWriteStream('./sample.html');
compressedRequest({url: "http://google.com", headers: headers}, outStream);