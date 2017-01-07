console.log("Imagegallery script loaded")
$(function() {
    $('#portfolio').magnificPopup({
      delegate: 'a',
      type: 'image',
      image: {
        cursor: null,
        titleSrc: 'tsete'
      },
      gallery: {
        enabled: true,
        preload: [0,1], // Will preload 0 - before current, and 1 after the current image
        navigateByImgClick: true
  	}
    });
});

function handleData(error, streamData) {
    streamValues = streamData[0];
    streamInfo = streamData[1];
    streamConfig = streamData[2].settingFound;

    $("#datapts").text(streamValues.length);

    $("#portfolio").empty();
    var imageReferences = streamValues;
    $("#gTitle").text("Gallery: "+streamInfo.global+" / "+streamInfo.local+" / " +streamInfo.client_id);

    imageReferences.forEach(function (item){
        $("#portfolio").append('<li><a href="http://'+item.reference_link+'" title="'+item.reference_link+'">\
        <img src="http://'+item.reference_link+'"/>'+moment(item.ts).format('MMMM Do YYYY, H:mm:ss')+'</a></li>');
    });
    $("#brokenImagesLabel").hide();
    $("#brokenImages").hide();
    ImageBrokenCheck();
};

function updateImageBrokeLabel(badImagesNum){
    $("#brokenImagesLabel").show();
    $("#brokenImages").text(badImagesNum);
    $("#brokenImages").show();
}

function ImageBrokenCheck(){
    function checkImg(img) {
        if (img.naturalHeight <= 1 && img.naturalWidth <= 1) {
            // undersize image here
            return false;
        }
        else {
            return true;
        }
    }
    var badImages = 0;
    $("#portfolio").each(function() {
        $("li", this).each(function() {
            // if image already loaded, we can check it's height now
            var cimg = $("img", this)["0"];
            var current_li = this;
            if (cimg.complete) {
                if (!checkImg(cimg)){
                    $(current_li).remove();
                    badImages += 1;
                    updateImageBrokeLabel(badImages);
                }
            } else {
                // if not loaded yet, then set load and error handlers
                $(cimg).load(function() {
                    if (!checkImg(cimg)){
                        $(current_li).remove();
                        badImages += 1;
                        updateImageBrokeLabel(badImages);
                    }

                }).error(function() {
                    $(current_li).remove();
                    badImages += 1;
                    updateImageBrokeLabel(badImages);
                });
            }
        });
    });
}
