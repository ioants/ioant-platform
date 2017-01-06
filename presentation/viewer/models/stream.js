
var request = require('request');
var moment = require('moment');
var config = require('../configuration.json');
var db = require('../db');
const winston = require('winston');
var protobuf = require("protobufjs");

rest_api_request = config.restApiServer.url + ":" + config.restApiServer.port;

var protoio = require('./../proto/protoio');

var request_stream_options = {
  method: 'GET',
  uri: rest_api_request+'/getstreamvalues',
  json: true
}

var request_stream_info_options = {
  method: 'GET',
  uri: rest_api_request+'/getstreaminfo',
  json: true
}

exports.get = function(sid, startdate, enddate, filter, cb) {
    console.log("Attempt chart")
    request_stream_options.qs = {'streamid': sid,
                          'startdate': startdate,
                          'enddate': enddate,
                          'filter':filter}
    request(request_stream_options, function(error, response, streamData){
        for (var key in streamData){
            delete streamData[key]['id'];
        }
        cb(error, response, streamData);
     });
}

function underScore(str) {
     return str.substring(0,1)
          + str.substring(1)
                .replace(/([A-Z])(?=[a-z]|$)/g, function($0, $1) { return "_" + $1.toLowerCase(); });
 }

exports.getInfo = function(streamId, cb) {
    request_stream_info_options.qs = {'streamid': streamId}
    request(request_stream_info_options, function(error, response, streamInfo){
          console.log(streamInfo)
          var streamInformation = streamInfo[0];
          if(!error){
              protoio.getProtoMessage(streamInformation.nb_message_type ,function (message){
                  fields = Object.keys(message.fields);
                  for (var i = 0; i < fields.length; i++) {
                      var msg_type = message.fields[fields[i]].type;
                      if (typeof message.nested !== 'undefined' ){
                          if (typeof message.nested[msg_type] !== 'undefined' ){
                              fields[i] = {field:underScore(fields[i]), enum: protoio.swap(message.nested[msg_type].values)}
                          }
                          else {
                              fields[i] = {field:underScore(fields[i])};
                          }
                      }
                      else {
                          fields[i] = {field:underScore(fields[i])};
                      }
                  };
                  streamInformation['proto'] = fields;
                  cb(streamInformation);
             });
          }
          else {
              cb(false);
          }
     });
}
