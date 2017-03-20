//=============================================================================
//  Global variables
//=============================================================================
var analyticId = $_GET('aid')
var isNewData = false;
var currentRange = {start: "", end: ""}
var metaData;
var streamColors = ['#3E6990', '#AABD8C', '#A4031F', '#240B36 ', '#D17A22 ', '#F2DC5D', '#5E807F', 'black'];
var compositeChartHandle = dc.compositeChart('#analytic-chart')
var subCharts = [];

//=============================================================================
//  On load
//=============================================================================
$(function() {
    loadAnalyticMeta();
});

//=============================================================================
//  Toolbar event functions
//=============================================================================



//=============================================================================
//  loadAnalyticMeta function
//  Desc: Will request data from stream given a specific timeframe (start, end)
//=============================================================================
function loadAnalyticMeta(){
    console.log("1. loading analytic meta")

    var rest_request_meta = "/analytic/meta?aid="+analyticId;

    queue()
        .defer(d3.json, rest_request_meta)
        .awaitAll(handleMetaResponse);
}


//=============================================================================
//  handleMetaResponse function
//  Desc: will prepare data collection from all streams in meta info
//=============================================================================
function handleMetaResponse(error, meta) {
    console.log("2. Prepare meta");
    metaData = meta[0];

    //Get available dates for all streams
    var q = queue();
    for(var i=0; i < metaData.streams.length; i++){
        var rest_request_dates = "/stream/getstreamdates?streamid="+metaData.streams[i].sid;
        q = q.defer(d3.json, rest_request_dates);
    }
    q.awaitAll(handleDatesResponse);

}

//=============================================================================
//  handleDatesResponse function
//  Desc: will determine available dates for all streams included
//=============================================================================
function handleDatesResponse(error, dates) {
    console.log("3. Prepare dates");
    unique_dates = {};
    for(var i=0; i < dates.length; i++){
        for(var j=0; j < dates[i].length; j++){
            if (dates[i][j] in unique_dates){
                unique_dates[dates[i][j]] = unique_dates[dates[i][j]] + 1;
            }
            else{
                unique_dates[dates[i][j]] = 1;
            }
        }
    }

    console.log(unique_dates);
    loadDateRangePicker(unique_dates);
    loadDataSets(currentRange.start, currentRange.end);

}


function deriveRange(start, end){
    var dateFormat = d3.time.format.iso;
    s = dateFormat.parse(start.toDate())
    e = dateFormat.parse(end.toDate())

    currentRange.start = s;
    currentRange.end = e;
}

//=============================================================================
//  loadDateRangePicker function
//  Desc: prepares daterangepicker with valid date ranges
//=============================================================================
function loadDateRangePicker(unique_dates){
    var valid_dates = Object.keys(unique_dates);
    valid_dates.sort();
    deriveRange(moment(valid_dates[valid_dates.length-1]), moment(valid_dates[valid_dates.length-1]));
    $('input[name="daterange"]').daterangepicker(
    {
        locale: {
          format: 'YYYY-MM-DD'
        },
        startDate: currentRange.start,
        endDate: currentRange.end,
        isInvalidDate: function(date) {
            if ( valid_dates.indexOf(date.format('YYYY-MM-DD')) == -1) {
                return true;
            } else {
                return false;
            }
        }
    },

    function(start, end, label) {
        delete(compositeChart);
        subCharts = [];
        compositeChart = dc.compositeChart('#analytic-chart');
        deriveRange(start, end);
        loadDataSets(start, end);
    });
}


//=============================================================================
//  loadDataSets function
//  Desc: Will request data from stream given a specific timeframe (start, end)
//=============================================================================
function loadDataSets(start, end){
    console.log("4. get data sets");

    //Get data for all streams
    var q = queue();
    for(var i=0; i < metaData.streams.length; i++){
        var rest_request_values = "/stream/getstreamdata?streamid="+metaData.streams[i].sid
                        +"&startdate="+moment(start).format('YYYY-MM-DD')
                        +"&enddate="+moment(end).format('YYYY-MM-DD')
                        +"&filter=" + metaData.streams[i].filter;
        q = q.defer(d3.json, rest_request_values);
    }
    q.awaitAll(handleLoadedDataSets);
}


//=============================================================================
//  handleDataSets function
//  Desc: Will handle all stream data requested.
//=============================================================================
function handleLoadedDataSets(error, datasets){
    console.log("5. Data sets received");
    if (!error){

        //Combine datasets to one
        var mergedDataSet = [];

        for(var i=0; i < datasets.length; i++){
            var currentDataSet = datasets[i];
            var currentMetaData = {};
            // Find correct meta data
            for(var j=0; j < metaData.streams.length; j++){
                if (metaData.streams[j].sid == currentDataSet.streamId){
                    currentMetaData = metaData.streams[j];
                }
            }

            var dateFormat = d3.time.format.iso;
            for(var k=0; k < datasets[i].streamData.length; k++){
                var fieldName = 'value_'+currentMetaData.sid;
                var tsName = 'ts_'+currentMetaData.sid;
                var tempDate =dateFormat.parse(new Date(datasets[i].streamData[k].ts))
                var ob = {};
                ob[tsName] = d3.time.second(tempDate);
                ob[fieldName] =datasets[i].streamData[k][currentMetaData.field];
                mergedDataSet.push(ob);
            }

        }

        console.log(mergedDataSet);
        generateCharts(mergedDataSet);
    }
}


function accessor(curIndex) {
    return function(d) {
        if (typeof d[curIndex] !== 'undefined' && d[curIndex] != null){
            return d[curIndex];
        }
        else{
            return null;
        }
    };
}


//=============================================================================
//  generateCharts function
//  Desc: Define and assign data to chart
//=============================================================================
function generateCharts(cleanData){
    var cf = crossfilter(cleanData);

    // generate the different dimensions
    var leftYAxisLabel = "";
    var rightYAxisLabel = "";

    for(var i=0; i < metaData.streams.length; i++){
        var tsName = 'ts_'+metaData.streams[i].sid;
        var dim = cf.dimension(accessor(tsName));

        var fieldIndex = "value"+"_"+metaData.streams[i].sid;

        var groups = dim.group().reduceSum(accessor(fieldIndex));


        var chartHandle = dc.lineChart(compositeChartHandle);

        chartHandle
            .dimension(dim)
            .group(groups, metaData.streams[i].topic + ' - ' + metaData.streams[i].msgname+"("+metaData.streams[i].sid+")")
            .colors(streamColors[i])
            .title(function(d) { return d.key + ": " + d.value; });

        if (typeof metaData.streams[i].rightyaxis !== 'undefined'){
            chartHandle.useRightYAxis(true);
            rightYAxisLabel = rightYAxisLabel + ' | ' + metaData.streams[i].msgname +"("+metaData.streams[i].sid+")";
        }
        else{
            leftYAxisLabel = leftYAxisLabel +  ' | ' + metaData.streams[i].msgname+"("+metaData.streams[i].sid+")";
        }

        subCharts.push(chartHandle);
    }

    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        xs = w.innerWidth || e.clientWidth || g.clientWidth,
        ys = w.innerHeight|| e.clientHeight|| g.clientHeight;

    compositeChartHandle
        .width(xs*0.7)
        .height(ys*0.6)
        .x(d3.time.scale().domain([currentRange.start, moment(currentRange.end).add(1,'days').toDate()]))
        .elasticY(true)
        .xAxisLabel('Time(s)')
        .brushOn(false)
        .mouseZoomable(true)
        .rightYAxisLabel(rightYAxisLabel)
        .yAxisLabel(leftYAxisLabel)
        .legend(dc.legend().x(xs*0.42).y(ys*0).itemHeight(16).gap(4))
        .margins({top: 40, right: 60, bottom: 40, left: 40})
        .renderHorizontalGridLines(true)
        .renderVerticalGridLines(true)
        .compose(subCharts)
        .render();
}
