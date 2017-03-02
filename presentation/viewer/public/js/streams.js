//=============================================================================
//  Global variables
//=============================================================================

//=============================================================================
//  On load of streams table
//=============================================================================
$('.filterIcons').click(function() {
    var isActive = $(this).attr('data-isactive');
    if (isActive == 1){
        //Deactivate
        $(this).attr('data-isactive', 0);
        $(this).css('opacity', 0.5);
        if ($(this).attr('data-msgtype')){
            var selectedMessageType = $(this).data('msgtype');
            filterMessageType(selectedMessageType, true);
        }
        else{
            $(this).attr('title', "Show old streams");
            filterOldStreams(true);
        }
    }
    else{
        //Active
        $(this).attr('data-isactive', 1);
        $(this).css('opacity', 1.0);
        if ($(this).attr('data-msgtype')){
            var selectedMessageType = $(this).attr('data-msgtype');
            filterMessageType(selectedMessageType, false);
        }
        else{
            $(this).attr('title', "Hide old streams");
            filterOldStreams(false);
        }
    }
});

$('.filterAllIcons').click(function() {
    var newStreams = $('.srow').filter(function() {
                    if ($(this).attr('data-isold') !== undefined){
                        return $(this);
                    }
                });
    newStreams.css('display', 'none');

    var filterIcons = $('.filterIcons').filter(function() {
                    if ($(this).attr('data-msgtype') !== undefined){
                        $(this).attr('data-isactive', 0);
                        return $(this);
                    }
                });
    filterIcons.css('opacity', '0.5');
});


function filterMessageType(message_type, hide){

    var streamsOfCertainType = $('.srow').filter(function() {
                    if ($(this).attr('data-msgtype') !== undefined && $(this).attr('data-msgtype') == message_type){
                        if($('.oldStreamsIcon').attr('data-isactive') == 0 && $(this).attr('data-isold') == 1){

                        }
                        else{
                            return $(this);
                        }

                    }
                });

    if (hide){
        streamsOfCertainType.css('display', 'none');
    }
    else {
        streamsOfCertainType.css('display', 'table-row')
    }
}

function filterOldStreams(hide){


    var filteredMessageTypesArray = [];
    var filteredMessageTypes = $('.filterIcons').filter(function() {
                    if ($(this).attr('data-msgtype') !== undefined && $(this).attr('data-isactive') == 0){
                        filteredMessageTypesArray.push($(this).attr('data-msgtype'));
                        return $(this);
                    }
                });

    var oldStreams = $('.srow').filter(function() {
                    if ($(this).attr('data-isold') !== undefined && $(this).attr('data-isold') == 1){
                        if (hide){
                            $(this).css('display', 'none');
                        }
                        else{
                            // Only turn on streams of messag type that has not been filtered
                            if (filteredMessageTypesArray.indexOf($(this).attr('data-msgtype')) == -1){
                                $(this).css('display', 'table-row');
                            }
                        }

                        return $(this);
                    }
                });

}

$(function() {

});
