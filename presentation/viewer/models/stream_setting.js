'use strict';
/**
 * @file stream_setting.js
 * @author Adam Saxén
 *
 *  Module for settings associated with a stream
 */

var db = require('../db');
var streamOptions = require('./stream_options');
var Proto = require('ioant-proto');
const Logger = require('ioant-logger');
var Loader = require('ioant-loader');

let configuration;
Loader.load('./configuration.json', 'configuration').then((config) => {
    configuration = config;
}).catch(function(error){
      Logger.log('error', 'Failed to load asset: configuration');
});


var streamSetting = {
                     name : "Stream name",
                     template : streamOptions.getStreamTemplates(),
                     filter: 10,
                     dataTable : {
                        tableTitle: "Table title",
                        show : streamOptions.getStreamBooleans(),
                        maxNumberOfRows : 10
                     },
                     charts : {}
                 };

var chartSetting = {
                    title : "Chart title",
                    xLabel: "X label",
                    yLabel: "Y label",
                    type : streamOptions.getChartTypes(),
                    fieldName : "",
                    }

var fieldTypes = {
                  streamId : 0,
                  title : "string",
                  tableTitle: "string",
                  show : true,
                  dataTable: {},
                  charts: {},
                  maxNumberOfRows : 0,
                  template : "string",
                  type : "string",
                  fieldName: "string",
                  xLabel: "string",
                  yLabel: "string",
                  filter: 0,
                  name : "string"
              };


function convertValue(key, value){
    if (typeof fieldTypes[key] === 'string'){
        //Do nothing, alredy a string
    }
    else if(typeof fieldTypes[key] === 'number'){
        value = parseInt(value);
    }
    else if(typeof fieldTypes[key] === 'boolean'){
        if (value == 'true')
            value = true;
        else if (value == 'false')
            value = false;
    }
    else if (typeof fieldTypes[key] === 'object'){
        value = {};
    }
    else {
        Logger.log('error', 'Failed to indentify field type',{field: key, type : typeof fieldTypes[key]})
    }
    return value;
}

function populateDocument(queryResults){
    var documentToStore = {};
    documentToStore['streamId'] =  convertValue("streamId", queryResults["streamId"]);

    for(var key in streamSetting){
        documentToStore[key] = convertValue(key, queryResults[key]);
    }

    for(var key in streamSetting.dataTable){
        documentToStore['dataTable'][key] = convertValue(key, queryResults[key]);
    }

    for(var key in streamSetting.dataTable){
        documentToStore['dataTable'][key] = convertValue(key, queryResults[key]);
    }

    documentToStore['charts'] = [];
    var currentIndex = -1;
    var i = -1;
    for(var key in queryResults){
        var res = key.split("_");
        if (res.length > 1){
            if (currentIndex != res[1]){
                currentIndex = res[1];
                i++;
                documentToStore['charts'].push({})
            }
            let value = convertValue(res[0], queryResults[key]);
            documentToStore['charts'][i][res[0]] = value;
        }
    }

    return documentToStore;
}

exports.get = function(streamId, messageType, cb) {
    Proto.getProtoMessage(messageType).then((message) => {
        chartSetting.fieldName = Object.keys(message.fields);
        var collection = db.get().collection(configuration.mongoDbServer.streamConfigurationCollectionName)
        collection.findOne({streamId: parseInt(streamId)}, function (err, config) {
              if (config !== null){
                  cb(err, {settingFound: config, streamSetting: streamSetting, chartSetting: chartSetting});
              }
              else{
                  cb(err, {settingFound: false, streamSetting: streamSetting, chartSetting: chartSetting});
              }
        });
    }).catch(function(error){
         Logger.log('error', 'Failed to get proto message', {messageType:messageType});
    });
};

exports.save = function(req, cb) {
    Logger.log('debug', 'Insert success! For stream id',{query : req.query})
    var documentToStore = populateDocument(req.query);

    var collection = db.get().collection(configuration.mongoDbServer.streamConfigurationCollectionName)
    // Does it exists?
    collection.findOne({streamId: parseInt(req.query.streamId)}, function (err, config) {
          if (config !== null){
              // Yes
              collection.deleteOne({streamId: parseInt(req.query.streamId)}, function (err, result) {
                    if (result !== null){
                        //Removed!
                        // Now insert
                        collection.insertOne( documentToStore, function(err, result) {
                            if (result !== null){
                                Logger.log('info', 'Insert success! For stream id',{streamId : req.query.streamId})
                            }
                            else{
                                Logger.log('error', 'Failed to add settings for stream',{streamId : req.query.streamId})
                            }
                            cb(err, result);
                          });
                    }
                    else{
                        // Failed to insert
                        Logger.log('error', 'Failed to remove settings for stream',{streamId : req.query.streamId})
                        cb(err, result);
                    }
              });
          }
          else{
              // Nothing in collection. Add
              collection.insertOne( documentToStore, function(err, result) {
                  if (result !== null){
                      Logger.log('info', 'Insert success! For stream id',{streamId : req.query.streamId})
                  }
                  else{
                      Logger.log('error', 'Failed to add settings for stream',{streamId : req.query.streamId})
                  }
                  cb(err, result);
                });
          }
    });

}
