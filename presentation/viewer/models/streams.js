var db = require('../db')

var request = require('request');
var moment = require('moment');
var config = require('../configuration.json');
var protoio = require('./../proto/protoio');
const winston = require('winston');


function getImageOfMessageType(message_type) {
    console.log("Trying!:" + message_type)
     switch(message_type) {
        case protoio.enumerate("Temperature"):
            return "/img/icons/temperature.png"
            break;
        case protoio.enumerate("Humidity"):
            return "/img/icons/umbrella-and-raindrops.png"
            break;
        case protoio.enumerate("Mass"):
            return "/img/icons/jar-almost-full-outline.png"
            break;
        case protoio.enumerate("ElectricPower"):
            return "/img/icons/lighting-button.png"
            break;
        case protoio.enumerate("GpsCoordinates"):
            return "/img/icons/map-pin-marked.png"
            break;
        case protoio.enumerate("RunStepperMotorRaw"):
            return "/img/icons/nut-icon.png"
            break;
        case protoio.enumerate("RunStepperMotor"):
            return "/img/icons/nut-icon.png"
            break;
        case protoio.enumerate("RunDcMotor"):
            return "/img/icons/nut-icon.png"
            break;
        case protoio.enumerate("BootInfo"):
            return "/img/icons/power-button-outline.png"
            break;
        case protoio.enumerate("Image"):
            return "/img/icons/photo-camera-outline.png"
            break;
        case protoio.enumerate("Trigger"):
            return "/img/icons/bell-ringing.png"
            break;
        default:
            return "/img/icons/layers-icon.png"
      }
}

rest_api_request = config.restApiServer.url + ":" + config.restApiServer.port;

const request_options = {
    method: 'GET',
    uri: rest_api_request+'/liststreams',
    json: true
}


exports.all = function(cb) {
    winston.log('info', 'Get stream list called',{restcall: rest_api_request})
    request(request_options, function(error, response, body){
        if(error) {
            cb(error, body)
        } else {
            if (body.length > 0){
                for (var key in body){
                    var stream = body[key];
                    stream.image_type_url = getImageOfMessageType(stream.message_type);
                    tempMoment = moment(stream.update_ts);
                    timeStampNow = moment();
                    stream.update_ts = tempMoment.format('MMMM Do YYYY, H:mm:ss');
                    stream.latest_value_date = tempMoment.format('YYYY-MM-DD');
                    //Calc duration since last message
                    duration = moment.duration(timeStampNow.diff(tempMoment));
                    stream.ts_diff = Math.round( duration.asHours() * 10 ) / 10;
                }
                cb(error, body);
            }
        }
    });

}
