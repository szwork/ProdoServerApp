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
    var sessionorgid=req.user.org.orgid;
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
    logger.emit("log","hi"+orgid +":"+req.user.org.orgid);
    if(req.user.usertype!="manufacturer"){
      product.emit("failedProductAdd",{"error":{"code":"EA001","message":"You are not manufacturer to add product"}})
    }else if(sessionorgid!=orgid){ 
      logger.emit("error","You are not an product user to add product",sessionuserid)
      product.emit("failedProductAdd",{"error":{"code":"EA001","message":"You have not authorize to add product"}})
    }else if(req.user.org.isAdmin!=true){
      logger.emit("error","You are not an admin to add product",sessionuserid)
      product.emit("failedProductAdd",{"error":{"code":"EA001","message":"You have not authorize to add product"}})
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
  //  if(req.user.org.orgid!=orgid){
  //   logger.emit("log","Given orgid is not match with session userid");
  //   product.emit("failedDeleteProduct",{"error":{"code":"EA001","message":"You have not authorized to delete product"}});
  // }else if(req.user.org.isAdmin==false){
  //   logger.emit("log","You are not an admin to delete product");
  //   product.emit("failedDeleteProduct",{"error":{"code":"EA001","message":"You have not authorized to delete product"}}); 
  // }else{
    /////////////////////////////////
    product.deleteProduct(orgid,prodle);
    //////////////////////////////// 
  // }
}
exports.deleteProductImage=function(req,res){
  logger.emit("log","///////Calling to delete Products///////");
  var sessionuserid=req.user.userid;
  var prodle=req.params.prodle;
  var prodleimageids=req.query.prodleimageids;
  var orgid=req.params.orgid;
  logger.emit("log","prodle"+prodle+"\nsessionuserid"+sessionuserid+" prodleimageid:"+prodleimageids+"orgid:"+orgid+"prodleimageids:"+JSON.stringify(prodleimageids));
  
  var product= new Product();
     // product.setMaxListeners(0); 
  product.removeAllListeners("failedDeleteProductImage");
  product.on("failedDeleteProductImage",function(err){
    logger.emit("log","error:"+err.error.message+":"+sessionuserid);
    logger.emit("error", err.error.message,sessionuserid);
    // product.removeAllListeners();
    res.send(err);
     // eventEmitter.removeListener(this);
  });
  product.removeAllListeners("successfulDeleteProductImage");
  product.on("successfulDeleteProductImage",function(result){
    //logger.emit("log","Getting Product details successfully");
    logger.emit("info", result.success.message,sessionuserid);
    // product.removeAllListeners();

    res.send(result);
    // eventEmitter.removeListener(this);
  });
   if(req.user.org.orgid!=orgid){
    logger.emit("error","given orgid does not match with session orgid");
    product.emit("failedDeleteProductImage",{"error":{"code":"EA001","message":"You have not authorized to delete product image"}}); 
   }else if(req.user.org.isAdmin==false){
    logger.emit("log","You are not an admin to delete product image");
    product.emit("failedDeleteProductImage",{"error":{"code":"EA001","message":"You have not authorized to delete product image"}}); 
  }else{
    ////////////////////////////////////////////////////////////
    product.deleteProductImage(prodleimageids,prodle,req.user.org.orgid);
    //////////////////////////////////////////////// ///////////
  }
}

exports.updateProduct = function(req, res) {
  var orgid=req.params.orgid;
  var productdata=req.body.product;
  var prodle=req.params.prodle;
  var product = new Product(productdata);
  var sessionuserid=req.user.userid;
  product.removeAllListeners("failedUpdateProduct");
    product.on("failedUpdateProduct",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // product.removeAllListeners();
      res.send(err);
    });
  product.removeAllListeners("successfulProductUpdation");
  product.on("successfulProductUpdation",function(result){
    logger.emit("info", result.success.message,sessionuserid);
    // product.removeAllListeners();
    res.send(result);
  });
    
   if(req.user.org.orgid!=orgid){
    logger.emit("log","Given orgid is not match with session userid");
    product.emit("failedUpdateProduct",{"error":{"code":"EA001","message":"You have not authorized to update product"}});
  }else if(req.user.org.isAdmin==false){
    logger.emit("log","You are not an admin to update product");
    product.emit("failedUpdateProduct",{"error":{"code":"EA001","message":"You have not authorized to update product"}}); 
  }else{
    ///////////////////////////////////
    product.updateProduct(orgid,prodle);
    ////////////////////////////////// 
  }
    
}
exports.addProductFeatures=function(req,res){
  var productfeaturedata=req.body.productfeature;
  var orgid=req.params.orgid;
  // var productdata=req.body.product;
  var prodle=req.params.prodle;
  var product = new Product();
  var sessionuserid=req.user.userid;
  product.removeAllListeners("failedAddProudctFeatures");
    product.on("failedAddProudctFeatures",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // product.removeAllListeners();
      res.send(err);
    });
  product.removeAllListeners("successfulAddProductFeatures");
  product.on("successfulAddProductFeatures",function(result){
    logger.emit("info", result.success.message,sessionuserid);
    // product.removeAllListeners();
    res.send(result);
  });
    
   if(req.user.org.orgid!=orgid){
    logger.emit("log","Given orgid is not match with session userid");
    product.emit("failedAddProudctFeatures",{"error":{"code":"EA001","message":"You have not authorized to add product feature"}});
  }else if(req.user.org.isAdmin==false){
    logger.emit("log","You are not an admin to update product");
    product.emit("failedAddProudctFeatures",{"error":{"code":"EA001","message":"You have not authorized to add product feature"}}); 
  }else{
    ///////////////////////////////////
    product.addProductFeature(orgid,prodle,productfeaturedata);
    ////////////////////////////////// 
  }
}
exports.updateProductFeature=function(req,res){
  var productfeaturedata=req.body.productfeature;
  var productfeatureid=req.params.productfeatureid;
  var orgid=req.params.orgid;
  // var productdata=req.body.product;
  var prodle=req.params.prodle;
  var product = new Product();
  var sessionuserid=req.user.userid;
  product.removeAllListeners("failedUpdateProudctFeatures");
    product.on("failedUpdateProudctFeatures",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // product.removeAllListeners();
      res.send(err);
    });
  product.removeAllListeners("successfulUpdateProductFeatures");
  product.on("successfulUpdateProductFeatures",function(result){
    logger.emit("info", result.success.message,sessionuserid);
    // product.removeAllListeners();
    res.send(result);
  });
    
   if(req.user.org.orgid!=orgid){
    logger.emit("log","Given orgid is not match with session userid");
    product.emit("failedUpdateProudctFeatures",{"error":{"code":"EA001","message":"You have not authorized to update product feature"}});
  }else if(req.user.org.isAdmin==false){
    logger.emit("log","You are not an admin to update product");
    product.emit("failedUpdateProudctFeatures",{"error":{"code":"EA001","message":"You have not authorized to update product feature"}}); 
  }else{
    ///////////////////////////////////
    product.updateProductFeature(orgid,prodle,productfeatureid,productfeaturedata);
    ////////////////////////////////// 
  }
}
exports.deleteProductFeature=function(req,res){
  
  var productfeatureid=req.params.productfeatureid;
  var orgid=req.params.orgid;
  // var productdata=req.body.product;
  var prodle=req.params.prodle;
  var product = new Product();
  var sessionuserid=req.user.userid;
  product.removeAllListeners("failedDeleteProudctFeatures");
    product.on("failedDeleteProudctFeatures",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // product.removeAllListeners();
      res.send(err);
    });
  product.removeAllListeners("_successfulDeleteProductFeatures");
  product.on("_successfulDeleteProductFeatures",function(result){
    logger.emit("info", result.success.message,sessionuserid);
    // product.removeAllListeners();
    res.send(result);
  });
    
   if(req.user.org.orgid!=orgid){
    logger.emit("log","Given orgid is not match with session userid");
    product.emit("failedDeleteProudctFeatures",{"error":{"code":"EA001","message":"You have not authorized to update product feature"}});
  }else if(req.user.org.isAdmin==false){
    logger.emit("log","You are not an admin to update product");
    product.emit("failedDeleteProudctFeatures",{"error":{"code":"EA001","message":"You have not authorized to update product feature"}}); 
  }else{
    ///////////////////////////////////
    product.deleteProductFeature(orgid,prodle,productfeatureid);
    ////////////////////////////////// 
  }
}
exports.getProductFeature=function(req,res){

  var orgid=req.params.orgid;
  // var productdata=req.body.product;
  var prodle=req.params.prodle;
  var product = new Product();
  var sessionuserid=req.user.userid;
  product.removeAllListeners("failedGetProudctFeatures");
    product.on("failedGetProudctFeatures",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // product.removeAllListeners();
      res.send(err);
    });
  product.removeAllListeners("successfulGetProductFeatures");
  product.on("successfulGetProductFeatures",function(result){
    logger.emit("info", result.success.message,sessionuserid);
    // product.removeAllListeners();
    res.send(result);
  });
    ///////////////////////////////////
    product.getProductFeature(orgid,prodle);
    ////////////////////////////////// 
  
}

exports.getProductTrending=function(req,res){
  console.log("=================");
  console.log("TrendingProducts");
  console.log("=================");
  // var prodle=req.params.prodle;
  // console.log("Prodle " + prodle);
  
  var product = new Product();
  var sessionuserid=req.user.userid;
  product.removeAllListeners("failedGetProudctTrends");
    product.on("failedGetProudctTrends",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // product.removeAllListeners();
      res.send(err);
    });
  product.removeAllListeners("successfulGetProductTrends");
  product.on("successfulGetProductTrends",function(result){
    logger.emit("info", result.success.message,sessionuserid);
    // product.removeAllListeners();
    res.send(result);
  });
    ///////////////////////////////////
    product.getProductTrending();
    //////////////////////////////////  
}
exports.getAllCategoryTags=function(req,res){
  var product = new Product();
  var sessionuserid=req.user.userid;
  product.removeAllListeners("failedGetAllCategoryTags");
    product.on("failedGetAllCategoryTags",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // product.removeAllListeners();
      res.send(err);
    });
  product.removeAllListeners("successfulGetAllCategoryTags");
  product.on("successfulGetAllCategoryTags",function(result){
    logger.emit("info", result.success.message,sessionuserid);
    // product.removeAllListeners();
    res.send(result);
  });
    ///////////////////////////////////
    product.getAllCategoryTags();
    ////////////////////////////////  
}