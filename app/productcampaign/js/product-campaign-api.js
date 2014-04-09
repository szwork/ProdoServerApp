//importing system
var mongodb = require("mongodb");
// var S=require('string');
// var BSON = mongodb.BSONPure;
var events = require('events');
var eventEmitter = new events.EventEmitter();
var logger=require("../../common/js/logger");
var ProductCampaign = require("./product-campaign");


exports.addProductCampaign=function(req,res){
    console.log("addProductCampain");
	var orgid = req.params.orgid;
  	var campaigndata=req.body.campaigndata;
  	var productcampaign = new ProductCampaign(campaigndata);
  
  	var sessionuserid=req.user.userid;
    logger.emit("log","\norgid: "+orgid+"\nsessionid: "+sessionuserid);
    productcampaign.removeAllListeners("failedAddProductCampaign");
    productcampaign.on("failedAddProductCampaign",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // productcampaign.removeAllListeners();
      res.send(err);
    });
    productcampaign.removeAllListeners("successfulAddProductCampaign");
    productcampaign.on("successfulAddProductCampaign",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // productcampaign.removeAllListeners();
      res.send(result);
    });
    productcampaign.addProductCampaign(orgid,sessionuserid);   
}

exports.updateProductCampaign=function(req,res){
    console.log("updateProductCampain");
    var orgid = req.params.orgid;
    var campaign_id=req.params.campaign_id;
    var campaigndata=req.body.campaigndata;
    var productcampaign = new ProductCampaign(campaigndata);
  
    var sessionuserid=req.user.userid;
    logger.emit("log","\norgid: "+orgid+"\nsessionid: "+sessionuserid);
    productcampaign.removeAllListeners("failedUpdateProductCampaign");
    productcampaign.on("failedUpdateProductCampaign",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // productcampaign.removeAllListeners();
      res.send(err);
    });
    productcampaign.removeAllListeners("successfulUpdateProductCampaign");
    productcampaign.on("successfulUpdateProductCampaign",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // productcampaign.removeAllListeners();
      res.send(result);
    });
    productcampaign.updateProductCampaign(orgid,campaign_id,sessionuserid);   
}

exports.getProductCampaign=function(req,res){
    logger.emit("log","///////Calling to Get Products Campain///////");
    var sessionuserid=req.user.userid;
    var orgid=req.params.orgid;
    var campaign_id=req.params.campaign_id;
    logger.emit("log","orgid:"+orgid+"\ncampain_id:"+campaign_id+"\nsessionid:"+sessionuserid);
    var productcampaign = new ProductCampaign();
    
    productcampaign.removeAllListeners("failedGetProductCampaign");
    productcampaign.on("failedGetProductCampaign",function(err){
        logger.emit("log","error:"+err.error.message+":"+sessionuserid);
        logger.emit("error", err.error.message,sessionuserid);
        // productcampaign.removeAllListeners();
        res.send(err);
        // eventEmitter.removeListener(this);
    });
    productcampaign.removeAllListeners("successfulGetProductCampaign");
    productcampaign.on("successfulGetProductCampaign",function(result){
        logger.emit("log","Getting Product Campaign details successfully");
        logger.emit("info", result.success.message,sessionuserid);
        // productcampaign.removeAllListeners();
        res.send(result);
        // eventEmitter.removeListener(this);
    }); 
    productcampaign.getProductCampaign(orgid,campaign_id);
}

exports.getAllProductCampaign=function(req,res){
    logger.emit("log","///////Calling to Get All Products Campain///////");
    var sessionuserid=req.user.userid;
    var orgid=req.params.orgid;
    logger.emit("log","orgid:"+orgid+"\nsessionid:"+sessionuserid);
    var productcampaign = new ProductCampaign();
    
    productcampaign.removeAllListeners("failedGetAllProductCampaign");
    productcampaign.on("failedGetAllProductCampaign",function(err){
        logger.emit("log","error:"+err.error.message+":"+sessionuserid);
        logger.emit("error", err.error.message,sessionuserid);
        // productcampaign.removeAllListeners();
        res.send(err);
        // eventEmitter.removeListener(this);
    });
    productcampaign.removeAllListeners("successfulGetAllProductCampaign");
    productcampaign.on("successfulGetAllProductCampaign",function(result){
        logger.emit("log","Getting All Product Campain details successfully");
        logger.emit("info", result.success.message,sessionuserid);
        // productcampaign.removeAllListeners();
        res.send(result);
        // eventEmitter.removeListener(this);
    }); 
    productcampaign.getAllProductCampaign(orgid);
}