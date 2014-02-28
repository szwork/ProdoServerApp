//importing system
var mongodb = require("mongodb");
var events = require('events');
var eventEmitter = new events.EventEmitter();
var logger=require("../../common/js/logger");
var Warranty=require("./warranty");

exports.addUserWarranty=function(req,res){
	console.log("Call addUserWarranty");
    var sessionuserid=req.user.userid;
  	var warrantydata=req.body.warrantydata;
    // logger.emit("log","req warranty body "+JSON.stringify(req.body));
  	var warranty = new Warranty(warrantydata);
  	
    logger.emit("log","sessionid : "+sessionuserid);
    warranty.removeAllListeners("failedAddUserWarranty");
    warranty.on("failedAddUserWarranty",function(err){
    	logger.emit("error", err.error.message,sessionuserid);
      	// warranty.removeAllListeners();
      	res.send(err);
    });
    warranty.removeAllListeners("successfulAddUserWarranty");
    warranty.on("successfulAddUserWarranty",function(result){
      	logger.emit("info", result.success.message,sessionuserid);
      	// warranty.removeAllListeners();
      	res.send(result);
    });   
    warranty.addUserWarranty(sessionuserid);   
}

exports.updateUserWarranty = function(req, res) {
  var userid=req.params.userid;
  var warrantydata=req.body.warrantydata;
  var prodle = req.params.prodle;
  var warranty = new Warranty(warrantydata);
  var sessionuserid=req.user.userid;

  warranty.removeAllListeners("failedUpdateWarranty");
    warranty.on("failedUpdateWarranty",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // warranty.removeAllListeners();
      res.send(err);
    });
  warranty.removeAllListeners("successfulWarrantyUpdation");
  warranty.on("successfulWarrantyUpdation",function(result){
    logger.emit("info", result.success.message,sessionuserid);
    // warranty.removeAllListeners();
    res.send(result);
  });
    if(sessionuserid==userid){
      warranty.updateUserWarranty(userid,prodle);
    }else{
     warranty.emit("failedUpdateWarranty",{"error":{"code":"EA001","message":"You have not authorize to done this action"}})
    }
}