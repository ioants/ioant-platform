// restserver.js

// Author: Adam Saxen

//=============================================================================
require('events').EventEmitter.prototype._maxListeners = 100;

var express = require('express');
var moment = require('moment');
var Promise = require('bluebird');
var app = express();
var mysql      = require('mysql');
var fs = Promise.promisifyAll(require("fs"));
var configuration;
var schema;

const Connection = require('mysql/lib/Connection');
const Pool = require('mysql/lib/Pool');

Promise.promisifyAll([
    Connection,
    Pool
]);


var pool;
var getConnection = (pool) => {
    return pool
        .getConnectionAsync()
        .then((connection) => {
            return connection;
        })
        .disposer((connection) => {
            connection.release();
        });
};


// Functin for handling a database query request
function request_from_database(query) {
    return Promise.using(getConnection(pool), (connection) => {
        return connection.queryAsync(query)
    });
 }


app.get('/liststreams', function (req, res) {
    var table_prefix = schema.database.messageTablePrefix;
    var stream_table = schema.database.tables[0].name;
    var column_sid_name = schema.database.tables[0].columns[0].name
    var column_message_type = schema.database.tables[0].columns[5].name
    var column_message_name = schema.database.tables[0].columns[6].name
    var column_timestamp_name = schema.database.tables[0].columns[7].name

    function getLatestTimestamp(res, total_streams, number_of_remaining_streams, rows){
        index = total_streams-number_of_remaining_streams
        row = rows[index]
        value_field = "";
        if ( row[column_message_type] == 4 || row[column_message_type] == 5 || row[column_message_type] == 6 || row[column_message_type] == 8)
            value_field = ", value AS latestvalue";
        else if (row[column_message_type] == 2 ){
            value_field = ", reference_link AS latestvalue";
        }
        else{
            value_field = "";
        }


        query = `SELECT ts ${value_field} from ${table_prefix}${row[column_sid_name]}_${row[column_message_name]} ORDER BY ts DESC LIMIT 1`;
        request_from_database(query)
            .then(function(result){
                if (typeof result[0] !== 'undefined'){
                    rows[index].update_ts = result[0].ts;
                    if (typeof result[0].latestvalue !== undefined)
                        rows[index].latestvalue = result[0].latestvalue;
                    else {
                        rows[index].latestvalue = "not applicable";
                    }
                }
                else {
                    rows[index].update_ts = "";
                    rows[index].latestvalue = "not applicable";
                }

                if (number_of_remaining_streams <= 1){
                    res.json(rows);
                }
                else{
                    number_of_remaining_streams = number_of_remaining_streams-1;
                    getLatestTimestamp(res, total_streams, number_of_remaining_streams, rows);
                }
            });
    }

    request_from_database(`SELECT * from ${stream_table}`)
    .then(function(rows){
        getLatestTimestamp(res, rows.length, rows.length, rows)
    });
});

app.get('/getstreaminfo', function (req, res) {
    var stream_table = schema.database.tables[0].name;
    var primary_field = schema.database.tables[0].primaryKey;
    if (req.query.streamid === undefined){
        res.status(400).send('Bad request - streamid missing');
        return;
    }
    param_stream_id = req.query.streamid;

    if (isNaN(param_stream_id)) {
        res.status(400).send('Bad request - streamid not a number');
        return;
    }

    request_from_database(`SELECT * from ${stream_table} WHERE ${primary_field}=${param_stream_id}`)
    .then(function(rows){
        res.json(rows);
    });
});

app.get('/getdateswithvalues', function (req, res) {
    var param_stream_id;

    if (req.query.streamid === undefined){
        res.status(400).send('Bad request - streamid missing');
        return;
    }
    param_stream_id = req.query.streamid;

    if (isNaN(param_stream_id)) {
        console.log('This is not number');
        return;
    }

    var stream_table = schema.database.tables[0].name;
    var stream_table_primary = schema.database.tables[0].primaryKey;
    request_from_database(`SELECT * from ${stream_table} WHERE ${stream_table_primary}=${param_stream_id}`)
    .then(function(rows){
        var message_name = rows[0].message_name;
        var stream_table_prefix = schema.database.messageTablePrefix;
        query = `SELECT DISTINCT(DATE(ts)) AS dates FROM ${stream_table_prefix}${param_stream_id}_${message_name}`;
        request_from_database(query)
        .then(function(result){
            if (result.length > 0){
                res.json(result);
            }
            else {
                res.status(204).send('No content');
            }
        });
    });
});



// Get stream values within a time frame
app.get('/getstreamvalues', function (req, res) {
    var param_stream_id;
    var param_start_date;
    var param_end_date;
    var param_filter;

    if (req.query.streamid === undefined){
        res.status(400).send('Bad request - streamid missing');
        return;
    }
    param_stream_id = req.query.streamid;

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
        console.log('adding 1 day');
        param_end_date = moment(param_start_date);
    }
    else{
        param_end_date = moment(req.query.enddate);
    }

    if (isNaN(param_stream_id)) {
        console.log('This is not number');
        return;
    }

    //Allways add 1 day in order to get for the complete date day
    param_end_date = param_end_date.add(1,'days');

    var stream_table = schema.database.tables[0].name;
    var stream_table_primary = schema.database.tables[0].primaryKey;
    request_from_database(`SELECT * from ${stream_table} WHERE ${stream_table_primary}=${param_stream_id}`)
    .then(function(rows){
        console.log(rows);
        var message_name = rows[0].message_name;
        console.log(rows[0].message_name);
        var stream_table_prefix = schema.database.messageTablePrefix;
        var start_unix_timestamp = param_start_date.unix();
        var end_unix_timestamp = param_end_date.unix();

        query = `SELECT * from ${stream_table_prefix}${param_stream_id}_${message_name} \
                 WHERE ts BETWEEN FROM_UNIXTIME(${start_unix_timestamp}) AND FROM_UNIXTIME(${end_unix_timestamp})  \
                 AND (id % ${param_filter}) = 0 ORDER BY ts DESC`;

        query_unfiltered = `SELECT * from ${stream_table_prefix}${param_stream_id}_${message_name} \
                 WHERE ts BETWEEN FROM_UNIXTIME(${start_unix_timestamp}) AND FROM_UNIXTIME(${end_unix_timestamp})  \
                 ORDER BY ts DESC`;

        request_from_database(query)
        .then(function(rows){
            console.log('Number of rows:' + rows.length);
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
                });
            }
        });
    });
});

app.get('/getavailablesystopics', function (req, res) {
    var sys_topic_table = schema.database.tables[2].name;
    request_from_database(`SELECT * from ${sys_topic_table}`)
    .then(function(rows){
        if (rows.length > 0){
            res.json(rows);
        }
        else {
            res.status(204).send('No content');
        }
    });

});

//TODO add timeframe possiblity now only latest (LIMIT 1)
app.get('/getsystopicvalues', function (req, res) {
    var param_sys_topic_key;
    var param_start_date;
    var param_end_date;
    var get_latest = false;

    if (req.query.systopic === undefined){
        res.status(400).send('Bad request - systopic missing');
        return;
    }
    param_sys_topic_key = req.query.systopic;

    if (isNaN(param_sys_topic_key)) {
        console.log('This is not number');
        return;
    }

    if (req.query.startdate === undefined){
        get_latest = true;
    }
    else{
        param_start_date = moment(req.query.startdate);
    }

    if (req.query.enddate === undefined){

    }
    else{
        param_end_date = moment(req.query.enddate);
    }

    var sys_table = schema.database.tables[1];
    var sys_table_timestamp = schema.database.tables[1].columns[3].name;
    var fk_key = sys_table.columns[1].name;
    var sys_table_name = sys_table.name;
    var query = `SELECT * from ${sys_table_name} WHERE ${fk_key}=${param_sys_topic_key} ORDER BY ${sys_table_timestamp} DESC LIMIT 1`
    console.log(query)
    request_from_database(query)
    .then(function(rows){
        if (rows.length > 0){
            res.json(rows);
        }
        else {
            console.log("no result")
            res.status(204).send('No content');
        }
    });
});

var parseJson = function(contents) {
    return new Promise(function (resolve, reject) {
        var jsonObject = JSON.parse(contents);
        resolve(jsonObject);
	})};

var setup = function() {

    var p1 = fs.readFileAsync('../configuration.json', 'utf8')
           .then(parseJson);

    var p2 = fs.readFileAsync('../schema.json', 'utf8')
          .then(parseJson);

    return Promise.join(p1, p2, function(configurationObject, schemaObject) {
        configuration = configurationObject;
        schema = schemaObject;
        startApplication();
    });
}

var startApplication = function(){

    pool      =    mysql.createPool({
        connectionLimit : configuration.restApiNodejs.connectionlimit,
        host     : configuration.mysqlDatabase.host,
        user     : configuration.mysqlDatabase.user,
        password : configuration.mysqlDatabase.password,
        database : schema.database.name,
        debug    :  false
    });

    var server = app.listen(configuration.restApiNodejs.port, function () {
        var host = server.address().address;
        var port = server.address().port;
        console.log("Rest server started and listening at http://%s:%s", host, port)
    })
}

//=============================================================================
// Entry point of application
//=============================================================================
setup();
