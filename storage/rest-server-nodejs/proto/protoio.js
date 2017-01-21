'use strict';
var protobuf = require("protobufjs");
var loaded_proto;
var message_list_proto;

var loadProtoDefinition = function(cb){
    protobuf.load("./proto/messages.proto", function(err, root) {
        if (err) throw err;
        message_list_proto = Object.keys(root.nested);
        message_list_proto.shift();
        loaded_proto = root;
        cb(root);
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

exports.getProtoMessage = function(message_type, cb) {
    if (loaded_proto == null){
        loadProtoDefinition(function (root){
            cb(loaded_proto.nested[message_list_proto[message_type]]);
        });
    }
    else {
        cb(loaded_proto.nested[message_list_proto[message_type]]);
    }
};
