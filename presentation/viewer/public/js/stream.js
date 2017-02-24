//=============================================================================
//  Global variables
//=============================================================================
var isNewData = true;
var streamId = $_GET('sid')
var messageType = $_GET('mid')
var streamValues;
var streamInfo;
var streamConfig
var chartsArray = [];
var currentRange = [];
var streamTableId = "#streamTable";
var toAutoFit;

//=============================================================================
//  On load of template
//=============================================================================
$(function() {
    loadDates();
    toAutoFit = $('#autofit').is(":checked");
    var start = moment($_GET('startdate')).subtract($('#viewnumberofdays').val(), "days");
    var end = moment($_GET('startdate'));
    deriveRange(start, end);
    loadData(start, end);
});

function deriveRange(start, end){
    var dateFormat = d3.time.format.iso;
    s = dateFormat.parse(start.toDate())
    e = dateFormat.parse(end.toDate())
    diff = e-s;
    if (diff === 0){
        e = dateFormat.parse(moment(end).add(1,'days'));
    }
    currentRange = [s,e];
}

//=============================================================================
//  Toolbar event functions
//=============================================================================

// Trigger on value changed
$('#filter').change(function(){
    toAutoFit = $('#autofit').is(":checked");
    start =  moment(currentRange[0]);
    end = moment(currentRange[1]);
    loadData(start, end);
});

// Trigger on checkbox changed
$('#autofit').change(function(){
    toAutoFit = $('#autofit').is(":checked");
    start =  moment(currentRange[0]);
    end = moment(currentRange[1]);
    loadData(start, end);
});


//=============================================================================
//  loadDates function
//  Desc: Will request unique dates of a certain data stream
//=============================================================================
function loadDates(){
    var rest_request_dates = "/stream/getstreamdates?streamid="+streamId;
    queue()
        .defer(d3.json, rest_request_dates)
        .awaitAll(loadDateRangePicker);
}


function loadDateRangePicker(error, streamDates){
    var valid_dates =  streamDates[0];
    $('input[name="daterange"]').daterangepicker(
    {
        locale: {
          format: 'YYYY-MM-DD'
        },
        startDate: moment($_GET('startdate')).subtract($('#viewnumberofdays').val(), "days").format('YYYY-MM-DD'),
        endDate: moment($_GET('startdate')).format('YYYY-MM-DD'),
        isInvalidDate: function(date) {
            if ( valid_dates.indexOf(date.format('YYYY-MM-DD')) == -1) {
                return true;
            } else {
                return false;
            }
        }
    },

    function(start, end, label) {
        toAutoFit = $('#autofit').is(":checked");
        deriveRange(start, end);
        loadData(start, end);
    });

}


//=============================================================================
//  loadData function
//  Desc: Will request data from stream given a specific timeframe (start, end)
//=============================================================================
function loadData(start, end){
    var filter = $('#filter').val();
    if ($.isNumeric(filter) == false){
        filter = 1;
    }
    isNewData = true;

    var rest_request_values = "/stream/getstreamdata?streamid="+streamId
                    +"&startdate="+start.format('YYYY-MM-DD')
                    +"&enddate="+end.format('YYYY-MM-DD')
                    +"&filter=" + filter;

    var rest_request_info = "/stream/getstreaminfo?streamid="+streamId;
    var rest_request_setting = "/streams/settings?streamid="+streamId+"&msgtype="+messageType;

    queue()
        .defer(d3.json, rest_request_values)
        .defer(d3.json, rest_request_info)
        .defer(d3.json, rest_request_setting)
        .awaitAll(handleData);
}
