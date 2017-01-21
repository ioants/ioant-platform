var winston = require('winston');

if (process.env.NODE_ENV !== 'test') {
    winston = new (winston.Logger)({
        transports: [
            new (winston.transports.Console)({ level: 'warn' }),
            new (winston.transports.File)({ filename: __dirname + '/../logs/restserver_node.log', level: 'warn' })
        ]
    });
} else {
    // while testing, log only to file, leaving stdout free for unit test status messages
    winston = new (winston.Logger)({
        transports: [
            new (winston.transports.File)({ filename: __dirname + '/../logs/tests_node.log', level: 'silly' })
        ]
    });
}

module.exports = winston;
