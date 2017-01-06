var express = require('express')
  , app = express()

var db = require('./db')

app.engine('pug', require('pug').__express)
app.set('view engine', 'pug')

app.use(express.static(__dirname + '/public'))
app.use(require('./controllers'))
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require("fs"));
var child_process = Promise.promisifyAll(require("child_process"));
var config = require('./configuration.json');
const winston = require('winston')
var protoio = require('./proto/protoio');

protoio.getProtoDefinition(function(root){})

var parseJson = function(contents) {
    return new Promise(function (resolve, reject) {
        var jsonObject = JSON.parse(contents);
        resolve(jsonObject);
	})};

var setup = function() {
    var p1 = fs.readFileAsync('configuration.json', 'utf8')
          .then(parseJson);

    var p2 = fs.readFileAsync('configuration.json', 'utf8')
          .then(parseJson);

    return Promise.join(p1, p2, function(configurationObject, configurationObject) {
        configuration = configurationObject;
        startApplication();
    });
}

var startApplication = function(){

    db.connect('mongodb://localhost:27017/nabview', function(err) {
        if (err) {
            winston.log('error', 'Unable to connect to MongoDB.')
            process.exit(1)
        } else {
            app.listen(config.port, function() {
              winston.log('info', 'listening on: ',{port: config.port})
            })
        }
    })
    winston.log('info', 'Server up and running')
}

//=============================================================================
// Entry point of application
//=============================================================================
setup();

module.exports = winston
