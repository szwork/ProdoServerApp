var ProductFeatureRating=require("./product-feature-rating");
var logger = require("../../common/js/logger");
exports.rateProductFeature=function(req,res){
	var prodle=req.params.prodle;
    var featureratedata=req.body.featureratedata;
    logger.emit("log","req product feature"+JSON.stringify(req.body));
  	var productfeaturerating = new ProductFeatureRating();

  
  	var sessionuserid=req.user.userid;
     // logger.emit("log","\norgid:"+orgid+"\nsessionid:"+sessionuserid);
    productfeaturerating.removeAllListeners("failedRateProductFeature");
    productfeaturerating.on("failedRateProductFeature",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // product.removeAllListeners();
      res.send(err);
    });
    productfeaturerating.removeAllListeners("successfulRateProductFeature");
    productfeaturerating.on("successfulRateProductFeature",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // product.removeAllListeners();
      res.send(result);
    });
    productfeaturerating.rateProductFeature(prodle,featureratedata,req.user.userid);
}
exports.getMyProductFeatureRating=function(req,res){
    var prodle=req.params.prodle;
    // var featureratedata=req.body.featureratedata;
    // logger.emit("log","req product feature"+JSON.stringify(req.body));
    var productfeaturerating = new ProductFeatureRating();

  
    var sessionuserid=req.user.userid;
     // logger.emit("log","\norgid:"+orgid+"\nsessionid:"+sessionuserid);
    productfeaturerating.removeAllListeners("failedGetMyProductFeatureRating");
    productfeaturerating.on("failedGetMyProductFeatureRating",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // product.removeAllListeners();
      res.send(err);
    });
    productfeaturerating.removeAllListeners("successfulGetMyProductFeatureRating");
    productfeaturerating.on("successfulGetMyProductFeatureRating",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // product.removeAllListeners();
      res.send(result);
    });
    productfeaturerating.getMyProductFeatureRating(prodle,req.user.userid);
}

exports.getOverallProductFeatureRating=function(req,res){
    var prodle=req.params.prodle;
    // var featureratedata=req.body.featureratedata;
    // logger.emit("log","req product feature"+JSON.stringify(req.body));
    var productfeaturerating = new ProductFeatureRating();

  
    var sessionuserid=req.user.userid;
     // logger.emit("log","\norgid:"+orgid+"\nsessionid:"+sessionuserid);
    productfeaturerating.removeAllListeners("failedGetOverallProductFeatureRating");
    productfeaturerating.on("failedGetOverallProductFeatureRating",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // product.removeAllListeners();
      res.send(err);
    });
    productfeaturerating.removeAllListeners("successfulGetOverallProductFeatureRating");
    productfeaturerating.on("successfulGetOverallProductFeatureRating",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // product.removeAllListeners();
      res.send(result);
    });
    productfeaturerating.getOverallProductFeatureRating(prodle);
}