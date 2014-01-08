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
     logger.emit("log","\norgid:"+orgid+"\nsessionid:"+sessionuserid);
    product.removeAllListeners("failedProductAdd");
    product.on("failedProductAdd",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // product.removeAllListeners();
      res.send(err);
    });
    product.removeAllListeners("successfulProductAdd");
    product.on("successfulProductAdd",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // product.removeAllListeners();
      res.send(result);
    });
    
   
    logger.emit("log",productdata);
    
    if(req.user.orgid!=orgid)
    { 
      logger.emit("error","You are not an organization user to add product",sessionuserid)
      product.emit("failedProductAdd",{"error":{"code":"EA001","message":"You have not authorize to done this action"}})
    }else if(req.user.isAdmin!=true){
      logger.emit("error","You are not an admin to add product",sessionuserid)
      product.emit("failedProductAdd",{"error":{"code":"EA001","message":"You have not authorize to done this action"}})
    }else{
      product.addProduct(orgid,sessionuserid);
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
//   product.on("failedCommentToProduct",function(err){
//     logger.emit("error", err.error.message,sessionuserid);
//     logger.emit("log","error:"+err.error.message+":"+sessionuserid);
//     logger.emit("log","//////End of commentToProduct//////");
//     product.removeAllListeners();
//     res.send(err);
//   });
//     product.on("successfulCommentToProduct",function(result){
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
  var orgid=req.params.orgid;
  logger.emit("log","prodle"+prodle+"\norgid:"+orgid+"\nsessionid:"+sessionuserid);
   var product= new Product();
     // product.setMaxListeners(0); 
  product.removeAllListeners("failedGetProduct");
  product.on("failedGetProduct",function(err){
    logger.emit("log","error:"+err.error.message+":"+sessionuserid);
    logger.emit("error", err.error.message,sessionuserid);
    // product.removeAllListeners();
    res.send(err);
     // eventEmitter.removeListener(this);
  });
  product.removeAllListeners("successfulGetProduct");
  product.on("successfulGetProduct",function(result){
    logger.emit("log","Getting Product details successfully");
    logger.emit("info", result.success.message,sessionuserid);
    // product.removeAllListeners();

    res.send(result);
    // eventEmitter.removeListener(this);
  });
 
  product.getProduct(orgid,prodle);
}
exports.getAllProduct=function(req,res){
    // req.setMaxListeners(0); 
   
   var sessionuserid=req.user.userid;
   var orgid=req.params.orgid;
   logger.emit("log","\norgid:"+orgid+"\nsessionid:"+sessionuserid);
  
   var product = new Product();
   // product.setMaxListeners(0);
   product.removeAllListeners("failedGetAllProduct"); 
   product.on("failedGetAllProduct",function(err){
      logger.emit("log","error:"+err.error.message+":"+sessionuserid);
      logger.emit("error", err.error.message,sessionuserid);
      // product.removeAllListeners();
      res.send(err);

    });
   product.removeAllListeners("successfulGetAllProduct");
    product.on("successfulGetAllProduct",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // product.removeAllListeners();
     // res.header('Cache-Control', 'no-cache');
      res.send(result);
       // product.removeListener(this,function(stream){
       //  logger.log("listner "+this+"removed");
       // });
    });
    product.getAllProduct(orgid);
    
}
exports.addCommentBySocket=function(sessionuserid,prodle,commentdata,callback){
   // var userdata=commentdata.user;
  logger.emit("log","req boyd comment"+JSON.stringify(req.body));
 
  var product = new Product();
  product.removeAllListeners("failedCommentToProduct");
  product.on("failedCommentToProduct",function(err){
    logger.emit("error", err.error.message);
    callback(err);
  });
  product.removeAllListeners("successfulCommentToProduct");
  product.on("successfulCommentToProduct",function(result){
    logger.emit("info", result.success.message);
    callback(null,result);
  });
  product.commentToProduct(sessionuserid,prodle,commentdata);
}
exports.deleteProduct=function(req,res){
  logger.emit("log","///////Calling to delete Products///////");
  var sessionuserid=req.user.userid;
  var prodle=req.params.prodle;
  var orgid=req.params.orgid;
  logger.emit("log","prodle"+prodle+"\norgid:"+orgid+"\nsessionid:"+sessionuserid);
  
  var product= new Product();
     // product.setMaxListeners(0); 
  product.removeAllListeners("failedDeleteProduct");
  product.on("failedDeleteProduct",function(err){
    logger.emit("log","error:"+err.error.message+":"+sessionuserid);
    logger.emit("error", err.error.message,sessionuserid);
    // product.removeAllListeners();
    res.send(err);
     // eventEmitter.removeListener(this);
  });
  product.removeAllListeners("successfulDeleteProduct");
  product.on("successfulDeleteProduct",function(result){
    //logger.emit("log","Getting Product details successfully");
    logger.emit("info", result.success.message,sessionuserid);
    // product.removeAllListeners();

    res.send(result);
    // eventEmitter.removeListener(this);
  });
   if(req.user.orgid!=orgid){
    logger.emit("log","Given orgid is not match with session userid");
    product.emit("failedDeleteProduct",{"error":{"code":"EA001","message":"You have not authorized to delete product"}});
  }else if(req.user.isAdmin==false){
    logger.emit("log","You are not an admin to delete product");
    product.emit("failedDeleteProduct",{"error":{"code":"EA001","message":"You have not authorized to delete product"}}); 
  }else{
    /////////////////////////////////
    product.deleteProduct(orgid,prodle);
    //////////////////////////////// 
  }
}

