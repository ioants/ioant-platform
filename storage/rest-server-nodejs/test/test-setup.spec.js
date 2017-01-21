'use strict';
process.env.NODE_ENV = 'test'

// test-setup.spec.js
const sinon = require('sinon')
const chai = require('chai')

beforeEach(function () {
  this.sandbox = sinon.sandbox.create()
})

afterEach(function () {
  this.sandbox.restore()
})
