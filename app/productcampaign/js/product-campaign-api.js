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
    var prodle = req.params.prodle;
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
    if(req.user.usertype.toLowerCase()!="manufacturer"){
      productcampaign.emit("failedAddProductCampaign",{"error":{"code":"EA001","message":"You are not manufacturer to add campaign"}})
    }else{
      productcampaign.addProductCampaign(orgid,prodle,sessionuserid);
    }
    
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
    if(req.user.usertype.toLowerCase()!="manufacturer"){
      productcampaign.emit("failedAddProductCampaign",{"error":{"code":"EA001","message":"You are not manufacturer to add campaign"}})
    }else{
      productcampaign.updateProductCampaign(orgid,campaign_id,sessionuserid);
    }
    
}

exports.getProductCampaign=function(req,res){
    logger.emit("log","///////Calling to Get Products Campain///////");
    var sessionuserid=req.user.userid;
    var prodle=req.params.prodle;
    var campaign_id=req.params.campaign_id;
    logger.emit("log","prodle:"+prodle+"\ncampain_id:"+campaign_id+"\nsessionid:"+sessionuserid);
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
    productcampaign.getProductCampaign(prodle,campaign_id);
}

exports.removeProductCampaign=function(req,res){
    console.log("removeProductCampain");
    // var orgid = req.params.orgid;
    var campaign_id=req.params.campaign_id;
    // var campaigndata=req.body.campaigndata;
    var productcampaign = new ProductCampaign();
  
    var sessionuserid=req.user.userid;
    // logger.emit("log","\norgid: "+orgid+"\nsessionid: "+sessionuserid);
    productcampaign.removeAllListeners("failedRemoveProductCampaign");
    productcampaign.on("failedRemoveProductCampaign",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // productcampaign.removeAllListeners();
      res.send(err);
    });
    productcampaign.removeAllListeners("successfulRemoveProductCampaign");
    productcampaign.on("successfulRemoveProductCampaign",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // productcampaign.removeAllListeners();
      res.send(result);
    });
    productcampaign.removeProductCampaign(campaign_id,sessionuserid);   
}

exports.getAllOrgCampaign=function(req,res){
    logger.emit("log","///////Calling to Get All Organization Campaign///////");
    var sessionuserid=req.user.userid;
    var orgid=req.params.orgid;
    logger.emit("log","orgid:"+orgid+"\nsessionid:"+sessionuserid);
    var productcampaign = new ProductCampaign();
    
    productcampaign.removeAllListeners("failedGetAllOrgCampaign");
    productcampaign.on("failedGetAllOrgCampaign",function(err){
        logger.emit("log","error:"+err.error.message+":"+sessionuserid);
        logger.emit("error", err.error.message,sessionuserid);
        // productcampaign.removeAllListeners();
        res.send(err);
        // eventEmitter.removeListener(this);
    });
    productcampaign.removeAllListeners("successfulGetAllOrgCampaign");
    productcampaign.on("successfulGetAllOrgCampaign",function(result){
        logger.emit("log","Getting All Organization Campaign Details successfully");
        logger.emit("info", result.success.message,sessionuserid);
        // productcampaign.removeAllListeners();
        res.send(result);
        // eventEmitter.removeListener(this);
    }); 
    productcampaign.getAllOrgCampaign(orgid);
}

exports.getAllProductCampaign=function(req,res){
    logger.emit("log","///////Calling to Get All Products Campaign///////");
    var sessionuserid=req.user.userid;
    var prodle=req.params.prodle;
    logger.emit("log","prodle:"+prodle+"\nsessionid:"+sessionuserid);
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
        logger.emit("log","Getting All Product Campaign Details Successfully");
        logger.emit("info", result.success.message,sessionuserid);
        // productcampaign.removeAllListeners();
        res.send(result);
        // eventEmitter.removeListener(this);
    }); 
    productcampaign.getAllProductCampaign(prodle);
}

exports.deleteCampaignImage=function(req,res){
 
  var sessionuserid=req.user.userid;
  
  var camimageids=req.query.camimageids;
  var campaign_id = req.params.campaign_id;
  var orgid=req.params.orgid;
  logger.emit("log","prodle\nsessionuserid"+sessionuserid+" prodleimageid:"+camimageids+"orgid:"+orgid+"prodleimageids:"+JSON.stringify(camimageids));
  
  var productcampaign= new ProductCampaign();
     // product.setMaxListeners(0); 
  productcampaign.removeAllListeners("failedDeleteCampaignImage");
  productcampaign.on("failedDeleteCampaignImage",function(err){
    // logger.emit("log","error:"+err.error.message+":"+sessionuserid);
    logger.emit("error", err.error.message,sessionuserid);
    // product.removeAllListeners();
    res.send(err);
     // eventEmitter.removeListener(this);
  });
  productcampaign.removeAllListeners("successfulDeleteCampaignImage");
  productcampaign.on("successfulDeleteCampaignImage",function(result){
    //logger.emit("log","Getting Product details successfully");
    // logger.emit("info", result.success.message,sessionuserid);
    // product.removeAllListeners();

    res.send(result);
    // eventEmitter.removeListener(this);
  });
   if(req.user.org.orgid!=orgid){
    logger.emit("error","given orgid does not match with session orgid");
    productcampaign.emit("failedDeleteCampaignImage",{"error":{"code":"EA001","message":"You are not authorized to delete campaign image"}}); 
   }else if(req.user.org.isAdmin==false){
    logger.emit("log","You are not an admin to delete product image");
    productcampaign.emit("failedDeleteCampaignImage",{"error":{"code":"EA001","message":"You are not authorized to delete campaign image"}}); 
  }else{
    ////////////////////////////////////////////////////////////
    productcampaign.deleteCampaignImage(camimageids,campaign_id);
    //////////////////////////////////////////////// ///////////
  }
}
exports.publishCampaign=function(req,res){
  var sessionuserid=req.user.userid;
  
  // var camimageids=req.query.camimageid;
  var campaign_id = req.params.campaign_id;
  var orgid=req.params.orgid;
  logger.emit("log","prodle\nsessionuserid"+sessionuserid+" orgid:"+orgid+"");
  
  var productcampaign= new ProductCampaign();
     // product.setMaxListeners(0); 
  productcampaign.removeAllListeners("failedPublishCampaign");
  productcampaign.on("failedPublishCampaign",function(err){
    // logger.emit("log","error:"+err.error.message+":"+sessionuserid);
    logger.emit("error", err.error.message,sessionuserid);
    // product.removeAllListeners();
    res.send(err);
     // eventEmitter.removeListener(this);
  });
  productcampaign.removeAllListeners("successfulpublishCampaign");
  productcampaign.on("successfulpublishCampaign",function(result){
    //logger.emit("log","Getting Product details successfully");
    // logger.emit("info", result.success.message,sessionuserid);
    // product.removeAllListeners();

    res.send(result);
    // eventEmitter.removeListener(this);
  });
   if(req.user.org.orgid!=orgid){
    logger.emit("error","given orgid does not match with session orgid");
    productcampaign.emit("failedPublishCampaign",{"error":{"code":"EA001","message":"You are not authorized to publish campaign "}}); 
   }else if(req.user.org.isAdmin==false){
    logger.emit("log","You are not an admin to publish campaign");
    productcampaign.emit("failedPublishCampaign",{"error":{"code":"EA001","message":"You are not authorized to publish campaign"}}); 
  }else{
    ////////////////////////////////////////////////////////////
    productcampaign.publishCampaign(orgid,campaign_id);
    //////////////////////////////////////////////// ///////////
  }
}