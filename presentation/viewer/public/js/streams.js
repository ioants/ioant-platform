//=============================================================================
//  Global variables
//=============================================================================

//=============================================================================
//  On load of streams table
//=============================================================================
$('.filterIcons').click(function() {
    console.log("clicked!");
    var selectedMessageType = $(this).data('msgtype');
    var isActive = $(this).data('isactive');
    if (isActive == 1){
        //Deactivate
        $(this).data('isactive', 0);
        $(this).css('opacity', 0.5);
        filterMessageType(selectedMessageType, true);
    }
    else{
        //Active
        $(this).data('isactive', 1);
        $(this).css('opacity', 1.0);
        filterMessageType(selectedMessageType, false);
    }
});

function filterMessageType(message_type, hide){
    if (hide){
        $('.type_'+message_type).css('display', 'none')
    }
    else{
        $('.type_'+message_type).css('display', 'table-row')
    }

}


$(function() {

});
