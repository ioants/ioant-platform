var express = require('express')
  , router = express.Router()
  , Stream = require('../models/streams')
  , StreamSetting = require('../models/stream_setting')
const Logger = require('ioant-logger');

router.get('/', function(req, res) {
  Stream.all(function(err, streams) {
      if (typeof streams !== 'undefined' ){
          res.render('streams', {streamlist: streams});
      }
      else{
          res.render('notimplemented', {});
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
