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
    logger.emit("log","req product body"+JSON.stringify(req.body));
  	var product = new Product(productdata);
  	var sessionuserid=req.user.userid;
    product.once("failedProductAdd",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // product.removeAllListeners();
      res.send(err);
    });

    product.once("successfulProductAdd",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // product.removeAllListeners();
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
// exports.commentToProduct=function(req,res){
//   logger.emit("log","/////////calling to commentToProduct/////////");
//   var prodle=req.params.prodle;
//   var commentdata=req.body.product_comment;
//   logger.emit("log","commentdata"+JSON.stringify(commentdata))
//   //var userdata=commentdata.user;
//   var sessionuserid=req.user.userid;
//   var product = new Product();
//   product.once("failedCommentToProduct",function(err){
//     logger.emit("error", err.error.message,sessionuserid);
//     logger.emit("log","error:"+err.error.message+":"+sessionuserid);
//     logger.emit("log","//////End of commentToProduct//////");
//     product.removeAllListeners();
//     res.send(err);
//   });
//     product.once("successfulCommentToProduct",function(result){
//       logger.emit("log","success:"+result.success.message+":"+sessionuserid);
//       logger.emit("info", result.success.message,sessionuserid);
//       product.removeAllListeners();
//       res.send(result);
//     });
//     product.commentToProduct(sessionuserid,prodle,commentdata);
    
   
// }
exports.getProduct=function(req,res){
  logger.emit("log","///////Calling to Get Products///////");
  var sessionuserid=req.user.userid;
  var prodle=req.params.prodle;
   var product= new Product();
     // product.setMaxListeners(0); 

  product.once("failedGetProduct",function(err){
    logger.emit("log","error:"+err.error.message+":"+sessionuserid);
    logger.emit("error", err.error.message,sessionuserid);
    // product.removeAllListeners();
    res.send(err);
     // eventEmitter.removeListener(this);
  });
  product.once("successfulGetProduct",function(result){
    logger.emit("log","Getting Product details successfully");
    logger.emit("info", result.success.message,sessionuserid);
    // product.removeAllListeners();

    res.send(result);
    // eventEmitter.removeListener(this);
  });
 
  product.getProduct(prodle);
}
exports.getAllProduct=function(req,res){
    // req.setMaxListeners(0); 

   var sessionuserid=req.user.userid;
   
   var product = new Product();
   // product.setMaxListeners(0); 
   product.once("failedGetAllProduct",function(err){
      logger.emit("log","error:"+err.error.message+":"+sessionuserid);
      logger.emit("error", err.error.message,sessionuserid);
      // product.removeAllListeners();
      res.send(err);

    });
    product.once("successfulGetAllProduct",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // product.removeAllListeners();
     // res.header('Cache-Control', 'no-cache');
      res.send(result);
       // product.removeListener(this,function(stream){
       //  logger.log("listner "+this+"removed");
       // });
    });
    product.getAllProduct();
    
}
exports.addCommentBySocket=function(sessionuserid,prodle,commentdata,callback){
   // var userdata=commentdata.user;
  logger.emit("log","req boyd comment"+JSON.stringify(req.body));
 
  var product = new Product();
  product.once("failedCommentToProduct",function(err){
    logger.emit("error", err.error.message);
    callback(err);
  });
    product.once("successfulCommentToProduct",function(result){
      logger.emit("info", result.success.message);
      
      callback(null,result);
      
    });
  product.commentToProduct(sessionuserid,prodle,commentdata);
}

