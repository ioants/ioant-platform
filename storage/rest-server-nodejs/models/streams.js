'use strict';
/**
 * @file streams.js
 * @author Adam Saxén
 *
 *  Implements /vX/streams/ api calls
 */

var mysql = require('mysql');
var StreamModel = require("./stream");
var Promise = require('bluebird');
var Loader = require("../utils/loader");
var Logger = require("../utils/logger");
var protoio = require('../proto/protoio');
var moment = require('moment');

const Connection = require('mysql/lib/Connection');
const Pool = require('mysql/lib/Pool');

require('events').EventEmitter.prototype._maxListeners = 100;

var loaded_schema;
var loaded_configuration;
var pool;
var getConnection;
protoio.getProtoDefinition(function(root){})

Promise.promisifyAll([
    Connection,
    Pool
]);

function loadConfiguration(){
    Loader.load("./../configuration.json").then(function(configuration) {
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
                           return connection;
                       })
                       .disposer((connection) => {
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
function request_from_database(query) {
    // Promise.using makes sure disposing of connection is always performed
    return Promise.using(getConnection(pool), (connection) => {
        return connection.queryAsync(query)
    });
 }


/**
* @desc Fetch stream list from mysql database
*/
exports.getStreamList = function(res) {
    Logger.log('info', 'Get stream list');
    var table_prefix = loaded_schema.database.messageTablePrefix;
    var stream_table = loaded_schema.database.tables[0].name;
    var column_sid_name = loaded_schema.database.tables[0].columns[0].name;
    var column_message_type = loaded_schema.database.tables[0].columns[5].name;
    var column_message_name = loaded_schema.database.tables[0].columns[6].name;
    var column_timestamp_name = loaded_schema.database.tables[0].columns[7].name;

    /**
     * @desc internal recursive method for retrieving latest received message of a stream.
     */
    function getLatestData(res, total_streams, number_of_remaining_streams, rows){
        var index = total_streams-number_of_remaining_streams;
        var row = rows[index];
        protoio.getProtoMessage(row[column_message_type], function(message){
            var fields = Object.keys(message.fields);
            Logger.log('info', fields);
            var latest_value_field = protoio.underScore(fields[0]);

            query = `SELECT ts, ${latest_value_field} AS latestvalue from ${table_prefix}${row[column_sid_name]}_${row[column_message_name]} ORDER BY ts DESC LIMIT 1`;
            request_from_database(query)
                .then(function(result){
                    Logger.log('info',result);
                    rows[index].latest_value = result[0].latestvalue;
                    rows[index].update_ts = result[0].ts;
                    if (number_of_remaining_streams <= 1){
                        // End of recursion. call request callback function.
                        res.json(rows);
                    }
                    else {
                        // Continue recursion.
                        number_of_remaining_streams = number_of_remaining_streams-1;
                        getLatestData(res, total_streams, number_of_remaining_streams, rows);
                    }
                }).catch(function(error){
                    logger.log('error', 'Failed to get stream list (recursive).');
                    res.status(500).send('Query failed');
                });
        });

    }

    // Fetch stream list and call addiotional query on results.
    var query = `SELECT * from ${stream_table}`;
    request_from_database(query)
    .then(function(rows){
        getLatestData(res, rows.length, rows.length, rows);
    }).catch(function(error){
        logger.log('error', 'Failed to get stream list.');
        res.status(500).send('Query failed');
    });
};


/**
* @desc Return stream data
*
* @param {Integer} streamid
*/
exports.getStream = function(res, req, streamid) {
    Logger.log('info', 'Get stream data for id:',{streamid: streamid});

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

    //Always add 1 day in order to get for the complete date day
    param_end_date = param_end_date.add(1,'days');

    var stream_table = loaded_schema.database.tables[0].name;
    var stream_table_primary = loaded_schema.database.tables[0].primaryKey;
    request_from_database(`SELECT * from ${stream_table} WHERE ${stream_table_primary}=${param_stream_id}`)
    .then(function(rows){
        var message_name = rows[0].message_name;
        var stream_table_prefix = loaded_schema.database.messageTablePrefix;
        var start_unix_timestamp = param_start_date.unix();
        var end_unix_timestamp = param_end_date.unix();

        var query = `SELECT * from ${stream_table_prefix}${param_stream_id}_${message_name} \
                 WHERE ts BETWEEN FROM_UNIXTIME(${start_unix_timestamp}) AND FROM_UNIXTIME(${end_unix_timestamp})  \
                 AND (id % ${param_filter}) = 0 ORDER BY ts DESC`;

        var query_unfiltered = `SELECT * from ${stream_table_prefix}${param_stream_id}_${message_name} \
                 WHERE ts BETWEEN FROM_UNIXTIME(${start_unix_timestamp}) AND FROM_UNIXTIME(${end_unix_timestamp})  \
                 ORDER BY ts DESC`;

        request_from_database(query)
        .then(function(rows){
            if (rows.length > 0){
                res.json(rows);
            }
            else {
                // Try again without filter
                request_from_database(query_unfiltered)
                .then(function(rows){
                    if (rows.length > 0){
                        res.json(rows);
                    }
                    else {
                        res.status(204).send('No content');
                    }
                }).catch(function(error){
                    logger.log('error', 'Failed to get stream information.', {streamid:streamid});
                    res.status(500).send('Query failed');
                });;
            }
        });
    });
};


/**
* @desc Fetch stream information from mysql database
*/
exports.getStreamInfo = function(res, streamid) {
    Logger.log('info', 'Get stream info');

    var stream_table = loaded_schema.database.tables[0].name;
    var primary_field = loaded_schema.database.tables[0].primaryKey;
    if (streamid === undefined){
        res.status(400).send('Bad request - streamid missing');
        return;
    }
    var param_stream_id = streamid;

    if (isNaN(param_stream_id)) {
        res.status(400).send('Bad request - streamid not a number');
        return;
    }

    request_from_database(`SELECT * from ${stream_table} WHERE ${primary_field}=${param_stream_id}`)
    .then(function(rows){
        res.json(rows);
    }).catch(function(error){
        logger.log('error', 'Failed to get stream information.', {streamid:streamid});
        res.status(500).send('Query failed');
    });
}
