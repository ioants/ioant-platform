'use strict';
const expect = require('chai').expect
var StreamModel = require('../models/stream.js');

describe('The stream model', function() {
    it('calls the constructor and verifies default values', function() {
        var streamObject = new StreamModel();
        expect(streamObject.streamid).to.equal(-1);
        expect(streamObject.message_type).to.equal(-1);
        expect(streamObject.latest_value).to.equal(undefined);
    });

    it('calls the get latest value function', function() {
        var streamObject = new StreamModel();
        streamObject.latest_value = 142;
        expect(streamObject.getLatestValue()).to.equal(142);
    });

});
