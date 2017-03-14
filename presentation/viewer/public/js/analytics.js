//=============================================================================
//  Global variables
//=============================================================================
var streamList;
var formFields;
var formStreamFields;
var formHandle;
var selectStreamsHandle;



$(function() {
    formHandle = $('#analyticFields');
    formHandle.empty();
    selectStreamsHandle = $('#selectedStreams');
    selectStreamsHandle.empty();
    loadFormData();
});

$('#analyticsForm').submit(function(e) {
     e.preventDefault();
     if ($("[name='name']").val().length > 0){
         var rest_request_analytic_save = "/analytics/add?"+$('#analyticsForm').serialize();
         queue()
            .defer(d3.json, rest_request_analytic_save)
            .awaitAll(updateOnAnalyticsSave);
     }
     else{
         alert("Must fill in a name for the analytic!")
     }

});

function updateOnAnalyticsSave(error, result){
    if (result[0]){
        $( ".white-popup" ).animate({
            opacity: 0.0
        }, 1000, function() {
                console.log("done");
                $(".white-popup").removeAttr('style');
                $.magnificPopup.close()
                location.reload(true);
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

// Remove selected stream
$('body').on('click', ".remove_selected_stream", function() {

    var sid_to_remove = $(this).data("sid")
    $('.selected_stream_box').each((index, box) => {
        if ($(box).data("sid") == sid_to_remove){
            console.log("removed:" + $(box).data("sid"))
            $(box).remove()
            $("[name='analytics_row']").each((i, tablerow) => {
                if ($(tablerow).data("sid") == sid_to_remove){
                    $(tablerow).css("opacity", 1.0);
                    $(tablerow).data("selected", 0);
                }
            })
        }
    })
})

// Select stream
$('body').on('click', "[name='analytics_row']", function() {
    console.log("woop woop!")

    console.log($(this).data("selected"))
    console.log($(this).data("sid"))
    console.log('____');

    //Not already selected
    if ($(this).data("selected") == 0){
        $(this).css("opacity", 0.3);
        $(this).data("selected", 1);
        //Add to stream to form

        formStreamFields[1].array_data = [];
        var selectedStreamHandle = $('<div class="selected_stream_box" data-sid="'+$(this).data("sid")+'">').appendTo(selectStreamsHandle)
        $('<div class="selected_stream_bar"> Stream: '+$(this).data("sid")+' <img src="/img/icons/noun_30090_cc.png" class="remove_selected_stream" data-sid="'+$(this).data("sid")+'"/> </div>').appendTo(selectedStreamHandle)
        streamList.forEach((stream) => {
            if(stream.sid.toString() == $(this).data("sid")){
                stream.message_fields.forEach((field)  => {
                    console.log(field)
                    formStreamFields[1].array_data.push({name: field, value: field});
                });
                parseObject(selectedStreamHandle, formStreamFields, $(this).data("sid"));
            }
        });
    }
    else if ($(this).data("selected") == 1){
        //$(this).css("opacity",1.0);
        //$(this).data("selected", 0);
    }



});

function loadFormData(){
    var rest_request_values = "/streams/list";
    var rest_request_structure = "/analytics/structure";

    queue()
        .defer(d3.json, rest_request_values)
        .defer(d3.json, rest_request_structure)
        .awaitAll(createAnalyticsForm);
}


function createAnalyticsForm(error, data) {
    streamList = data[0].stream_list;
    formFields = data[1].fields;
    formStreamFields = data[1].streamFields;

    console.log(formHandle)
    console.log(streamList)
    console.log(formFields)
    console.log(formStreamFields)

    //Prepare form fields + empty stream selection list

    parseObject(formHandle, formFields, "");

    // populate streamlist data-array
    var tableS = $("<div class='stable' style='padding:10px'>").appendTo('#streamList');
    var tableHandle = $("<div class='srow header' name='heady'>").appendTo(tableS);
    $(tableHandle).append("<div class='scell'>ID");
    $(tableHandle).append("<div class='scell'>Topic");
    $(tableHandle).append("<div class='scell'>Client");
    $(tableHandle).append("<div class='scell'>Type");
    $(tableHandle).append("<div class='scell'>Index");


    for (var key in streamList){
        var stream = streamList[key];
        var rowHandle = $("<div class='srow' style='cursor: pointer' name='analytics_row' data-sid="+stream.sid+" data-selected="+0+">").appendTo(tableS);
        $(rowHandle).append("<div class='scell'>"+stream.sid);
        $(rowHandle).append("<div class='scell'>"+stream.global+"/"+stream.local);
        $(rowHandle).append("<div class='scell'>"+stream.client_id);
        var imageCell = $("<div class='scell'>").appendTo(rowHandle);
        $(imageCell).append("<img src='"+stream.image_type_url+"' class='imageIcons' title='"+stream.message_name+"'>");
        $(rowHandle).append("<div class='scell'>"+stream.stream_index);
    }
}


function parseObject(formHandle, objectFields, index){
    console.log(objectFields)
    var sid = index;
    if (index > 0){
        index = "_" + index;
    }
    for(var key in objectFields){
        console.log(objectFields[key].name + " " + typeof objectFields[key].type +" "+ Array.isArray(objectFields[key].type))

        if (objectFields[key].name != 'sid'){
            formHandle.append("<label for='"+objectFields[key].name+index+"' name='label_"+objectFields[key].name+index+"'>"+objectFields[key].description+"</label>");
            if (typeof objectFields[key].type === 'object'){
                if (Array.isArray(objectFields[key].type)){
                    formHandle.append("<select name='"+objectFields[key].name+index+"'>");
                    for (var key2 in objectFields[key].array_data){
                        var option = objectFields[key].array_data[key2];
                        console.log("option:"+option)
                        $('[name='+objectFields[key].name+index+']').append("<option value='"+option.value+"' >"+option.name+"</option>");
                    }
                }
                else{
                    // Handle nested object
                }
            }
            else if (typeof objectFields[key].type === 'number' || typeof objectFields[key].type === 'string'){
                formHandle.append("<input type='text' name='"+objectFields[key].name+index+"' value=''/>");
            }
            else if (typeof objectFields[key].type === 'boolean'){
                formHandle.append("<input type='checkbox' name='"+objectFields[key].name+index+"'/>");
            }
        }
        else{
            formHandle.append("<input type='hidden' name='"+objectFields[key].name+index+"' value='"+sid+"'/>");
        }
    }
}
