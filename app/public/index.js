$(function() {
	const TXT_IMG_FILE = "本地照片";
	const TXT_IMG_CAMERA = "摄像头扫脸";
	const TXT_BTN_FILE = "人脸识别";//"照片识别";
	const TXT_BTN_CAMERA = "人脸识别";//"扫脸识别";
	var imgSourceMode = 0;//0:摄像头,1:本地图片,2:比对照片
	var hasFace1 = false;
	var hasFace2 = false;//比对时的第二张照片
	var userObj = {
		work_num : 99999,
		name : "",
		imgs : null
	}
	initPage();
	
	function initPage(){
		$("a.control-btn").button();
		setFileuploadEvent();
		switchCameraMode();
	}
	function switchImgMode(){
		switchMode(1);
	}
	function switchCameraMode(){
		switchMode(0);
	}
	function switchMode(mode){
		if(mode==1 && imgSourceMode==0){
			$('#video').stopTime();
			$('.face').remove();
			$("#div-video-container").hide();
			$("#div-img-container").show();
			imgSourceMode = 1;
		}
		if(mode==0){
			$('.face').remove();
			$("#div-video-container").show();
			$("#div-img-container").hide();
			initVideo();
			imgSourceMode = 0;
		}
	}
	function checkHasFace1(){
		if(!hasFace1 && imgSourceMode == 0){
			captureFace1();
		}
	}
	function setFileuploadEvent(){
		$("#file-selImg").fileupload({
			acceptFileTypes: /(\.|\/)(jpg|png)$/i,
			dataType: "json",
			add: function (e, data) {
				//var imgSrcUrl = getObjectURL(data.files[0]);
				readBlobAsDataURL(data.files[0], function (dataurl){
					$('#img-selImg').attr("src",dataurl).data(data.files[0]);
				});
				switchImgMode();
			},
			done: function (e, data) {
				data.context.text("Upload finished.");
			}
		});
		$("#btn-image-file").off("click")
			.on("click",function(){
				$("#file-selImg").click();
		});
		$("#btn-image-camera").off("click")
		.on("click",function(){
			//switchCameraMode();
			window.location.reload();
		});
		$("#btn-to-register").off("click")
		.on("click",function(){
			checkHasFace1();
			$( "#dialog-form" ).dialog( "open" );
		});
		$("#btn-search").off("click")
		.on("click",function () {
			checkHasFace1();
			var formData = new FormData();
			var imgFile = null;
			if(imgSourceMode==0){
				imgFile = dataURLtoBlob($('#img-cameraImg').attr("src"));
				formData.append('image', imgFile, "image.jpeg");
			}else{
				imgFile = dataURLtoBlob($('#img-selImg').attr("src"));
				formData.append('image', imgFile, "image.jpeg");
			}
			$.ajax({
				url : "./face/search",
				type : "post",
				data : formData,
				processData : false,
				contentType : false,
				beforeSend : function(){
					$("#dialog-load").dialog("open");
				},
				success: function(data){
					if(!!data && !!data.error){
						$("#dialog-alert").text(data.error).dialog("open");
						return;
					}
					$("#dialog-result fieldset").hide();
					$("#dialog-result input").val("");
					$("#result-title").text("搜索结果");
					$("#result-workNum").val(data["workNum"]);
					$("#result-name").val(data["userName"]);
					$("#result-gender1").val(data["gender1"]=="Male"?"男":"女");
					$("#result-age1").val(data["age1"]);
					$("#result-beauty1").val(data["beauty1"]);
					$("#result-img1").attr("src", "."+data["imgFile1"]);
					$("#result-img2").attr("src", "."+data["imgFile2"]);
					$("#result-confidence").val(data["confidence"]);
					$("#result-baseinfo").show();
					$("#result-imginfo1").show();
					$("#result-imginfo2").show();
					$("#dialog-load").dialog("close");
					$("#dialog-result").dialog("open");
				},
				error:function(){
					$("#dialog-load").dialog("close");
					$("#dialog-alert").text("搜索失败，确定上传了人脸照片？").dialog("open");
				}
			});
		});
		$("#btn-compare").off("click")
		.on("click",function () {
			captureFace1();
			$("#file-selImg4compare").click();
		});
		$("#file-selImg4compare").fileupload({
			acceptFileTypes: /(\.|\/)(jpe?g|png)$/i,
			dataType: "json",
			done: function (e, data) {

			}
		});
		$("#file-selImg4compare").on("change", function(){
			var formData = new FormData();
			//var imgFile = new Array();
			var imgFile = null;
			if(imgSourceMode==0){
				//imgFile.push(dataURLtoBlob($('#img-cameraImg').attr("src")));
				imgFile = dataURLtoBlob($('#img-cameraImg').attr("src"));
				formData.append('image', imgFile, "image.jpeg");
			}else{
				//imgFile.push(dataURLtoBlob($('#img-cameraImg').attr("src")));
				dataURLtoBlob(dataURLtoBlob($('#img-cameraImg').attr("src")));
				formData.append('image', imgFile, "image.jpeg");
			}
			var imageFile2 = $(this)[0].files[0];
			//imgFile.push(imageFile2);
			formData.append('image', imageFile2, "image.jpeg");
			$.ajax({
				url : "./face/compare",
				type : "post",
				data : formData,
				processData : false,
				contentType : false,
				beforeSend : function(){
					$("#dialog-load").dialog("open");
				},
				success: function(data){
					if(!!data && !!data.error){
						$("#dialog-alert").text(data.error).dialog("open");
						return;
					}
					$("#dialog-result fieldset").hide();
					$("#dialog-result input").val("");
					$("#result-title").text("比较结果");
					$("#compare-pic1").attr("src", $('#img-cameraImg').attr("src")).load();;
					readBlobAsDataURL(imageFile2, function (dataurl){
						$('#compare-pic2').attr("src",dataurl).load();
					});
					$("#compare-confidence").val(data["confidence"]);
					$("#result-compare").show();
					$("#dialog-load").dialog("close");
					$("#dialog-result").dialog("open");
				},
				error:function(){
					$("#dialog-load").dialog("close");
					$("#dialog-alert").text("搜索失败，确定上传了人脸照片？").dialog("open");
				}
			});
		});
	}
	function initVideo(){
		var constraints = { audio: false, video: true };
		playVideo(constraints,"video",initSnapshotTimer);
	}
	
	function registerUserFace(){
		var formData = new FormData();
		var workNum = $("#workNum").val();
		var userName = $("#name").val();
		var imgFile = null;
		if(imgSourceMode==0){
			imgFile = dataURLtoBlob($('#img-cameraImg').attr("src"));
			formData.append('image', imgFile, "image.jpeg");
		}else{
			imgFile = dataURLtoBlob($('#img-selImg').attr("src"));//$('#img-selImg').data();//dataURLtoBlob($('#img-selImg').attr("src"));
			formData.append('image', imgFile, "image.jpeg");
		}
		formData.append("workNum", workNum);
		formData.append("name", userName);
		$.ajax({
			url : "./face/register",
			type : "post",
			data : formData,
			processData : false,
			contentType : false,
			beforeSend : function(){
				$("#dialog-load").dialog("open");
			},
			success: function(data){
				if(!!data && !!data.error){
					//alert(data.error);
					$("#dialog-alert").text(data.error).dialog("open");
				}
				$("#dialog-result fieldset").hide();
				$("#dialog-result input").val("");
				$("#result-title1").text("注册结果");
				$("#result-workNum").val(data["workNum"]);
				$("#result-name").val(data["userName"]);
				$("#result-gender1").val(data["gender"]=="Male"?"男":"女");
				$("#result-age1").val(data["age"]);
				$("#result-beauty1").val(data["beauty"]);
				$("#result-img1").attr("src", "."+data["imgFile"]);
				$("#result-baseinfo").show();
				$("#result-imginfo1").show();
				$("#dialog-load").dialog("close");
				$("#dialog-result").dialog("open");
			},
			error:function(){
				$("#dialog-load").dialog("close");
				//alert("注册失败，确定上传了人脸照片？");
				$("#dialog-alert").text("注册失败，确定上传了人脸照片？").dialog("open");
			}
		});
	}
	function registerUserFace(){
		var formData = new FormData();
		var workNum = $("#workNum").val();
		var userName = $("#name").val();
		var imgFile = null;
		if(imgSourceMode==0){
			imgFile = dataURLtoBlob($('#img-cameraImg').attr("src"));
			formData.append('image', imgFile, "image.jpeg");
		}else{
			imgFile = dataURLtoBlob($('#img-selImg').attr("src"));//$('#img-selImg').data();//dataURLtoBlob($('#img-selImg').attr("src"));
			formData.append('image', imgFile, "image.jpeg");
		}
		formData.append("workNum", workNum);
		formData.append("name", userName);
		$.ajax({
			url : "./face/register",
			type : "post",
			data : formData,
			processData : false,
			contentType : false,
			beforeSend : function(){
				$("#dialog-load").dialog("open");
			},
			success: function(data){
				if(!!data && !!data.error){
					//alert(data.error);
					$("#dialog-alert").text(data.error).dialog("open");
				}
				$("#dialog-result input").val("");
				$("#result-title1").text("注册结果");
				$("#result-workNum").val(data["workNum"]);
				$("#result-name").val(data["userName"]);
				$("#result-gender1").val(data["gender"]=="Male"?"男":"女");
				$("#result-age1").val(data["age"]);
				$("#result-beauty1").val(data["beauty"]);
				$("#result-img1").attr("src", "."+data["imgFile"]);
				$("#result-imginfo2").hide();
				$("#dialog-load").dialog("close");
				$("#dialog-result").dialog("open");
			},
			error:function(){
				$("#dialog-load").dialog("close");
				//alert("注册失败，确定上传了人脸照片？");
				$("#dialog-alert").text("注册失败，确定上传了人脸照片？").dialog("open");
			}
		});
	}
	function captureFace1(){
		if (!($('#video')[0].paused)){
			$('#video')[0].pause();
		}
		$('#video').stopTime();
		captureImage($('#video')[0], "img-cameraImg");
		hasFace1 = true;
	}
	function initSnapshotTimer(){
		$('#video').everyTime('1s','SnapshotTimer',function(){
			console.log(getDate('-log-: ')+" SnapshotTimer fired!");
			if ($('#video')[0].paused) {
				$('#video')[0].play();
				return;
			} else {
				$('#video')[0].pause();
			}
			$('.face').remove();
			$('#video').faceDetection({
				interval: 4,
				complete: function (faces) {
					//&& faces[0].confidence > 20
					if(faces.length > 0 && !!faces[0].confidence ){
						$('<div>', {
							'class':'face',
							'css': {
								'position': 'absolute',
								'left':     faces[0].x + 'px',
								'top':      faces[0].y + 'px',
								'width':    faces[0].width  + 'px',
								'height':   faces[0].height + 'px'
							}
						}).insertAfter(this);
						debug("faceDetection result:"+faces[0]+"!");
						captureFace1();
					}else{
						$('#video')[0].play();
					}
				},
				error:function (code, message) {
					//alert('Error: ' + message);
					$("#dialog-alert").text('Error: ' + message).dialog("open");
				}
			});
		});
	}
	//Begin 人脸登记
	$( "#dialog-form" ).dialog({
		autoOpen: false,
		height: 300,
		width: 350,
		modal: true,
		buttons: {
			"人脸登记": function() {
				var bValid = true;			
				bValid = bValid && $.isNumeric($("#workNum").val()) && $("#workNum").val().length == 5;
				bValid = bValid && $("#name").val() != 0 && $("#name").val().length < 10;
				
				if ( bValid ) {
					$(this).dialog("close");
					registerUserFace();
				}else{
					$("#dialog-alert").text("请正确输入你的工号和名字！").dialog("open");
					//alert("请正确输入你的工号和名字！");
				}
			},
			"取消": function() {
			  $( this ).dialog( "close" );
			}
		}
	});
	//end 人脸登记
	//Begin 结果展示
	$("#dialog-result").dialog({
		autoOpen: false,
		width: 350,
		modal: true,
		buttons: {
			"关闭": function() {
			  $( this ).dialog( "close" );
			}
		}
	});
	//end 结果展示
	$("#dialog-load").dialog({
		closeOnEscape: false,
		autoOpen: false,
		width: 350,
		modal: true,
		open: function (event, ui) {
			$(".ui-dialog-titlebar-close", $(this).parent()).hide();
		}
	});
	$("#dialog-alert").dialog({
		autoOpen: false,
		width: 350,
		modal: true,
		buttons: {
			"关闭": function() {
			  $( this ).dialog( "close" );
			}
		}
	});
});