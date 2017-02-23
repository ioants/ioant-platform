// Global variables
var numberOfPoints;
//



//=============================================================================
//  handleData function
//  Desc: Will request data from stream given a specific timeframe (start, end)
//=============================================================================
function handleData(error, streamData) {
    streamValues = streamData[0];
    streamInfo = streamData[1];
    streamConfig = streamData[2].settingFound;
    if (streamValues == false){
        alert('No values available');
        return;
    }

    if (error) {
        throw error;
    }
    // Update number of raw datapoints
    $("#rawpts").text("("+streamValues.length+")");

    //Check if streamTable exists
    if ($(streamTableId).length) {
        clearTable();
        populateTable();
    }

    // Produce chart if configuration exists
    if (streamConfig){
        renderCharts();
    }

    // Set range
};

//=============================================================================
//  clearTable function
//  Desc: Empty rows in data table
//=============================================================================
function clearTable() {
    $(streamTable).empty();
}

//=============================================================================
//  populateTable function
//  Desc: populate stream table if to be rendered
//=============================================================================
function populateTable() {
    var maxNumberOfRows = 100;
    var tableTitle = "Table";
    if (streamConfig != null && typeof streamConfig !== 'undefined' && streamConfig != false){
        maxNumberOfRows = streamConfig.dataTable.maxNumberOfRows;
        tableTitle = streamConfig.dataTable.tableTitle;
    }

    $(streamTable).append("<h2>"+tableTitle+"</h2>")
    $(streamTable).append("<div class='stable'>");
    $(streamTable).children('.stable').append("<div class='srow header green'>");
    var rowheader = $(streamTable).children('.stable').children('.srow')
    for(var key in streamInfo.proto) {
        rowheader.append("<div class='scell'>" + streamInfo.proto[key].field);
    }
    rowheader.append("<div class='scell'> timestamp");

    if (streamValues.length < maxNumberOfRows){
        maxNumberOfRows = streamValues.length;
    }

    for (var i = 0, len = maxNumberOfRows; i < len; i++) {
        $(streamTable).children('.stable').append("<div class='srow'>");
        var currentRow = $('.stable .srow:nth-child('+(i+2)+')')
        for(var key in streamInfo.proto) {
            var value = 0;
            if (typeof streamInfo.proto[key].enum !== 'undefined'){
                rawValue = streamValues[i][streamInfo.proto[key].field];
                var value = streamInfo.proto[key].enum[rawValue].toLowerCase();
            }
            else{
                var value = streamValues[i][streamInfo.proto[key].field];
            }
            currentRow.append("<div class='scell'>"+value);
        }
        currentRow.append("<div class='scell'>"+moment(streamValues[i]['ts']).format('MMMM Do YYYY, H:mm:ss'));
    }
}

//=============================================================================
//  renderCharts function
//  Desc: Create chart containers, configures dc charts and populates with data
//=============================================================================
function renderCharts() {
    if (isNewData){
        if (streamValues == false){
            alert('No values available');
            return;
        }
        // Format time variables
        var dateFormat = d3.time.format.iso;
        streamValues.forEach(function(d) {
            d.ts= dateFormat.parse(new Date(d.ts))
            d.second = d3.time.second(d.ts);
        });

        createCharts();
        isNewData = false;
    }

    for (var key in chartsArray){
        chart = chartsArray[key];
        generateData(chart, streamConfig.charts[key]);
        chart.render();
    }
}

//=============================================================================
//  findMaxMin function
//  Desc: Finds the max and min of a data set
//  returns: array containing min, max and diff of these
//=============================================================================
function findMaxMin(values){
    var minValue = Number.POSITIVE_INFINITY;
    var maxValue = Number.NEGATIVE_INFINITY;
    var tmp;
    for (var i=values.length-1; i>=0; i--) {
        tmp = values[i].value;
        if (tmp < minValue) minValue = tmp;
        if (tmp > maxValue) maxValue = tmp;
    }
    return [minValue, maxValue];
}

//=============================================================================
//  createCharts function
//  Desc: Initialize dc charts depending on configuration
//=============================================================================
function createCharts(){

    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth,
        y = w.innerHeight|| e.clientHeight|| g.clientHeight;

    // Go through stream configurations
    for (var key in streamConfig.charts){
        chartConfig = streamConfig.charts[key]

        if (chartConfig.type === "line"){
            if($("#line-chart"+key).length === 0){
                $("#stream-chart").append("<h2>"+chartConfig.title+"</h2>")
                $("#stream-chart").append("<div id='line-chart"+key+"'>");
                $("#stream-chart").append("<div class='clear' style='clear: both;'></div>");
                chartsArray[key] = dc.lineChart("#line-chart"+key);
            }
        }
        else if (chartConfig.type === "bar") {
            if($("#bar-chart"+key).length === 0){
                $("#stream-chart").append("<h2>"+chartConfig.title+"</h2>")
                $("#stream-chart").append("<div id='bar-chart"+key+"'>");
                $("#stream-chart").append("<div class='clear' style='clear: both;'></div>");
                chartsArray[key] = dc.barChart("#bar-chart"+key);
            }
        }
        chartsArray[key].width(x*0.7)
                         .height(y*0.6)
                         .zoomOutRestrict(false)
                         .x(d3.time.scale().domain(currentRange))
                         .margins({top: 60, right: 60, bottom: 60, left: 60})
                         .transitionDuration(100)
                         .brushOn(false)
                         .mouseZoomable(true)
                         .elasticY(false)
                         .elasticX(false)
                         .yAxisLabel(streamConfig.charts[key].yLabel);

        if (key == 0)
        {
            //Add zoom - Makes first chart master (other chats will zoom when master is zoomed)
            chartsArray[0].on('filtered', function(chart) {
                                filter = chart.filter();
                                for (var k in chartsArray){
                                    if (k > 0)
                                        chartsArray[k].focus(filter);
                                }
                                currentRange = [filter[0], filter[1]];
                                dc.redrawAll();
                            });
        }
    }

}

//=============================================================================
//  generateData function
//  Desc: Define and assign data to chart
//=============================================================================
function generateData(chart, chartConfig){
    console.log(chartConfig);
    var fieldOfInterest = chartConfig.fieldName;
    var crossfilter_origin = crossfilter(streamValues);
    var dimension_origin = crossfilter_origin.dimension(function (d) { return d.second });
    var lengths;
    var xLabel;

    lengths = dimension_origin.group().reduceSum(function(d) {
       return d[fieldOfInterest];
    });

    var maxY;
    var minY;
    var yDomain;
    console.log("autoFit:" + toAutoFit)
    if (toAutoFit || (chartConfig.yMax == chartConfig.yMin)){
        valueTable = lengths.top(lengths.size());
        var maxMinY = findMaxMin(valueTable);
        minY = maxMinY[0];
        maxY = maxMinY[1];
        var diff = maxY - minY;
        yDomain = [minY-diff*0.1, maxY+diff*0.1];
    }
    else {
        minY = chartConfig.yMin;
        maxY = chartConfig.yMax;
        yDomain = [minY, maxY];
    }

    xLabel = fieldOfInterest + " per second";

    //Update number visible data points
    numberOfPoints = lengths.size();
    $("#datapts").text(numberOfPoints);

    var numberFormat = d3.format('.2f');
    var dateFormat = d3.time.format('%Y-%m-%d %H:%M:%S')
    var hourFormat = d3.time.format('%H:%M:%S')


    chart
        .dimension(dimension_origin)
        .group(lengths)
        .xAxisLabel(chartConfig.xLabel)
        .y(d3.scale.linear().domain(yDomain))
        .valueAccessor(function (d) {
            return d.value;
         })
         .title(function (p) {
             var timestamp_string = dateFormat(p.key);
             var value_string;
             value_string = 'Value: ' +numberFormat(p.value);
             return [
                 'Timestamp:' + timestamp_string,
                 value_string
             ].join('\n');
         });
}
