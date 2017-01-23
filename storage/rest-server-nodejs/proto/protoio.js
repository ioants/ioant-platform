'use strict';

var loaded_proto;
var message_list_proto;
var Promise = require('bluebird');
var protobuf = Promise.promisifyAll(require("protobufjs"));


var loadProtoDefinition = function(){
    return protobuf.loadAsync("./proto/messages.proto").then((root) =>{
        message_list_proto = Object.keys(root.nested);
        message_list_proto.shift();
        loaded_proto = root;
        return new Promise((resolve, reject) => {
            resolve(loaded_proto);
        })
    });
}

exports.underScore = function (str) {
     return str.substring(0,1)
          + str.substring(1)
                .replace(/([A-Z])(?=[a-z]|$)/g, function($0, $1) { return "_" + $1.toLowerCase(); });
 }

exports.swap = function (obj_proto){
  var ret = {};
  for(var key in obj_proto){
    ret[obj_proto[key]] = key;
  }
  return ret;
}

exports.getProtoDefinition = function(cb) {
    if (loaded_proto == null){
        loadProtoDefinition(cb);
    }
    else {
        cb(loaded_proto);
    }
};

exports.enumerate = function(message_name){
    if (loaded_proto == null){
        loadProtoDefinition(function (root){
            return message_list_proto.indexOf(message_name);
        });
    }
    else {
        return message_list_proto.indexOf(message_name);
    }
}

exports.getProtoMessage = function(message_type) {
    if (loaded_proto == null){
        return loadProtoDefinition().then((loaded_proto) => {
            return new Promise(function (resolve, reject){
                resolve(loaded_proto.nested[message_list_proto[message_type]]);
            });
        })
    }
    else {
        return new Promise(function (resolve, reject){
            resolve(loaded_proto.nested[message_list_proto[message_type]]);
        });
    }
};
