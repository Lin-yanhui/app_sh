var mongoose = require('mongoose');
var mongoomise=require("mongoomise")
var db=require("../util/db.js");
var model=new mongoose.Schema({
    name:String,
    work_num:Number
});

var dbManage=db.model("users",model);
mongoomise.promisifyAll(dbManage,require("bluebird"));
module.exports=dbManage;