"use strict"
var express = require('express')
  , router = express.Router()
  , Stream = require('../models/streams')
  , StreamSetting = require('../models/stream_setting')
const Logger = require('ioant-logger');

router.get('/', function(req, res) {
  Stream.all(function(err, streams) {
      if (typeof streams !== 'undefined' ){
          var message_type_list = [];
          var message_type_list_objects = [];
          streams.forEach(function(element) {
                if (message_type_list.indexOf(element.message_type) == -1){
                    message_type_list.push(element.message_type);
                    message_type_list_objects.push({message_type: element.message_type,
                                                    message_name: element.message_name,
                                                    image_type_url: element.image_type_url});
                }
            })
          res.render('streams', {streamlist: streams, message_type_list: message_type_list_objects});
      }
      else{
          res.render('notimplemented', {});
      }
  })
})



router.get('/list', function(req, res) {
  Stream.all(function(err, streams) {
      if (typeof streams !== 'undefined' ){
          var message_type_list = [];
          var message_type_list_objects = [];

          streams.forEach(function(element) {
                if (message_type_list.indexOf(element.message_type) == -1){
                    message_type_list.push(element.message_type);
                    message_type_list_objects.push({message_type: element.message_type,
                                                    message_name: element.message_name,
                                                    image_type_url: element.image_type_url});
                }
            })
          res.json({stream_list: streams, message_type_list: message_type_list_objects});
      }
      else{
          res.json({});
      }
  })
})

router.get('/settings', function(req, res) {
    StreamSetting.get(req.query.streamid,
                      req.query.msgtype,
                      function(err, settings) {
                          if (!err) {
                              res.json(settings);
                          }
                          else {
                              Logger.log('error','Failed to retrieve stream settings.');
                              res.json(false);
                          }
                      });
})

router.get('/settingssave', function(req, res) {
    StreamSetting.save(req,
                      function(err, settings) {
                          if (!err) {
                              res.json(true);
                          }
                          else {
                              Logger.log('error','Failed to save stream settings');
                              res.json(false);
                          }
                      });
})

module.exports = router
