var express = require('express')
  , router = express.Router()
  , Stream = require('../models/stream')
  , StreamSetting = require('../models/stream_setting')
const Logger = require('ioant-logger');

router.get('/', function(req, res) {
    StreamSetting.get( req.query.sid,
                       req.query.mid,
                        function(err, streamSettings) {
                            if (streamSettings.settingFound === false){
                                Logger.log('info','No configuration found!', {streamid: parseInt(req.query.sid)});
                                res.render('streamtypes/chart', {settings: streamSettings.streamSettings})
                            }
                            else{
                                Logger.log('info','Get stream configuration success!', {streamSettings: streamSettings});
                                res.render('streamtypes/'+streamSettings.settingFound.presentationTemplate, {settings: streamSettings.settingFound});
                            }
                        });
})

router.get('/getstreamdata', function(req, res) {
    Logger.log('info', 'Retreive stream data - controller')
    Stream.get(req.query.streamid,
              req.query.startdate,
              req.query.enddate,
              req.query.filter,
            function(err, response, streamdata) {
                if (!err && response.statusCode == 200) {
                    res.json(streamdata);
                }
                else {
                    Logger.log('error','Failed to retrieve stream data.', {streamid: req.query.streamid,
                                                                            startdate: req.query.startdate,
                                                                            enddate: req.query.enddate,
                                                                            filter: req.query.filter});
                    res.json(false);
                }
            })
})

router.get('/getstreamdates', function(req, res) {
    Logger.log('info', 'Retreive stream dates - controller')
    Stream.getDates(req.query.streamid,
            function(err, response, streamdates) {
                if (!err && response.statusCode == 200) {
                    res.json(streamdates);
                }
                else {
                    Logger.log('error','Failed to retrieve stream dates.', {streamid: req.query.streamid});
                    res.json(false);
                }
            });
});

router.get('/getstreaminfo', function(req, res) {
    Logger.log('info', 'Retrieve stream info - controller')
    Stream.getInfo(req.query.streamid,
            function(streaminfo) {
                Logger.log('info','Get stream info!', {streaminfo: streaminfo});
                res.json(streaminfo);
            })
})

module.exports = router
