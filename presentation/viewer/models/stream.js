'use strict';
/**
 * @file stream.js
 * @author Adam Saxén
 *
 *  Model of stream - retrieves stream information and actual stream data
 */
var request = require('request');
var moment = require('moment');
var Logger = require('ioant-logger');
var Proto = require('ioant-proto');
var Loader = require('ioant-loader');

let rest_api_request;
let request_stream_options;
Loader.load('./configuration.json', 'configuration').then((config) => {
    rest_api_request = config.restApiServer.url + ":" + config.restApiServer.port;
    request_stream_options = {
     method: 'GET',
     uri: rest_api_request+'/v0.1/streams',
     json: true
   }
}).catch(function(error){
      Logger.log('error', 'Failed to load asset: configuration');
});


exports.get = function(sid, startdate, enddate, filter, cb) {
    request_stream_options.qs = {'streamid': sid,
                          'startdate': startdate,
                          'enddate': enddate,
                          'filter':filter}
    var request_options = Object.assign({}, request_stream_options);
    request_options.uri += '/id/'+sid+'/data';
    request(request_options, function(error, response, streamData){
        for (var key in streamData){
            delete streamData[key]['id'];
        }
        cb(error, response, streamData);
     });
}

exports.getInfo = function(streamId, cb) {
    var request_options = Object.assign({}, request_stream_options);
    request_options.uri += '/id/'+streamId;
    request(request_options, function(error, response, streamInfo){
          var streamInformation = streamInfo[0];
          Logger.log('debug', 'stream information retrieved:',{streamInformation:streamInfo[0]});
          if(!error){
              Proto.getProtoMessage(streamInformation.message_type).then((message) =>{
                  let fields = Object.keys(message.fields);
                  Logger.log('debug', 'message fields:',{streamInformation:streamInfo[0]});
                  for (var i = 0; i < fields.length; i++) {
                      var msg_type = message.fields[fields[i]].type;
                      if (typeof message.nested !== 'undefined' ){
                          if (typeof message.nested[msg_type] !== 'undefined' ){
                              fields[i] = {field:Proto.underScore(fields[i]), enum: Proto.swap(message.nested[msg_type].values)}
                          }
                          else {
                              fields[i] = {field:Proto.underScore(fields[i])};
                          }
                      }
                      else {
                          fields[i] = {field:Proto.underScore(fields[i])};
                      }
                  };
                  streamInformation['proto'] = fields;
                  cb(streamInformation);
              }).catch(function(errors){
                    Logger.log('error', 'Failed get proto message information', {streamInformation:streamInfo[0]});
                 });
          }
          else {
              cb(false);
          }
     });
}
