'use strict';
/**
 * @file streams.js
 * @author Adam Saxén
 *
 *  Implements /vX/streams/ api calls
 */

var mysql = require('mysql');
var Promise = require('bluebird');
var Loader = require("../utils/loader");
var Logger = require("../utils/logger");
var moment = require("moment");

var StreamsModel = require("./streams");


const Connection = require('mysql/lib/Connection');
const Pool = require('mysql/lib/Pool');

require('events').EventEmitter.prototype._maxListeners = 100;

var loaded_schema;
var loaded_configuration;
var pool;
var getConnection;


Promise.promisifyAll([
    Connection,
    Pool
]);

function loadConfiguration(){
    Loader.load("./configuration.json").then(function(configuration) {
               Logger.log('info', 'Loaded configuration in streams module!');
               loaded_configuration = configuration;

               pool = mysql.createPool({
                      connectionLimit : configuration.restApiNodejs.connectionlimit,
                      host     : configuration.mysqlDatabase.host,
                      user     : configuration.mysqlDatabase.user,
                      password : configuration.mysqlDatabase.password,
                      database : loaded_schema.database.name,
                      debug    : false
               });

               getConnection = (pool) => {
                   return pool
                       .getConnectionAsync()
                       .then((connection) => {
                           Logger.log('info', 'Connection req');
                           return connection;
                       }).disposer((connection) => {
                            Logger.log('info', 'Connection released');
                            connection.release();
                        });
               };

          }).catch(function(error){
              console.log(error);
              Logger.log('error', 'Failed to load configuration in streams module');
          });
}

Loader.load("../schema.json").then(function(schema) {
            Logger.log('info', 'Loaded schema!');
            loaded_schema = schema;
            loadConfiguration();
       }).catch(function(error){
           Logger.log('error', 'Failed to load schema');
       })


// Functin for handling a database query request
function retrieve_database_connection() {
    // Promise.using makes sure disposing of connection is always performed
    return Promise.using(getConnection(pool), (connection) => {
        return connection;
    });
}

/**
* @desc Fetch stream list from mysql database
*/
exports.getStreamList = function(res) {
    retrieve_database_connection().then(function (connection){
        let streamsModel = new StreamsModel(connection, loaded_schema);
        streamsModel.getStreamList().then(function(result) {
                   res.json(result);
               }).catch(function(error){
                logger.log('error', 'Failed to get stream list.');
                res.status(500).send('Query failed');
            });
    });
}


/**
* @desc Return stream data
*
* @param {Integer} streamid
*/
exports.getStreamData = function(res, req, streamid) {
    var param_stream_id;
    var param_start_date;
    var param_end_date;
    var param_filter;

    if (streamid === undefined){
        res.status(400).send('Bad request - streamid missing');
        return;
    }
    else {
        param_stream_id = streamid;
    }

    if (req.query.filter === undefined){
        res.status(400).send('Bad request - filter missing');
        return;
    }
    else {
        param_filter = req.query.filter;
    }

    if (req.query.startdate === undefined){
        res.status(400).send('Bad request - start date missing');
        return;
    }
    else{
        param_start_date = moment(req.query.startdate);
    }

    if (req.query.enddate === undefined){
        param_end_date = moment(param_start_date);
    }
    else{
        param_end_date = moment(req.query.enddate);
    }

    if (isNaN(param_stream_id)) {
        Logger.log('error', 'Stream id is not a number', {param_stream_id: param_stream_id});
        return;
    }

    //Always add 1 day in order to get data for a complete date day
    param_end_date = param_end_date.add(1,'days');

    retrieve_database_connection().then(function (connection){
        let streamsModel = new StreamsModel(connection, loaded_schema);
        streamsModel.getStreamData(param_stream_id, param_start_date, param_end_date, param_filter).then(function(result) {
                   res.json(result);
               }).catch(function(error){
                logger.log('error', 'Failed to get stream data.');
                res.status(500).send('Internal error, Request failed');
            });
    });

}


/**
* @desc Fetch stream information from mysql database
*/
exports.getStreamInfo = function(res, streamid) {
    if (streamid === undefined){
        res.status(400).send('Bad request - streamid missing');
        return;
    }
    var param_stream_id = streamid;

    if (isNaN(param_stream_id)) {
        res.status(400).send('Bad request - streamid not a number');
        return;
    }

    retrieve_database_connection().then(function (connection){
    let streamsModel = new StreamsModel(connection, loaded_schema);
    streamsModel.getStreamInfo(param_stream_id).then(function(result) {
               res.json(result);
           }).catch(function(error){
            logger.log('error', 'Failed to get stream data.');
            res.status(500).send('Internal error, Request failed');
        });
    });
}
