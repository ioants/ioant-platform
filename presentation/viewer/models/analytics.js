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

var analyticStreamSetting = {
                     name : {default:"name",
                             type: "string",
                             description: "Analytic stream name"},
                     streams : {default:[],
                                type: [],
                                description: "Stream to be combined"}
                 };


exports.getAll = function(req, cb) {
    var collection = db.get().collection(configuration.mongoDbServer.analyticsCollectionName)
    collection.find().toArray(function (err, streams) {
          Logger.log('debug', 'woop', {streams:streams});
          if (streams !== null){
              Logger.log('debug', 'Analytic streams found', {streams:streams});
              cb(err, {streams:streams, fields:analyticStreamSetting});
          }
          else{
              Logger.log('debug', 'No analytic streams found', {});
              cb(err, {streams: false, fields : analyticStreamSetting});
          }
    });
};

exports.add = function(req, cb) {
    var documentToStore = populateDocument(req.query);

    var collection = db.get().collection(configuration.mongoDbServer.analyticsCollectionName)

    collection.insertOne( documentToStore, function(err, result) {
        if (result !== null){
            Logger.log('info', 'Insert new analytics stream success!')
        }
        else{
            Logger.log('error', 'Failed to add settings for stream',{streamId : req.query.streamId})
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
