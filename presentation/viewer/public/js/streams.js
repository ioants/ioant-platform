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
            $(this).attr('title', "Hide old streams");
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
            $(this).attr('title', "Show old streams");
            filterOldStreams(false);
        }
    }
});


function filterMessageType(message_type, hide){

    if (hide){
        $('.type_'+message_type).css('display', 'none');
    }
    else{
        if($('.oldStreamsIcon').attr('data-isactive') == 0){
            var newStreams = $('.srow').filter(function() {
                            if ($(this).attr('data-isold') !== undefined && $(this).attr('data-isold') == 0){
                                return $(this);
                            }
                        });
            newStreams.css('display', 'table-row');
        }
        else{
            $('.type_'+message_type).css('display', 'table-row');
        }
    }
}

function filterOldStreams(hide){
    var allStreamRows = $(".srow");
    var oldStreams = $('.srow').filter(function() {
                    if ($(this).attr('data-isold') !== undefined && $(this).attr('data-isold') == 1){
                        return $(this);
                    }
                });
    oldStreams.each(function( index ) {
        if (hide){
            $(this).css('display', 'none');
        }
        else{
            $(this).css('display', 'table-row')
        }
    });

}

$(function() {

});
