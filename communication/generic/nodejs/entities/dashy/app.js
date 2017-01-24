/**
 * @file app.js
 * @author Simon Lövgren
 *
 * Main entry point for Dashy (Real Time IOAnt Dashboard)
 */

//////////// MODULES ///////////
var Express = require('express');
var Promise = require('bluebird');
var Logger = require('./utils/logger.js');
var Loader = require('./utils/loader.js');

//////////// VARIABLES ///////////
// -- Express web server
var app = Express();
var server = null;
var config = null;

// Initial setup
app.use(require('./routes.js'));

//////////// FUNCTIONS ///////////
function startApplication() {
    // start application
    server = app.listen(config.dashy.port, function () {
        Logger.log('info', "Dashy started, listening on " +
                   server.address().address + ":" +
                   server.address().port
                  ); 
   });
}

function main() {
    Logger.log('info', 'Starting application (Dashy)');
    Loader.load('./configuration.json').then(function(configuration){
        config = configuration;
        Logger.log('info', 'Loaded configuration.', {configuration: config});
        startApplication();
    }).catch(function(e){
        Logger.log('error', 'Failed to start application (Dashy)');
    });
}

//////////// ENTRY POINT  ///////////
if (require.main === module) {
    main();
}

process.on('SIGINT', function(){
    logger.log('info', 'Gracefully shutting down from SIGINT (CTRL-C)');
    if(server !== null) {
        server.close();
    }
    process.exit();
});
