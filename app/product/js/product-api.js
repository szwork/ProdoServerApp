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
    
    if(req.user.orgid==orgid)
    {
      product.addProduct(orgid,sessionuserid);
    }else{
       product.emit("failedProductAdd",{"error":{"code":"EA001","message":"You have not authorize to done this action"}})
    }
}
exports.commentToProduct=function(req,res){
  var prodle=req.params.prodle;
  var commentdata=req.body.product_comment;
  var userdata=commentdata.user;
  var sessionuserid=req.user.userid;
var product = new Product();
  product.on("failedCommentToProduct",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      res.send(err);
    });
    product.on("successfulCommentToProduct",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      res.send(result);
    });
    
   
    if(userdata.userid==req.user.userid){
      product.commentToProduct(prodle,commentdata);
    }else{
      product.emit("failedCommentToProduct",{"error":{"code":"EA001","message":"Provided user data does not match with sesion user data"}})
    }
   
}
exports.getProduct=function(req,res){
   var sessionuserid=req.user.userid;
   var prodle=req.params.prodle;
   var product = new Product();
   product.on("failedGetProduct",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      res.send(err);
    });
    product.on("successfulGetProduct",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      res.send(result);
    });
    
   
    
      product.getProduct(prodle);
    
}
exports.getAllProduct=function(req,res){
   var sessionuserid=req.user.userid;
   
   var product = new Product();
   product.on("failedGetAllProduct",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      res.send(err);
    });
    product.on("successfulGetAllProduct",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      res.send(result);
    });
    product.getAllProduct();
    
}
exports.addCommentBySocket=function(prodle,commentdata,callback){
  
  
  var userdata=commentdata.user;
  
  var product = new Product();
  product.on("failedCommentToProduct",function(err){
      logger.emit("error", err.error.message);
      callback(err);
    });
    product.on("successfulCommentToProduct",function(result){
      logger.emit("info", result.success.message);
       callback(null,result);
    });
    
   
      product.commentToProduct(prodle,commentdata);
  

}
