/**
 * @file restserver.js
 * @author Adam Saxén
 *
 * Main entry point for restserver application
 */

var express = require('express');
var Promise = require('bluebird');
const logger = require('./utils/logger');
var Loader = require('./utils/loader.js');
var loaded_configuration;
// Set up express
var app = express();
app.use(require('./controllers'));

// Capture CLI arguments
//var argv = require('minimist')(process.argv.slice(2));


var startApplication = function(){
    var server = app.listen(loaded_configuration.restApiNodejs.port, function () {
        var host = server.address().address;
        var port = server.address().port;
        logger.log('info', "Rest server started and listening at " + host +":"+ port);
    })
}

var main = function(){
    logger.log('info', 'Starting application');
    Loader.load("./configuration.json").then(function(configuration) {
                logger.log('info', 'Loaded configuration!', {configuration:configuration});
                loaded_configuration = configuration;
                startApplication();
           }).catch(function(error){
               logger.log('error', 'Failed to start application');
	       });
}

// Entry point of application
if (require.main === module) {
    main();
}


process.on( 'SIGINT', function() {
    logger.log('info', 'Gracefully shutting down from SIGINT (Ctrl-C)');
    process.exit();
})
