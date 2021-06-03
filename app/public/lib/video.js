// Older browsers might not implement mediaDevices at all, so we set an empty object first
if (navigator.mediaDevices === undefined) {
  navigator.mediaDevices = {};
}

// Some browsers partially implement mediaDevices. We can't just assign an object
// with getUserMedia as it would overwrite existing properties.
// Here, we will just add the getUserMedia property if it's missing.
if (navigator.mediaDevices.getUserMedia === undefined) {
  navigator.mediaDevices.getUserMedia = function(constraints) {

    // First get ahold of the legacy getUserMedia, if present
    var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    // Some browsers just don't implement it - return a rejected promise with an error
    // to keep a consistent interface
    if (!getUserMedia) {
      return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
    }

    // Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
    return new Promise(function(resolve, reject) {
      getUserMedia.call(navigator, constraints, resolve, reject);
    });
  }
}

var playVideo = function(constraints, elementId, callBackAfterLoaded){
	navigator.mediaDevices.getUserMedia(constraints)
	.then(function(stream) {
	  var video = document.querySelector('#'+elementId);
	  // Older browsers may not have srcObject
	  if ("srcObject" in video) {
		video.srcObject = stream;
	  } else {
		// Avoid using this in new browsers, as it is going away.
		video.src = window.URL.createObjectURL(stream);
	  }
	  video.onloadedmetadata = function(e) {
		video.play();
		callBackAfterLoaded();
	  };
	})
	.catch(function(err) {
	  console.log(err.name + ": " + err.message);
	});
}
var getObjectURL = function(file) 
{
	var url = null ;
	if (window.createObjectURL!=undefined) 
	{
		// basic
		url = window.createObjectURL(file) ;
	}
	else if (window.URL!=undefined) 
	{
		// mozilla(firefox)
		url = window.URL.createObjectURL(file) ;
	} 
	else if (window.webkitURL!=undefined) {
		// webkit or chrome
		url = window.webkitURL.createObjectURL(file) ;
	}
	return url ;
}
var captureImage = function(video,imgId) {
	var scale = 1;
	var canvas = document.createElement("canvas");
	canvas.width = video.videoWidth * scale;
	canvas.height = video.videoHeight * scale;
	canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

	var img =  document.querySelector('#'+imgId);
	img.src = canvas.toDataURL("image/jpeg");
	$(img).data(canvas);
	//canvas.toBlob(function(blob) {
	//	img.src = canvas.toDataURL("image/jpeg");
	//	$(img).data(blob);
	//},"image/jpeg");
}
function toImgBlob(urlData){
     var bytes=window.atob(urlData),
         n=bytes.length,
         u8arr=new Uint8Array(n);
     while(n--){
          u8arr[n]=bytes.charCodeAt(n);
     }
     return new Blob([u8arr],{type:'image/jpg'});
}
function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}
function readBlobAsDataURL(blob, callback) {
    var a = new FileReader();
    a.onload = function(e) {callback(e.target.result);};
    a.readAsDataURL(blob);
}