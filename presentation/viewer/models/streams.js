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

function getImageOfMessageType(message_type) {
     switch(message_type) {
        case Proto.enumerate("Configuration"):
            return "/img/icons/nut-icon.png"
            break;
        case Proto.enumerate("Temperature"):
            return "/img/icons/temperature.png"
            break;
        case Proto.enumerate("Humidity"):
            return "/img/icons/umbrella-and-raindrops.png"
            break;
        case Proto.enumerate("Mass"):
            return "/img/icons/noun_16817.svg"
            break;
        case Proto.enumerate("ElectricPower"):
            return "/img/icons/lighting-button.png"
            break;
        case Proto.enumerate("GpsCoordinates"):
            return "/img/icons/map-pin-marked.png"
            break;
        case Proto.enumerate("RunStepperMotorRaw"):
            return "/img/icons/noun_526896_cc.png"
            break;
        case Proto.enumerate("RunStepperMotor"):
            return "/img/icons/noun_526896_cc.png"
            break;
        case Proto.enumerate("RunDcMotor"):
            return "/img/icons/noun_526896_cc.png"
            break;
        case Proto.enumerate("BootInfo"):
            return "/img/icons/power-button-outline.png"
            break;
        case Proto.enumerate("Image"):
            return "/img/icons/photo-camera-outline.png"
            break;
        case Proto.enumerate("Trigger"):
            return "/img/icons/bell-ringing.png"
            break;
        case Proto.enumerate("Illuminance"):
            return "/img/icons/noun_172630_cc.png"
            break;
        default:
            return "/img/icons/layers-icon.png"
      }
}

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

               stream.image_type_url = getImageOfMessageType(stream.message_type);
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
