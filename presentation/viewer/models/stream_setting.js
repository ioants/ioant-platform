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
var deepcopy = require("deepcopy");

let configuration;
Loader.getLoadedAsset('configuration').then((config) => {
    configuration = config;
}).catch(function(error){
      Logger.log('error', 'Failed to load asset: configuration');
});


var streamSetting = {
                     name : "Stream name",
                     presentationTemplate : streamOptions.getStreamTemplates(),
                     filter: 10,
                     viewNumberOfDays: 1,
                     dataTable : {
                        tableTitle: "Table title",
                        show : true,
                        maxNumberOfRows : 10
                     },
                     subcharts : {}
                 };

var subchartSetting = {
                     title : "Chart title",
                     xLabel: "X label",
                     yLabel: "Y label",
                     type : streamOptions.getChartTypes(),
                     fieldName : "",
                     yMax  : 0,
                     yMin  : 0
                 }

var fieldMetaList = {
                  streamId : ["Stream ID", 0],
                  title : ["Title", "string"],
                  tableTitle: ["Table title", "string"],
                  show : ["Show data table", true],
                  dataTable: ["Table settings", {}],
                  subcharts: ["Add a subchart", {}],
                  compositecharts: ["Combine Streams", {}],
                  maxNumberOfRows : ["Number of rows to show", 0],
                  presentationTemplate : ["Presentation Template", "string"],
                  type : ["Chart type", "string"],
                  fieldName: ["Select message field", ""],
                  xLabel: ["Label for x axis", "string"],
                  yLabel: ["Label for y axis", "string"],
                  filter: ["Select every x:th datapoint", 0],
                  name : ["Stream name", "string"],
                  yMax  : ["Maximum Y value", 0],
                  yMin  : ["Minimum Y value", 0],
                  viewNumberOfDays : ["Number of days to show", 0]
              };


function convertValue(key, value){
    if (typeof fieldMetaList[key][1] === 'string'){
        //Do nothing, alredy a string
    }
    else if(typeof fieldMetaList[key][1] === 'number'){
        value = parseInt(value);
    }
    else if(typeof fieldMetaList[key][1] === 'boolean'){
        value = value;
    }
    else if (typeof fieldMetaList[key][1] === 'object'){
        value = {};
    }
    else {
        Logger.log('error', 'Failed to indentify field type',{field: key, type : typeof fieldMetaList[key]})
    }
    return value;
}

// When storing to mongodb
function populateDocument(queryResults){
    var documentToStore = {};
    documentToStore['streamId'] =  convertValue("streamId", queryResults["streamId"]);

    for(var key in streamSetting){
        documentToStore[key] = convertValue(key, queryResults[key]);
    }

    for(var key in streamSetting.dataTable){
        documentToStore['dataTable'][key] = convertValue(key, queryResults[key]);
    }

    documentToStore['subcharts'] = [];
    var currentIndex = -1;
    var i = -1;
    for(var key in queryResults){
        var res = key.split("_");
        if (res.length > 1){
            if (currentIndex != res[1]){
                currentIndex = res[1];
                i++;
                documentToStore['subcharts'].push({})
            }
            let value = convertValue(res[0], queryResults[key]);
            documentToStore['subcharts'][i][res[0]] = value;
        }
    }
    return documentToStore;
}


function determineStreamTypes(message_type){
    let template = deepcopy(streamSetting.presentationTemplate);
    switch (parseInt(message_type)) {
        case Proto.enumerate('GpsCoordinates'):
            template.push('map');
            break;
        case Proto.enumerate('Image'):
            template.push('imagegallery');
            break;
        default:
    }
    return template;
}

exports.get = function(streamId, messageType, cb) {
    Proto.getProtoMessage(messageType).then((message) => {
        subchartSetting.fieldName = Object.keys(message.fields);
        var collection = db.get().collection(configuration.mongoDbServer.streamConfigurationCollectionName)
        collection.findOne({streamId: parseInt(streamId)}, function (err, config) {
              let template = determineStreamTypes(messageType);
              let newStreamSettings = deepcopy(streamSetting);
              newStreamSettings.presentationTemplate = template;
              if (config !== null){
                  Logger.log('debug', 'Configuartion found', {messageType:messageType, streamId: streamId});
                  cb(err, {settingFound: config, fieldMetaList: fieldMetaList, streamSetting: newStreamSettings, subchartSetting: subchartSetting});
              }
              else{
                  Logger.log('debug', 'No configuartion found', {messageType:messageType, streamId: streamId});
                  cb(err, {settingFound: false, fieldMetaList: fieldMetaList,
                                                streamSetting: newStreamSettings,
                                                subchartSetting: subchartSetting});
              }
        });
    }).catch(function(error){
         Logger.log('error', 'Failed to get proto message', {messageType:messageType, streamId: streamId});
    });
};


exports.save = function(req, cb) {

    if (req.query.show == 'on'){
        req.query.show = true;
    }
    else{
        req.query.show = false;
    }
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
