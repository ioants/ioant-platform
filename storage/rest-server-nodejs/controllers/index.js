/**
 * @file index.js
 * @author Adam Saxén
 *
 *  Root file for routing request to different api versions
 */

var express = require('express');
var router = express.Router();

// API versions, append this list when adding version
var VERSIONS = {'Beta-Production': '/v0.1'};
//router.use('/streams', require('./streams'))
for (var v in VERSIONS) {
    router.use(VERSIONS[v]+"/streams", require('.'+VERSIONS[v] + "/streams"));
}

module.exports = router
