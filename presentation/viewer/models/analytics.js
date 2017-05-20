'use strict';
/**
 * @file analytics.js
 * @author Adam Saxén
 *
 *  Module for retrieving multiple data streams for analtyics
 */

var db = require('../db');
var Proto = require('ioant-proto');
const Logger = require('ioant-logger');
var Loader = require('ioant-loader');
var Promise = require('bluebird');
var Utils = require('./utils');

let configuration;
Loader.getLoadedAsset('configuration').then((config) => {
    configuration = config;
}).catch(function(error){
      Logger.log('error', 'Failed to load asset: configuration');
});

var analyticStreamForm = [{name:"name",
                           type: "name",
                           description: "Analytic name",
                           hidden: false},
                          {name:"streams",
                           type: {},
                           description: "Streams to be combined (select below to add)",
                           hidden: false}];

 var streamFields = [{
                         name:"sid",
                         type: 0,
                         description: "Stream id",
                         hidden: true
                     },
                     {
                         name:"field",
                         type: [],
                         array_data: [],
                         description: "Select field type",
                         hidden: false
                     },
                     {
                         name:"filter",
                         type: 10,
                         description: "Select every x:th value",
                         hidden: false
                     },
                     {
                         name:"msgtype",
                         type: [],
                         array_data: [],
                         description: "message_type",
                         hidden: true
                     },
                     {
                         name:"rightyaxis",
                         type: false,
                         description: "Use right Y axis",
                         hidden: false
                     },
                     {
                         name:"accumulate",
                         type: false,
                         description: "Accumulate values",
                         hidden: false
                     },
                     {
                         name:"topic",
                         type: "",
                         description: "",
                         hidden: true
                     },
                     {
                         name:"msgname",
                         type: "",
                         description: "",
                         hidden: true
                     }

                     ];


function populateDocument(queryResults){
     let documentToStore = {};
     documentToStore['name'] = queryResults.name;
     documentToStore['streams'] = [];
     var fields = Object.keys(queryResults)
     Logger.log('info', 'query', {fields:fields});

     // Find sid keys
     for(var index in fields){
          var res = fields[index].split("_");
          if (res.length > 1){
              if (streamFields[0].name == res[0]){
                  let streamObject = {};
                  streamObject['sid'] = res[1]
                  for(var t in fields){
                      var res2 = fields[t].split("_");
                      if (res2.length > 1){
                          // Go over stream fields and se if it is a match
                          for (var i=1; i < streamFields.length; i++){
                              if (streamFields[i].name == res2[0] && res2[1] == res[1]){
                                  streamObject[streamFields[i].name] = queryResults[fields[t]]
                              }
                          }
                      }
                  }
                  console.log("pushed!")
                  documentToStore.streams.push(streamObject)
              }
          }
      }

    return documentToStore;
}

exports.getAll = function(req, cb) {
    var analytics_collection = db.get().collection(configuration.mongoDbServer.analyticsCollectionName)

    analytics_collection.find({}).count((err, number_of_analytics) => {
        Logger.log('info', 'number of analytics', {number_of_analytics:number_of_analytics});
        let index = 0;
        let arrayOfAnalytics = [];
        if (number_of_analytics > 0){
            Logger.log('info', 'Analytics found', {analytics:arrayOfAnalytics});
            analytics_collection.find({}).forEach((analytic) => {
                analytic['number_of_streams'] = analytic.streams.length;
                for (var i = 0; i < analytic.streams.length; i++) {
                    analytic.streams[i]['icon_ref'] = Utils.getImageOfMessageType(parseInt(analytic.streams[i].msgtype));
                }

                arrayOfAnalytics.push(analytic);
                index++;
                if (index == number_of_analytics){
                    cb(false, {analytics:arrayOfAnalytics, fields:analyticStreamForm, streamFields: streamFields});
                }
            });
        }
        else{
            Logger.log('info', 'No analytics found', {});
            cb(true, {analytics: false, fields : analyticStreamForm, streamFields: streamFields});
        }
    });
};

exports.get = function(req, cb) {
    var analytics_collection = db.get().collection(configuration.mongoDbServer.analyticsCollectionName)
    var o_id = db.convertID(req.query.aid);
    analytics_collection.findOne({'_id': o_id}, function(err, item) {
        if (err == null){
            cb(true, item);
        }
        else{
            cb(false, []);
        }
    });
};

exports.getStructure = function(req, cb) {
    cb({}, {fields:analyticStreamForm, streamFields: streamFields});
};

exports.add = function(req, cb) {
    var documentToStore = populateDocument(req.query);
    Logger.log('debug', 'analytic stream to store:', {documentToStore:documentToStore})

    var collection = db.get().collection(configuration.mongoDbServer.analyticsCollectionName)

    collection.insertOne( documentToStore, function(err, result) {
        if (result !== null){
            Logger.log('info', 'Insert new analytics stream success!')
        }
        else{
            Logger.log('error', 'Failed to add analytic',{documentToStore : documentToStore})
        }
        cb(err, result);
    });
}

exports.delete = function(req, cb) {
     Logger.log('debug', 'attempting delete of id:', {id:req.query.id});
     var o_id = db.convertID(req.query.id);
     var collection = db.get().collection(configuration.mongoDbServer.analyticsCollectionName)
     collection.deleteOne({'_id': o_id}, function (err, result) {
         if (result !== null){
             Logger.log('info', 'Deleted analytics stream success!');
             cb(false, result);
         }
         else{
             Logger.log('error', 'Failed delete analytic',{id : req.query.id});
             cb(true, result);
         }

     });
}
