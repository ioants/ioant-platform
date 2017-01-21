const chai = require('chai')
const logger = require('../utils/logger');

var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);
var appRoot = process.cwd()
var Loader = require('../utils/loader.js');


describe('The loader module', function() {
    it('load valid configuration file', function() {
        var loaded_config = Loader.load("./test/data/configuration_valid.json").then(function(configuration) {
             return configuration;
        });
        return chai.expect(loaded_config).to.eventually.have.deep.property("mysqlDatabase.user").and.equal('calle');
    });

    it('load invalid configuration file', function() {
        return chai.expect(Loader.load("./test/data/configuration_invalid.json")).to.be.rejectedWith(SyntaxError);
    });

    it('load configuration file that does not exist', function() {
        return chai.expect(Loader.load("")).to.be.rejectedWith("ENOENT: no such file or directory, open \'\'");

    });

    it('load schema file that exists', function() {
        var loaded_schema = Loader.load("./test/data/schema.json").then(function(schema) {
             return schema;
        });
        return chai.expect(loaded_schema).to.eventually.have.deep.property("database.name").and.equal('ioant');

    });
});
