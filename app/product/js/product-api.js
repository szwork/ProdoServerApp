var orgModel = require('../../org//js/org-model');
var orgHistoryModel = require('../../org/js/org-history-model'); 
var userModel = require('../../user/js/user-model');
var verificationTokenModel = require('../../common/js/verification-token-model');
var EmailTemplateModel=require('../../common/js/email-template-model');

var CONFIG = require('config').Prodonus;
//importing require userdefined api
var commonapi = require('../../common/js/common-api');
var userapi = require('../../user/js/user-api');

//importing system
var mongodb = require("mongodb");
var S=require('string');
var BSON = mongodb.BSONPure;
var events = require('events');

var eventEmitter = new events.EventEmitter();
var logger=require("../../common/js/logger");
var Product=require("./product");

exports.addProduct=function(req,res){
	var orgid=req.params.orgid;
  	var productdata=req.body.product;
  	var product = new Product(productdata);
  	var sessionuserid=req.user.userid;
    product.on("failedProductAdd",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      res.send(err);
    });

    product.on("successfulProductAdd",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      res.send(result);
    });
    
    var isAdmin=false;
    logger.emit("log",productdata);
    if(req.user.orgid==orgid || isAdmin)
    {
      product.addProduct(orgid,sessionuserid);
    }else{
       product.emit("failedProductAdd",{"error":{"code":"EA001","message":"You have not authorize to done this action"}})
    }
}