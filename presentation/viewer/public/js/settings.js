
var currentStreamId;
var currentMessageType;
var chartFields;
var currentChartIndex

var storedSettings;
var fieldMetaList;
var compositeChartSetting ;
var streamFields;
var subchartSetting;


$('.settings-link').click(function() {
    currentStreamId = $(this).data('streamid');
    currentMessageType = $(this).data('msgtype');
    loadFormData(currentStreamId, currentMessageType)
});

$('#addChart').click(function() {
    currentChartIndex++;

    $('#chartsArea').append("<div id='div_chart_"+currentChartIndex+"'>")
    $('#div_chart_'+currentChartIndex).append(
                                    "<h3 class='chartTitle' name='label_chart_"+currentChartIndex+"'>"
                                    +"Chart "
                                    +" (<a class='removeChart' data-index='"+currentChartIndex+"'>X</a>)</h3>");
    parseObject($('#div_chart_'+currentChartIndex), false, subchartSetting, currentChartIndex);
});

$('body').on('click', '.removeChart', function() {
    // do something
    chartIndexSelected = $(this).data('index');
    $('#div_chart_'+chartIndexSelected).remove();
});

$('#streamSettingsForm').submit(function(e) {
     e.preventDefault();
     var rest_request_setting_save = "/streams/settingssave?"+$('#streamSettingsForm').serialize();
     queue()
         .defer(d3.json, rest_request_setting_save)
         .awaitAll(updateOnSettingsSave);
});

function updateOnSettingsSave(error, result){

    if (result[0]){
        $( ".white-popup" ).animate({
            opacity: 0.0
        }, 1000, function() {
                console.log("done");
                $(".white-popup").removeAttr('style');
                $.magnificPopup.close()
        });
    }
    else{
        $( ".white-popup" ).animate({
            left: "+=60px"
        }, 250, function() {
            $( ".white-popup" ).animate({
                left: "-=120px"
            }, 250, function() {
                $( ".white-popup" ).animate({
                    left: "+=60px"
                }, 250, function() {
                        console.log("done");
                });
            });
        });
    }
}

function loadFormData(streamId, currentMessageType){
    var rest_request_setting = "/streams/settings?streamid="+streamId+"&msgtype="+currentMessageType;

    queue()
        .defer(d3.json, rest_request_setting)
        .awaitAll(createForm);
}


function createForm(error, streamSettingBlob) {
    var formHandle = $('#streamFields');
    formHandle.empty();
    formHandle.append("<input type='hidden' name='streamId' value='"+currentStreamId+"'/>");
    createFormFields(formHandle, streamSettingBlob);
}

function createFormFields(formHandle, streamSettingBlob){
    storedSettings = streamSettingBlob[0].settingFound;
    fieldMetaList = streamSettingBlob[0].fieldMetaList;
    streamFields = streamSettingBlob[0].streamSetting;
    subchartSetting = streamSettingBlob[0].subchartSetting;
    currentChartIndex = 0;

    //Generate top fields
    parseObject(formHandle, storedSettings, streamFields, -1);

    if (storedSettings != false){
        setPresentationTemplateFields(storedSettings.presentationTemplate);
    }
    else {
        setPresentationTemplateFields(streamFields.presentationTemplate[0]);
    }
}

function setPresentationTemplateFields (template){
    if (template == 'chart'){
        //Generate data table object fields
        $('[name="label_dataTable"]').after("<div id=dataTableArea>");
        if (!storedSettings){
            parseObject($('#dataTableArea'), streamFields.dataTable, streamFields.dataTable, -1);
        }
        else {
            console.log(storedSettings);
            parseObject($('#dataTableArea'), storedSettings.dataTable, storedSettings.dataTable, -1);
        }

        $('[name="label_subcharts"]').after("<div id=chartsArea>");
        if (storedSettings){
            for (var chartIndex in  storedSettings.subcharts){
                currentChartIndex = parseInt(chartIndex);
                $('#chartsArea').append("<div id='div_chart_"+chartIndex+"'>")
                $('#div_chart_'+chartIndex).append("<h3 class='chartTitle' name='label_chart_"+chartIndex+"'>"+"Chart (<a class='removeChart' data-index='"+currentChartIndex+"'>X</a>)</h3>")
                parseObject($('#div_chart_'+currentChartIndex), storedSettings.subcharts[chartIndex], subchartSetting, chartIndex);
            }
        }
    }
    else if (template == 'imagegallery') {

    }
    else {
        console.log("unknown presentation template type:" + template)
    }
}

function parseObject(formHandle, settingFound, objectFields, index){

    if (index == -1)
        index = "";
    else {
        index = "_"+index;
    }
    var fieldValue

    for(var key in objectFields){
        //console.log(key + " " + typeof objectFields[key] +" "+ Array.isArray(objectFields[key]))
        if (typeof settingFound[key] !== 'undefined'){
            fieldValue = settingFound[key];
            if (typeof fieldValue === 'boolean'){
                if (fieldValue){
                    fieldValue = 'true';
                }
                else{
                    fieldValue = 'false';
                }
            }
        }
        else {
            fieldValue = objectFields[key];
        }

        formHandle.append("<label for='"+key+index+"' name='label_"+key+index+"'>"+fieldMetaList[key][0]+"</label>");
        if (typeof objectFields[key] === 'object'){
            if (Array.isArray(objectFields[key])){
                formHandle.append("<select name='"+key+index+"'>");
                for (var option in objectFields[key]){
                    if (fieldValue == objectFields[key][option])
                        $('[name='+key+index+']').append("<option value='"+objectFields[key][option]+"' selected>"+objectFields[key][option]+"</option>");
                    else {
                        $('[name='+key+index+']').append("<option value='"+objectFields[key][option]+"'>"+objectFields[key][option]+"</option>");
                    }
                }
            }
            else{
                // Handle nested object
            }
        }
        else if (typeof objectFields[key] === 'number' || typeof objectFields[key] === 'string'){
            formHandle.append("<input type='text' name='"+key+index+"' value='"+fieldValue+"'/>");
        }
        else if (typeof objectFields[key] === 'boolean'){
            if (fieldValue === null)
            {
                fieldValue = true;
            }

            if (fieldValue){
                formHandle.append("<input type='checkbox' name='"+key+index+"'  checked/>");
            }
            else{
                formHandle.append("<input type='checkbox' name='"+key+index+"' />");
            }
        }
    }
}
