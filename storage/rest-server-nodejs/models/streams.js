'use strict';
/**
 * @file streams.js
 * @author Adam Saxén
 *
 *  Implements /vX/streams/ api calls
 */

var Promise = require('bluebird');
var Loader = require("ioant-loader");
var Logger = require("ioant-logger");
var protoio = require('ioant-proto');
var moment = require('moment');

protoio.setup("proto/messages.proto");


class StreamsModel {
  /**
   * Constructor - inject the database connection into the service.
   *
   * @param {object} db - A db connection
   */
  constructor(db, schema) {
      this.db = db;
      this.schema = schema;
      this.getLatestData.bind(this);
  }

   /**
   * @desc recursive method for retrieving latest received message of a stream.
   */
    getLatestData(row){
         var column_sid_name = this.schema.database.tables[0].columns[0].name;
         var column_message_type = this.schema.database.tables[0].columns[5].name;
         var column_message_name = this.schema.database.tables[0].columns[6].name;
         var column_timestamp_name = this.schema.database.tables[0].columns[7].name;
         var table_prefix = this.schema.database.messageTablePrefix;
         return protoio.getProtoMessage(row[column_message_type])
               .then((message) => {
                    var fields = Object.keys(message.fields);
                    Logger.log('debug', 'Message fields:', {fields:fields});
                    var latest_value_field = protoio.underScore(fields[0]);
                    return new Promise((resolve, reject) =>{
                        resolve(latest_value_field);
                    });
                })
                .then(latest_value_field => {
                    let query = `SELECT ts, ${latest_value_field} AS latestvalue from ${table_prefix}${row[column_sid_name]}_${row[column_message_name]} ORDER BY ts DESC LIMIT 1`;
                    Logger.log('debug', 'Latest value query:', {query:query});
                    return this.db.queryAsync(query)
                            .then(function(result){
                                return new Promise(function (resolve, reject){
                                    if (result.length > 0){
                                        row.latest_value = result[0].latestvalue;
                                        row.update_ts = result[0].ts;
                                    }
                                    else {
                                        // No latest value found, but stream exists
                                        row.latest_value = 42;
                                        row.update_ts = moment().format("YYYY-MM-DD");
                                    }
                                    resolve(row);
                                })
                            }).catch(function(error){
                                Logger.log('error', 'Failed to get stream list latest values.', {query:query});
                                throw error;
                            });
                });
    };

    /**
    * @desc getStreamList method, for retrieving stream list
    * @return {Promise} - resolves list of streams
    */
    getStreamList() {
        Logger.log('debug', 'Get stream list');
        var stream_table = this.schema.database.tables[0].name;

        var query = `SELECT * from ${stream_table}`;
        Logger.log('debug', 'Stream list query:', {query:query});
        return this.db.queryAsync(query).then((rows) =>{
            var actions = rows.map((row) => {
                return this.getLatestData(row)});
            return Promise.all(actions);
        }).catch(function(error){
            Logger.log('error', 'Failed to get stream list.', {error:error});
            throw error;
        });
    };


    /**
    * @desc getStreamInfo method, for retrieving meta info of a stream
    *
    * @param {Integer} streamid - the stream id
    * @return {Promise} - resolves rows array
    */
    getStreamInfo(streamid) {
        Logger.log('debug', 'Get stream meta info', {streamid:streamid});
        var stream_table = this.schema.database.tables[0].name;
        var primary_key_field = this.schema.database.tables[0].primaryKey;

        var query = `SELECT * from ${stream_table} WHERE ${primary_key_field}=${streamid}`;
        return this.db.queryAsync(query)
                .catch(function(error){
                    Logger.log('error', 'Failed to get stream meta info.', {streamid:streamid});
                    throw error;
                });
    };


    /**
    * @desc getStreamData method, for retrieving data of a stream
    *
    * @param {Integer} streamid - the stream id
    * @param {String} startdate - Start date [moment]
    * @param {String} enddate - End date [moment]
    * @param {Integer} filter - Filter. Select every [filter]:e row
    *
    * @return {Promise} - resolves rows of stream data
    */
    getStreamData(streamid, startdate, enddate, filter) {
        Logger.log('debug', 'Get stream data', {streamid:streamid});
        var stream_table = this.schema.database.tables[0].name;

        var query = `SELECT * from ${stream_table}`;
        return this.getStreamInfo(streamid).then((metainfo) =>{
            var message_name = metainfo[0].message_name;
            var stream_table_prefix = this.schema.database.messageTablePrefix;
            var start_unix_timestamp = startdate.unix();
            var end_unix_timestamp = enddate.unix();

            var query = `SELECT * from ${stream_table_prefix}${streamid}_${message_name} WHERE ts BETWEEN FROM_UNIXTIME(${start_unix_timestamp}) AND FROM_UNIXTIME(${end_unix_timestamp}) AND (id % ${filter}) = 0 ORDER BY ts DESC`;

            return this.db.queryAsync(query).then((rows) => {
                    if (rows.length > 0){
                        return new Promise((resolve, reject) =>{
                            resolve(rows);
                        });
                    }
                    else {
                        // Attempt to get data again, but where filter is not applied
                        var query_unfiltered = `SELECT * from ${stream_table_prefix}${streamid}_${message_name} WHERE ts BETWEEN FROM_UNIXTIME(${start_unix_timestamp}) AND FROM_UNIXTIME(${end_unix_timestamp}) ORDER BY ts DESC`;
                        return this.db.queryAsync(query_unfiltered);
                    }
                })
                 .catch(function(error){
                     Logger.log('error', 'Failed to get stream data.', {query:query});
                     throw error;
                 });

        }).catch(function(error){
            Logger.log('error', 'Failed to get stream data.', {streamid:streamid});
            throw error;
        });
    };


}
module.exports = StreamsModel;
