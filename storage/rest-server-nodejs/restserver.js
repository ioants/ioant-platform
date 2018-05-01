/**
 * @file restserver.js
 * @author Adam Saxén
 *
 * Main entry point for restserver application
 */

var express = require('express');
var Promise = require('bluebird');
const Logger = require('ioant-logger');
Logger.setup(__dirname + '/logs/', 'debug', 'debug', 'debug');
var Loader = require('ioant-loader');
var modelIndex = require('./models/index.js');

// Set up express
var app = express();


// Determine what configuration file to load
var configuration_path = 'configuration.json';

if (typeof process.argv[2] !== 'undefined'){
    //IF started with npm without specifying configuration file, then argv[2] will be 'index.js'
    if (process.argv[2] !== 'index.js'){
        Logger.log('info', "Started with configuration file:", {file:process.argv[2]});
        configuration_path = process.argv[2];
    }
}
///

var startApplication = function(port){
    Logger.log('info', 'Starting application');
    app.use(require('./controllers'));
    var server = app.listen(port, function () {
        var host = server.address().address;
        var port = server.address().port;
        Logger.log('info', "Rest server started and listening at " + host +":"+ port);
    });
    modelIndex.loadAssets();
}

var main = function(){
    var p1 = Loader.load(configuration_path, "configuration").then(function(configuration) {
                Logger.log('info', 'Loaded configuration!', {configuration:configuration});
                loaded_configuration = configuration;
           }).catch(function(error){
               Logger.log('error', 'Failed to load configuration');
	       });
    var p2 = Loader.load("../schema.json", "schema").then(function(schema) {
               Logger.log('info', 'Loaded schema!');
          }).catch(function(error){
              Logger.log('error', 'Failed to load schema');
          });
    Promise.join(p1, p2, function() {
        startApplication(loaded_configuration.restApiNodejs.port);
    });
}

// Entry point of application
if (require.main === module) {
    main();
}

process.on( 'SIGINT', function() {
    Logger.log('info', 'Gracefully shutting down from SIGINT (Ctrl-C)');
    process.exit();
})
