//importing system
var mongodb = require("mongodb");
// var S=require('string');
// var BSON = mongodb.BSONPure;
var events = require('events');
var eventEmitter = new events.EventEmitter();
var logger=require("../../common/js/logger");
var ProductCampain = require("./product-campaign");


exports.addProductCampain=function(req,res){
    console.log("addProductCampain");
	var orgid = req.params.orgid;
  	var campaindata=req.body.campaindata;
  	var productcampain = new ProductCampain(campaindata);
  
  	var sessionuserid=req.user.userid;
    logger.emit("log","\norgid: "+orgid+"\nsessionid: "+sessionuserid);
    productcampain.removeAllListeners("failedAddProductCampain");
    productcampain.on("failedAddProductCampain",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // productcampain.removeAllListeners();
      res.send(err);
    });
    productcampain.removeAllListeners("successfulAddProductCampain");
    productcampain.on("successfulAddProductCampain",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // productcampain.removeAllListeners();
      res.send(result);
    });
    productcampain.addProductCampain(orgid,sessionuserid);   
}

exports.getProductCampain=function(req,res){
    logger.emit("log","///////Calling to Get Products Campain///////");
    var sessionuserid=req.user.userid;
    var orgid=req.params.orgid;
    var campain_id=req.params.campain_id;
    logger.emit("log","orgid:"+orgid+"\ncampain_id:"+campain_id+"\nsessionid:"+sessionuserid);
    var productcampain = new ProductCampain();
    
    productcampain.removeAllListeners("failedGetProductCampain");
    productcampain.on("failedGetProductCampain",function(err){
        logger.emit("log","error:"+err.error.message+":"+sessionuserid);
        logger.emit("error", err.error.message,sessionuserid);
        // productcampain.removeAllListeners();
        res.send(err);
        // eventEmitter.removeListener(this);
    });
    productcampain.removeAllListeners("successfulGetProductCampain");
    productcampain.on("successfulGetProductCampain",function(result){
        logger.emit("log","Getting Product Campain details successfully");
        logger.emit("info", result.success.message,sessionuserid);
        // productcampain.removeAllListeners();
        res.send(result);
        // eventEmitter.removeListener(this);
    }); 
    productcampain.getProductCampain(orgid,campain_id);
}

exports.getAllProductCampain=function(req,res){
    logger.emit("log","///////Calling to Get All Products Campain///////");
    var sessionuserid=req.user.userid;
    var orgid=req.params.orgid;
    logger.emit("log","orgid:"+orgid+"\nsessionid:"+sessionuserid);
    var productcampain = new ProductCampain();
    
    productcampain.removeAllListeners("failedGetAllProductCampain");
    productcampain.on("failedGetAllProductCampain",function(err){
        logger.emit("log","error:"+err.error.message+":"+sessionuserid);
        logger.emit("error", err.error.message,sessionuserid);
        // productcampain.removeAllListeners();
        res.send(err);
        // eventEmitter.removeListener(this);
    });
    productcampain.removeAllListeners("successfulGetAllProductCampain");
    productcampain.on("successfulGetAllProductCampain",function(result){
        logger.emit("log","Getting All Product Campain details successfully");
        logger.emit("info", result.success.message,sessionuserid);
        // productcampain.removeAllListeners();
        res.send(result);
        // eventEmitter.removeListener(this);
    }); 
    productcampain.getAllProductCampain(orgid);
}