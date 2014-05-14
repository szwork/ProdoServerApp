//importing system
var mongodb = require("mongodb");
var S=require('string');
var BSON = mongodb.BSONPure;
var events = require('events');
var eventEmitter = new events.EventEmitter();
var logger=require("../../common/js/logger");
var ProductCharts = require("./product-charts");

exports.getDashboardIcons = function(req,res){
  logger.emit("log","///////Calling to Get Dashboard Icons///////");
  var sessionuserid=req.user.userid;
  var prodle=req.params.prodle;
  // var orgid=req.params.orgid;
  logger.emit("log","prodle"+prodle+"\nsessionid:"+sessionuserid);
   var productcharts= new ProductCharts();
     // product.setMaxListeners(0); 
  productcharts.removeAllListeners("failedGetProductCharts");
  productcharts.on("failedGetProductCharts",function(err){
    logger.emit("log","error:"+err.error.message+":"+sessionuserid);
    logger.emit("error", err.error.message,sessionuserid);
    // productcharts.removeAllListeners();
    res.send(err);
     // eventEmitter.removeListener(this);
  });
  productcharts.removeAllListeners("successfulGetProductCharts");
  productcharts.on("successfulGetProductCharts",function(result){
    logger.emit("log","Getting Product Charts Successfully");
    // logger.emit("info", result.success.message,sessionuserid);
    // productcharts.removeAllListeners();

    res.send(result);
    // eventEmitter.removeListener(this);
  });
 
  productcharts.getDashboardIcons(prodle);
}