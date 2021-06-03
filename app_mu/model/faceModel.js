var mongoose = require('mongoose');
var mongoomise=require("mongoomise")
var db=require("../util/db.js");
var model=new mongoose.Schema({
    face_token:String,
    work_num:Number,
	age:Number,
	gender:String,
	beauty:Number
});

var dbManage=db.model("faces",model);
mongoomise.promisifyAll(dbManage,require("bluebird"));
module.exports=dbManage;