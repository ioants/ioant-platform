/**
 * @file app.js
 * @author Simon Lövgren
 *
 * Main entry point for Dashy (Real Time IOAnt Dashboard)
 */

//////////// MODULES ///////////
var Express = require('express');
var Promise = require('bluebird');
var Logger  = require('./utils/logger.js');
var Loader  = require('./utils/loader.js');
var MQTT    = require('mqtt');

//////////// VARIABLES ///////////
// -- Express web server
var express = Express();
var server = null;
var server_running = false;
var config = null;

// -- MQTT
var mqtt = null;

// Initial setup
express.use(require('./routes.js'));

//////////// FUNCTIONS ///////////
function startApplication() {
    // start web server
    server = express.listen(config.dashy.port, function () {
        Logger.log('info', 'Dashy webserver started, listening on ' +
                   (server.address().address ? server.address().address : 'localhost') + ':' +
                   server.address().port
                  );
        server_running = true;
    });

    // start MQTT client
    {
        var broker = 'mqtt://' + config.mqtt.broker + (config.mqtt.port ? ':' + config.mqtt.port : '');
        var options = {};
        Logger.log('info', 'Connecting to MQTT (' + broker  +').');
        if(config.mqtt.user) {
            options.username = config.mqtt.user.trim();
            Logger.log('info', 'As user: "' + options.username + '"');
        } else {
            Logger.log('info', 'As user: NO.');
        }
        if(config.mqtt.password) {
            options.password = config.mqtt.password.trim();
            Logger.log('info', 'Using password.')
        } else {
            Logger.log('info', 'Using password: NO.')
        }
        mqtt = MQTT.connect(broker);

    }
}

function main() {
    Logger.log('info', 'Starting application (Dashy)');
    Loader.load('./configuration.json').then(function(configuration){
        config = configuration;
        Logger.log('info', 'Loaded configuration.', {configuration: config});
        startApplication();
    }).catch(function(e){
        Logger.log('error', 'Failed to start application (Dashy)', e);
        terminate();
    });
}

function terminate() {
    Logger.log('info', 'Terminating the application, good bye!');
    // Close web server
    if(server !== null && server_running) {
        server.close();
    }
    // Close MQTT client
    if(mqtt !== null && mqtt.connected) {
        mqtt.end();
    }
}

//////////// ENTRY POINT  ///////////
if (require.main === module) {
    main();
}

process.on('SIGINT', function(){
    console.log(""); // Move to line after printed ^C
    Logger.log('info', 'Gracefully shutting down from SIGINT (CTRL-C)');
    terminate();
    process.exit();
});
