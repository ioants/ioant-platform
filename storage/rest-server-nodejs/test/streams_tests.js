'use strict';
var chai = require('chai'),
    should = chai.should(),
    chaiAsPromised = require('chai-as-promised'),
    Mysql = require('mysql'),
    sinon = require('sinon'),
    Promise = require('bluebird'),
    StreamsModel = require('../models/streams.js'),
    moment = require('moment');

var schema = require('./data/schema.json');
var expect = require('chai').expect;

require('sinon-as-promised');

chai.use(chaiAsPromised);

describe('The streams model class', function() {
    var mysqlConnection = Promise.promisifyAll(Mysql.createConnection({host: 'localhost'}));
    var queryAsyncStub;
    var streamsmodel = new StreamsModel(mysqlConnection, schema);

    beforeEach(function() {
        queryAsyncStub = sinon.stub(mysqlConnection, 'queryAsync');
    });

    afterEach(function() {
        queryAsyncStub.restore();
    });

    /**
    * @desc Tests of class method getStreamList and getLatestData
    *
    */

    it('getStreamList: verify get list of streams query', function() {

        queryAsyncStub.returns(Promise.resolve([{dummy_row:"dummy_data"}]));
        var getLatestDataStub = sinon.stub(streamsmodel, 'getLatestData');
        getLatestDataStub.returns(Promise.resolve());

        var result = streamsmodel.getStreamList();

        return result.then((result) => {
            sinon.assert.calledWith(queryAsyncStub, "SELECT * from "+schema.database.tables[0].name);
            getLatestDataStub.restore();
        });

    });

    it('getStreamList: get list of streams', function() {

        // Fake stream list data returned from initial query
        var db_list_data = [{sid:1, global:"global", local:"local", client_id:"dix", stream_index:0, message_type:4, message_name:"temperature", creation_ts:"2017-01-13T17:19:48.000Z"},
                            {sid:2, global:"global", local:"local", client_id:"lix", stream_index:0, message_type:5, message_name:"humidity", creation_ts:"2017-01-15T17:19:48.000Z"}];
        var latest_values_one = [{ts:"2017-01-15T17:19:48.000Z", latestvalue:14.5}];
        var latest_values_two = [{ts:"2017-01-15T17:19:48.000Z", latestvalue:14.5}];

        queryAsyncStub.onCall(0).returns(Promise.resolve(db_list_data));
        queryAsyncStub.onCall(1).returns(Promise.resolve(latest_values_one));
        queryAsyncStub.onCall(2).returns(Promise.resolve(latest_values_two));

        var expected_result = [{sid:1, global:"global", local:"local", client_id:"dix", stream_index:0,
                                message_type:4, message_name:"temperature", creation_ts:"2017-01-13T17:19:48.000Z",
                                update_ts:"2017-01-15T17:19:48.000Z", latest_value: 14.5},
                               {sid:2, global:"global", local:"local", client_id:"lix", stream_index:0,
                                message_type:5, message_name:"humidity", creation_ts:"2017-01-15T17:19:48.000Z",
                                update_ts:"2017-01-15T17:19:48.000Z", latest_value: 14.5}];

        return streamsmodel.getStreamList().should.eventually.to.deep.include.members(expected_result);

    });

    it('getStreamList: catch error when requesting list of streams', function() {

        // Fake stream list data returned from initial query
        var db_list_data = [{sid:44, global:"global", local:"local", client_id:"dix", stream_index:0, message_type:4, message_name:"temperature", creation_ts:"2017-01-13T17:19:48.000Z"}];
        queryAsyncStub.onCall(0).returns(Promise.resolve(db_list_data));
        queryAsyncStub.onCall(1).returns(Promise.reject());


        return streamsmodel.getStreamList().should.eventually.be.rejectedWith(Error);

    });

    /**
    * @desc Tests of class method getStreamInfo
    *
    */
    it('getStreamInfo: get stream meta info of particular stream', function() {

        var stream_table = schema.database.tables[0].name;
        var primary_key_field = schema.database.tables[0].primaryKey;
        var test_stream_id = 14;

        queryAsyncStub.returns(Promise.resolve([{dummy_row:"dummy_data"}]));

        var result = streamsmodel.getStreamInfo(test_stream_id);

        return result.then((result) => {
            sinon.assert.calledWith(queryAsyncStub, `SELECT * from ${stream_table} WHERE ${primary_key_field}=${test_stream_id}`);
        });

    });

    /**
    * @desc Tests of class method getStreamData
    *
    */
    it('getStreamData: get stream data of one day, filter 1', function() {

        var stream_table_prefix = schema.database.messageTablePrefix
        var primary_key_field = schema.database.tables[0].primaryKey;
        var test_stream_id = 14;
        var test_unix_timestamp = 1410715640579;
        var test_startdate = moment(test_unix_timestamp);
        var test_enddate = moment(test_unix_timestamp).add(1,'days');
        var test_filter = 1;
        var test_message_name = "temperature";

        queryAsyncStub.onCall(0).returns(Promise.resolve([{message_name: test_message_name}]));
        queryAsyncStub.onCall(1).returns(Promise.resolve([{ts:"dummy_time", value:"dummy_value"}]));

        var result = streamsmodel.getStreamData(test_stream_id, test_startdate, test_enddate, test_filter);

        return result.then((result) => {
            let start_unix_timestamp = test_startdate.unix();
            let end_unix_timestamp = test_enddate.unix();
            sinon.assert.calledWith(queryAsyncStub, `SELECT * from ${stream_table_prefix}${test_stream_id}_${test_message_name} WHERE ts BETWEEN FROM_UNIXTIME(${start_unix_timestamp}) AND FROM_UNIXTIME(${end_unix_timestamp}) AND (id % ${test_filter}) = 0 ORDER BY ts DESC`);
        });

    });

    it('getStreamData: get stream data, filter set to high', function() {

        var stream_table_prefix = schema.database.messageTablePrefix
        var primary_key_field = schema.database.tables[0].primaryKey;
        var test_stream_id = 14;
        var test_unix_timestamp = 1410715640579;
        var test_startdate = moment(test_unix_timestamp);
        var test_enddate = moment(test_unix_timestamp).add(1,'days');
        var test_filter = 2;
        var test_message_name = "temperature";
        var test_stream_db_data = [{ts:"dummy_time", value:"dummy_value"}];

        queryAsyncStub.onCall(0).returns(Promise.resolve([{message_name: test_message_name}]));
        //Simulate zero results from query
        queryAsyncStub.onCall(1).returns(Promise.resolve([]));
        // Next query to db (no filtration) returns one hit
        queryAsyncStub.onCall(2).returns(Promise.resolve(test_stream_db_data));

        var result = streamsmodel.getStreamData(test_stream_id, test_startdate, test_enddate, test_filter);

        return result.then((result) => {
            let start_unix_timestamp = test_startdate.unix();
            let end_unix_timestamp = test_enddate.unix();
            sinon.assert.calledWith(queryAsyncStub, `SELECT * from ${stream_table_prefix}${test_stream_id}_${test_message_name} WHERE ts BETWEEN FROM_UNIXTIME(${start_unix_timestamp}) AND FROM_UNIXTIME(${end_unix_timestamp}) ORDER BY ts DESC`);
            expect(result).to.deep.equal(test_stream_db_data);
        });
    });

    it('getStreamData: query error', function() {

        var test_stream_id = 14;
        var test_unix_timestamp = 1410715640579;
        var test_startdate = moment(test_unix_timestamp);
        var test_enddate = moment(test_unix_timestamp).add(1,'days');
        var test_filter = 2;

        queryAsyncStub.onCall(0).returns(Promise.resolve([{message_name: 'test_message_name'}]));
        //Simulate query error results from query ( = promise from queryAsync is rejected)
        queryAsyncStub.onCall(1).returns(Promise.reject());

        return streamsmodel.getStreamData(test_stream_id, test_startdate, test_enddate, test_filter).should.eventually.be.rejected;

    });

});
