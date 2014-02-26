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
    logger.emit("log","req warranty body "+JSON.stringify(req.body));
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