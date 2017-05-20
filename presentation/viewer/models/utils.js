'use strict';
/**
 * @file utils.js
 * @author Adam Saxén
 *
 *  utils used in several files
 */

var Proto = require('ioant-proto');

exports.getImageOfMessageType = function(message_type) {
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
