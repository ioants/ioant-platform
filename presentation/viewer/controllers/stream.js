var express = require('express')
  , router = express.Router()
  , Stream = require('../models/stream')
  , StreamSetting = require('../models/stream_setting')
const winston = require('winston');

router.get('/', function(req, res) {
    StreamSetting.get( req.query.sid,
                       req.query.mid,
                        function(err, streamSettings) {
                            if (streamSettings.settingFound === false){
                                winston.log('info','No configuration found!', {streamid: parseInt(req.query.sid)});
                                res.render('streamtypes/chart', {settings: false})
                            }
                            else{
                                console.log(streamSettings)
                                winston.log('info','Get stream configuration success!', {streamSettings: streamSettings});
                                res.render('streamtypes/'+streamSettings.settingFound.template, {settings: streamSettings.settingFound});
                            }
                        });
})

router.get('/getstreamdata', function(req, res) {
    winston.log('info', 'Retreieve stream data - controller')
    Stream.get(req.query.streamid,
              req.query.startdate,
              req.query.enddate,
              req.query.filter,
            function(err, response, streamdata) {
                if (!err && response.statusCode == 200) {
                    res.json(streamdata);
                }
                else {
                    winston.log('error','Failed to retrieve stream data.', {streamid: req.query.streamid,
                                                                            startdate: req.query.startdate,
                                                                            enddate: req.query.enddate,
                                                                            filter: req.query.filter});
                    res.json(false);
                }
            })
})

router.get('/getstreaminfo', function(req, res) {
    winston.log('info', 'Retrieve stream info - controller')
    Stream.getInfo(req.query.streamid,
            function(streaminfo) {
                winston.log('info','Get stream info!', {streaminfo: streaminfo});
                res.json(streaminfo);
            })
})

module.exports = router
