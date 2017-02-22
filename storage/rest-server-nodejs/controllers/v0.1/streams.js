/**
 * @file control_streams.js
 * @author Adam Saxén
 *
 *  Handles /v0/streams/
 */

var express = require('express');
var router = express.Router();
var modelIndex = require('../../models/index');
const Logger = require('ioant-logger');

/**
 *  @desc Get available data streams as a list
 *  Handles /vXX/streams/
 */
router.get('/', function(req, res) {
    Logger.log('debug', "Stream list requested");
    modelIndex.getStreamList(res);
});

/**
 *  @desc Get data for specific stream id.
 *
 */
router.get('/id/:id/data', function(req, res) {
    Logger.log('debug', 'Data for stream id:' + req.params.id + " requested");
    modelIndex.getStreamData(res, req, req.params.id);
});

/**
 *  @desc Get information of specific stream id
 * 
 */
router.get('/id/:id/', function(req, res) {
    Logger.log('debug', 'Info for stream id:' + req.params.id + " requested");
    modelIndex.getStreamInfo(res, req.params.id);
});


module.exports = router
