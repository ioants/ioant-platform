'use strict';
/**
 * @file app.js
 * @author Adam Saxén
 *
 *  Main file for Viewer application
 */
 var Logger = require('ioant-logger');
 Logger.setup(__dirname + 'logs/', 'info', 'info', 'info');
 var Proto = require('ioant-proto');
 var Loader = require('ioant-loader');

 Proto.setup('proto/messages.proto');


var express = require('express')
  , app = express()

var db = require('./db')

var Promise = require('bluebird');

// Determine what configuration file to load
var configuration_path = 'configuration.json';

if (typeof process.argv[2] !== 'undefined'){
    //IF started with npm without specifying configuration file, then argv[2] will be 'index.js'
    if (process.argv[2] !== 'index.js'){
        Logger.log('info', "Started with configuration file:", {file:process.argv[2]});
        configuration_path = process.argv[2];
    }
}

var setup = function() {

    var p1 = Loader.load(configuration_path, 'configuration');
    var p2 = Proto.loadProtoDefinition();

    return Promise.join(p1, p2, function(configuration, proto) {
        Logger.log('info', "Starting application");

        app.engine('pug', require('pug').__express)
        app.set('view engine', 'pug')
        app.use(express.static(__dirname + '/public'))
        app.use(require('./controllers'))

        startApplication(configuration);
    });
}

var startApplication = function(config){
    db.connect('mongodb://localhost:'+config.mongoDbServer.port+'/'+config.mongoDbServer.database, function(err) {
        if (err) {
            Logger.log('error', 'Unable to connect to MongoDB.', {config:config});
            process.exit(1)
        } else {
            app.listen(config.port, function() {
                Logger.log('info', 'Application running and listening on port: ',{port: config.port})
            })
        }
    })
}

//=============================================================================
// Entry point of application
//=============================================================================
setup();
