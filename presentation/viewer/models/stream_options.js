/**
 * @file stream_options.js
 * @author Adam Saxén
 *
 *  Container for available chart types, templates and other options
 */

var chartTypesOptions = ['line', 'bar'];
var streamTemplateOptions = ['chart'];
var streamBoolean = ['true', 'false'];

exports.getChartTypes = function() {
    return chartTypesOptions;
}

exports.getStreamTemplates = function() {
    return streamTemplateOptions;
}

exports.getStreamBooleans = function() {
    return streamBoolean;
}
