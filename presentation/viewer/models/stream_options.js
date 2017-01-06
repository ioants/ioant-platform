
var chartTypesOptions = ['line', 'bar'];
var streamTemplateOptions = ['chart', 'imagegallery'];
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
