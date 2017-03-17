var express = require('express')
  , router = express.Router()
  , Analytics = require('../models/analytics')
const Logger = require('ioant-logger');

router.get('/', function(req, res) {
    Logger.log('debug','analytic controller. get');
    Analytics.get( req,
                    function(err, analyticMeta) {
                        if (err){
                            Logger.log('info','Analytic found!', {analyticMeta: analyticMeta});
                            res.render('analytic', {analyticMeta: analyticMeta})
                        }
                        else{
                            Logger.log('info','Failed to find analytic', {aid: req.query.aid});
                            res.render('analytics');
                        }
                    });
})

router.get('/meta', function(req, res) {
    Logger.log('debug','analytic controller. meta');
    Analytics.get( req,
                    function(err, analyticMeta) {
                        if (err){
                            Logger.log('info','Analytic found!', {analyticMeta: analyticMeta});
                            res.json(analyticMeta)
                        }
                        else{
                            Logger.log('info','Failed to find analytic', {aid: req.query.aid});
                            res.render(false);
                        }
                    });
})

module.exports = router
