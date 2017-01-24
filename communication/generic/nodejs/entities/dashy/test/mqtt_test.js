/**
 * @file app.js
 * @author Simon Lövgren
 *
 * Routes of the application
 */
'use strict';

//////////// MODULES ///////////
var Chai            = require('chai');
var ChaiAsPromised  = require('chai-as-promised');
var Sinon           = require('sinon');
var SinonAsPromised = require('sinon-as-promised');
var Promise         = require('bluebird');
var Moment          = require('moment');

//////////// SET-UP ///////////
Chai.use(ChaiAsPromised);

//////////// VARIABLES ///////////
var expect = Chai.expect();

//////////// TEST SUITES ///////////
describe('Placeholder suite', function(){

    // Set-up for tests
    beforeEach(function(){
        should = Chai.should();
    });

    // Tear-down for tests
    afterEach(function(){
        
    });

    /*----------- TEST SUITES -----------*/
    it('Placeholder test for now', function(){
        (function(){return true;})().should.equal(true);
        (function(){return false;})().should.equal(false);
    });
});
