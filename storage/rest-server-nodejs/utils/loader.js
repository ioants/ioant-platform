/**
 * @file loader.js
 * @author Adam Saxén
 *
 *  Module for loading assets
 */
var Promise = require('bluebird');
const logger = require('./logger');
var fs = Promise.promisifyAll(require("fs"));
var child_process = Promise.promisifyAll(require("child_process"));

var parseJson = function(contents) {
    return new Promise(function (resolve, reject) {
        try {
            var jsonObject = JSON.parse(contents);
            resolve(jsonObject);
        } catch (e) {
            return reject(e);
        }
})};

exports.load = function(path_to_asset) {
    logger.log('info', 'Loading asset', {path: path_to_asset});
    var p1 = fs.readFileAsync(path_to_asset, 'utf8').then(parseJson);

    return p1.then(function(assetObject) {
                logger.log('info', 'Success! Loaded asset: '+path_to_asset);
                return new Promise(function (resolve, reject) {resolve(assetObject)});
           }).catch(function(error){
               //do something with the error and handle it
              throw error;
	       });
}
