/**
 * Copyright 2017 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

const express = require('express');
const bodyParser = require('body-parser');


const restService = express();
restService.use(bodyParser.json());

var http = require('http');

function getLatestValue(sid, callback) {

    return http.get({
        host: 'ioant.com:1881',
        path: '/v0.1/'+"streams/id/"+Str(sid)+"/data"
    }, function(response) {
        // Continuously update stream with data
        var body = '';
        response.on('data', function(d) {
            body += d;
        });
        response.on('end', function() {

            // Data reception is done, do whatever with it!
            var parsed = JSON.parse(body);
            callback({
                parsed;
            });
        });
    });

}

restService.post('/', function (req, res) {

    console.log('hook request');

    try {
        var speech;

        if (req.body) {
            var requestBody = req.body;

            if (requestBody.result) {

                if (requestBody.result.action) {
                    if (requestBody.result.action == "light.on") {
                        speech += 'light is now on';
                    }
                    if (requestBody.result.action == "light.off") {
                        speech += 'light is now off';
                    }
                    if (requestBody.result.action == "power.status") {
                        getLatestValue(33, function(result){

                            speech = "Power is now:" + result[0].value + " watts";
                        })
                    }
                }
            }
        }

        console.log('result: ', speech);

        return res.json({
            speech: speech,
            displayText: speech,
            source: 'apiai-webhook-sample'
        });
    } catch (err) {
        console.error("Can't process request", err);

        return res.status(400).json({
            status: {
                code: 400,
                errorType: err.message
            }
        });
    }
});

restService.listen((7777), function () {
    console.log("Server listening");
});
