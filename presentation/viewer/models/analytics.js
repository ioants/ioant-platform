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

let configuration;
Loader.load('./configuration.json', 'configuration').then((config) => {
    configuration = config;
}).catch(function(error){
      Logger.log('error', 'Failed to load asset: configuration');
});

var analyticStreamForm = [{name:"name",
                           type: "string",
                           description: "Analytics name"},
                          {name:"streams",
                           type: {},
                           description: "Streams to be combined (select to add)"}];

 var streamFields = [{name:"sid",
                     type: 0,
                     description: "Stream id"},
                     {name:"field",
                     type: [],
                     array_data: [],
                     description: "Select field type"}
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
                          if (streamFields[1].name == res2[0] && res2[1] == res[1]){
                              //store chosen
                              console.log(queryResults[fields[t]]);
                              streamObject['field'] = queryResults[fields[t]]
                          }
                      }
                  }
                  documentToStore.streams.push(streamObject)
              }
          }
      }

    return documentToStore;
}

exports.getAll = function(req, cb) {
    var collection = db.get().collection(configuration.mongoDbServer.analyticsCollectionName)
    collection.find().toArray(function (err, analytics) {
          if (analytics.length > 0){
              Logger.log('info', 'Analytics found', {analytics:analytics});
              cb(err, {analytics:analytics, fields:analyticStreamForm, streamFields: streamFields});
          }
          else{
              Logger.log('info', 'No analytics found', {});
              cb(err, {analytics: false, fields : analyticStreamForm, streamFields: streamFields});
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
     var o_id = db.convertID(req.query.id);
     var collection = db.get().collection(configuration.mongoDbServer.analyticsCollectionName)
     collection.deleteOne({'_id': o_id}, function (err, result) {
         if (result !== null){
             Logger.log('info', 'Deleted analytics stream success!')
         }
         else{
             Logger.log('error', 'Failed delete analytic',{id : req.query.id})
         }
         cb(err, result);
     });
}
