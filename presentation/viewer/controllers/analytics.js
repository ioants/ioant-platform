"use strict"
var express = require('express')
  , router = express.Router()
const Logger = require('ioant-logger');
var Analytics = require('../models/analytics')

router.get('/', function(req, res) {
  Analytics.getAll(req, function(err, analytics) {
      if (typeof analytics !== 'undefined' ){
          console.log(analytics)
          res.render('analytics', analytics);
      }
      else{
          res.render('notimplemented', {});
      }
  })
})

router.get('/structure', function(req, res) {
  Analytics.getStructure(req, function(err, structure) {
     res.json(structure);
  })
})

router.get('/add', function(req, res) {
  Analytics.add(req, function(err, analytics) {
      if (!err) {
          res.json(true);
      }
      else {
          Logger.log('error','Failed to save analytic');
          res.json(false);
      }
  })
})

router.get('/delete', function(req, res) {
    Analytics.delete(function(err, analytics) {
        if (typeof analytics !== 'undefined' ){
            res.render('analytics', {});
        }
        else{
            res.render('notimplemented', {});
        }
    })
})


module.exports = router
