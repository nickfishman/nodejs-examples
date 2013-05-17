#!/usr/bin/env node
var request = require('request'),
    zlib = require('zlib'),
    fs = require('fs'),
    headers = require('./headers');
 
var compressedRequest = function(options, callback) {
  var req = request.get(options);
 
  req.on('response', function(res) {
    var chunks = [];
    res.on('data', function(chunk) {
      chunks.push(chunk);
    });
 
    res.on('end', function() {
      var buffer = Buffer.concat(chunks);
      var encoding = res.headers['content-encoding'];
      console.log("Encoding: " + encoding);
      if (encoding == 'gzip') {
        zlib.gunzip(buffer, function(err, decoded) {
          callback(err, decoded && decoded.toString());
        });
      } else if (encoding == 'deflate') {
        zlib.inflate(buffer, function(err, decoded) {
          callback(err, decoded && decoded.toString());
        })
      } else {
        callback(null, buffer.toString());
      }
    });
  });
 
  req.on('error', function(err) {
    callback(err);
  });
}

compressedRequest({url: "http://google.com", headers: headers}, function(err, data) {
  if (err) return console.log(err);
  console.log("Response length: " + data.length);
  console.log("First few bytes: " + data.slice(0, 100));
});