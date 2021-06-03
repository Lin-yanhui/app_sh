var async = require('async');  
var express = require('express');
var multer=require('multer');
var uuid=require('uuid/v1');
var http = require('http');
var https = require('https');
var fs = require('fs');
var path = require('path');
var request = require('request');
var router = express.Router();
var apiConst = require('./../config/config.json');
//var userfaceClass = require('./userface');
//var userface = new userfaceClass();
var callFaceMode = true;

var storage = multer.diskStorage({
	//设置上传后文件路径，uploads文件夹会自动创建。
	destination: function (req, file, cb) {
		cb(null, './public/faces')
	}, 
	//给上传文件重命名，获取添加后缀名
	filename: function (req, file, cb) {
		var fileFormat = (file.originalname).split(".");
		cb(null, uuid() + "." + fileFormat[fileFormat.length - 1]);
	}
});
//添加配置文件到muler对象。
var uploadfile = multer({storage: storage,limits:{files:2}}).array("image", 2);
function httpsPostResult(url, data, next) {
    request.post({url:url, formData:data},
        function (_error, response, body) {
            if (!_error && response.statusCode == 200) {
				console.log('调用face++成功,url：'+url);
                next(JSON.parse(body));
            }else {
                console.log('调用face++报错了,错误信息：'+body+',url：'+url);
				var result = JSON.parse(body);
				next(null);
            }
        }
    );
}
var callFaceApi = function(url, data, callback, oldReq, oldRes){
	var callUrl = apiConst.faceApiUrl + url;
	data["api_key"] = apiConst.faceApiKey;
	data["api_secret"] = apiConst.faceApiSecret;
	httpsPostResult(callUrl,data,function(result){
		if(callback){
			callback(result, oldReq, oldRes);
		}
	});
}
//var saveUserface = function(workNum, userName, face_token, img_file, age, gender, beauty){
//	if(userface){
//		//call 记录数据库
//		if(workNum){
//			var obj = userface.findUser(workNum, userName);
//			if(obj){
//				userface.updateUser(workNum, userName);
//			}else{
//				userface.saveUser(workNum, userName);
//			}
//		}
//		if(face_token){
//			userface.saveFace(face_token, img_file, age, gender, beauty, workNum);
//		}
//	}else{
//		console.log('不能执行数据库！');
//	}
//}
var renameReqFilename = function(req, filename){
	var file = req.files[0];
	var img_file = file.filename;
	var fileFormat = img_file.split(".");
	fileFormat = fileFormat[fileFormat.length - 1];
	var filepath = path.join(__dirname, "../public/faces/");
	var newfilename = filename + "." + fileFormat;
	//setTimeout(function() {  
		fs.rename(filepath+img_file,filepath+newfilename, function(err){
			if(err){
				console.log('将上传文件改名为facetoken失败，oldname：'+img_file+',newname：'+newfilename);
			}else{
				console.log('将上传文件改名为facetoken，oldname：'+img_file+',newname：'+newfilename);
			}
		});
    //}, 50); 
	return newfilename;
}
var detectCallback = function(result, oldReq, oldRes){
	if(!result || !result["faces"] || !result["faces"][0]){
		oldRes.send({"error":"ERROR-识别人脸失败！"});
		return;
	}
	var face = result["faces"][0];
	var face_token = face["face_token"];
	var attributes = face["attributes"];
	var gender = attributes["gender"].value;
	var age = attributes["age"].value;
	var beauty = attributes["beauty"]["female_score"];
	if(gender == "Male"){
		beauty = attributes["beauty"]["male_score"];
	}
	var workNum = oldReq.body.workNum;
	var userName = oldReq.body.name;
	var newfilename = renameReqFilename(oldReq, face_token);
	
	var setuserid = function(callback){
		var userfaceData = {
			"face_token" : face_token,
			"user_id" : workNum+"-"+userName
		};
		callFaceApi("/face/setuserid", userfaceData, function(){
			setTimeout(function() {
				if(callback){
					callback(); 
				}
			}, 1000);
		});
	}
	var returnRes = function(){
		var sendData = {
			workNum : workNum,
			userName : userName,
			gender : gender,
			age : age,
			beauty : beauty,
			imgFile : "/faces/" + newfilename
		}
		oldRes.send(sendData);
	}
	var addface = function(){
		//加入faceset
		var facesetData = {
			"outer_id" : apiConst.faceOuterId,
			"face_tokens" : face_token
		}
		callFaceApi("/faceset/addface", facesetData);
	}

	returnRes();
	//saveUserface(workNum, userName, face_token, newfilename, age, gender, beauty);
	
	setTimeout(function() {  
      setuserid(addface); 
    }, 1000); 
	
}
var analyzeCallback = function(result){
	var analyzeResult = function(){
		if(!result || !result["faces"]){
			return {};
		}
		var face = result["faces"][0];
		var face_token = face["face_token"];
		var attributes = face["attributes"];
		var gender = attributes["gender"].value;
		var age = attributes["age"].value;
		var beauty = attributes["beauty"]["female_score"];
		if(gender == "Male"){
			beauty = attributes["beauty"]["male_score"];
		}
		return {
			face_token : face_token,
			gender : gender,
			age : age,
			beauty : beauty
		}
	}
	return analyzeResult();
}
var searchCallback = function(result, oldReq, oldRes){
	var searchResult = null;
	var face = null;
	if(!!result && !!(searchResult = result["results"]) && searchResult.length > 0
		&& !!result["faces"] && result["faces"].length > 0){
		face = searchResult[0];
	}else{
		oldRes.send({"error":"没找到图片中人脸对于的人！"});
		return;
	}
	var face_token = face["face_token"];
	var confidence = face["confidence"];
	var user_id = face["user_id"];
	var userinfo = [];
	var userName = "";
	var workNum = "";
	if(user_id){
		userinfo = user_id.split("-");
		workNum = userinfo[0];
		userName = userinfo[1];
	}
	var search_face_token = result["faces"][0]["face_token"];
	var img_file = renameReqFilename(oldReq, search_face_token);
	var analyzeResult = {};	
	var returnRes = function(){
		var sendData = {
			workNum : workNum,
			userName : userName,
			gender1 : analyzeResult["gender"],
			age1 : analyzeResult["age"],
			beauty1 : analyzeResult["beauty"],
			imgFile1 : "/faces/" + search_face_token + ".jpeg",
			imgFile2 : "/faces/" + face_token + ".jpeg",
			confidence : confidence
		}
		oldRes.send(sendData);
	}
	var analyze = function(callback){
		var analyzeData = {
			"face_tokens" : search_face_token,
			"return_attributes" : "gender,age,glass,emotion,facequality,beauty"
		};
		callFaceApi("/face/analyze", analyzeData, function(resJson){
			if(callback){
				analyzeResult = callback(resJson); 
				returnRes();
			}
		});
	}
	analyze(analyzeCallback);
}
router.post('/register', function(req, res){
	uploadfile(req, res, function (err) {
		//添加错误处理
		if (err) {
			return  console.log(err);
		}
		var file = req.files[0];
		var filename = file.filename;
		if(callFaceMode){
			var detectData = {
				"image_file" : fs.createReadStream("./" + apiConst.facePath +"/"+ filename),
				"return_attributes" : "gender,age,glass,emotion,facequality,beauty"
			};
			callFaceApi("/detect", detectData, detectCallback, req, res);
		}else{
			var workNum = req.body.workNum;
			var userName = req.body.name;
			//saveUserface(workNum, userName, "DUMMY_FACE_TOKEN", filename);
			res.send({
				workNum : workNum,
				userName : userName,
				imgFile : "/faces" + "/" + filename
			});
		}
	});
});
router.post('/search', function(req, res){
	uploadfile(req, res, function (err) {
		//添加错误处理
		if (err) {
			return  console.log(err);
		}
		var file = req.files[0];
		var filename = file.filename;
		if(callFaceMode){
			var searchData = {
				"image_file" : fs.createReadStream("./" + apiConst.facePath +"/"+ filename),
				"outer_id" : apiConst.faceOuterId
			};
			callFaceApi("/search", searchData, searchCallback, req, res);
		}else{
			res.send({
				imgFile : "/faces" + "/" + filename
			});
		}
	});
});
router.post('/compare', function(req, res){
	uploadfile(req, res, function (err) {
		//添加错误处理
		if (err) {
			return  console.log(err);
		}
		var imagefile1 = req.files[0];
		var imagefile2 = req.files[1];
		var filename1 = imagefile1.filename;
		var filename2 = imagefile2.filename;
		var compareData = {
			"image_file1" : fs.createReadStream("./" + apiConst.facePath +"/"+ filename1),
			"image_file2" : fs.createReadStream("./" + apiConst.facePath +"/"+ filename2)
		};
		callFaceApi("/compare", compareData, function(result){
			res.send( {
				confidence : result["confidence"]
			});
		});
	});
});

module.exports = router;
