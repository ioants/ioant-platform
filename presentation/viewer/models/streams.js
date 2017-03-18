'use strict';
/**
 * @file streams.js
 * @author Adam Saxén
 *
 *  Model for listing multiple streams
 */
var request = require('request');
var moment = require('moment');
var Proto = require('ioant-proto');
var Logger = require('ioant-logger');
var Loader = require('ioant-loader');
var Utils = require('./utils');
let rest_api_request;
let request_options;

Loader.load('./configuration.json', 'configuration').then((config) => {
    rest_api_request = config.restApiServer.url + ":" + config.restApiServer.port;
    request_options = {
        method: 'GET',
        uri: rest_api_request+'/v0.1/streams',
        json: true
    }
}).catch(function(error){
      Logger.log('error', 'Failed to load asset: configuration');
});


function enrichStreamWithMeta(stream) {
    return Proto.getProtoMessage(stream.message_type)
          .then((message) => {
               Logger.log('debug', 'Enriching stream', {stream:stream});
               let fields = Object.keys(message.fields);
               let list_of_fields = [];
               fields.forEach(function(field) {
                    list_of_fields.push(Proto.underScore(field));
                 })
               stream.message_fields = list_of_fields;

               stream.image_type_url = Utils.getImageOfMessageType(stream.message_type);
               let tempMoment = moment(stream.update_ts);
               let timeStampNow = moment();
               stream.update_ts = tempMoment.format('MMMM Do YYYY, H:mm:ss');
               stream.latest_value_date = tempMoment.format('YYYY-MM-DD');
               //Calc duration since last message
               let duration = moment.duration(timeStampNow.diff(tempMoment));
               stream.ts_diff = Math.round( duration.asHours() * 10 ) / 10;

               if (Proto.enumerate("Image") == stream.message_type){
                   stream.isimage = true;
               }
               else {
                   stream.isimage = false;
               }

               return new Promise((resolve, reject) =>{
                   resolve(stream);
               });
           }).catch(function(error){
               Logger.log('error', 'Failed enrich stream', {stream:stream});
               throw(error);
           });
}

exports.all = function(cb) {
    Logger.log('info', 'Get streams list called',{restcall: rest_api_request})
    request(request_options, function(error, response, streams){
        if(error) {
            cb(error, {})
        } else {
            if (streams.length > 0){

                var promises = streams.map((stream) => {
                    return enrichStreamWithMeta(stream)
                });

                return Promise.all(promises).then(function(streams) {
                    Logger.log('debug', 'All streams enriched');
                    cb(error, streams);
                }).catch(function(e1){
                    Logger.log('error', 'Failed enrich stream', {stream:stream});
                    cb(e1, {});
                });

            }
        }
    });
};
