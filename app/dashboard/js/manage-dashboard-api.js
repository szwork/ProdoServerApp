//importing system
var mongodb = require("mongodb");
var S=require('string');
var BSON = mongodb.BSONPure;
var events = require('events');
var eventEmitter = new events.EventEmitter();
var logger=require("../../common/js/logger");
var ManageDashboard = require("./manage-dashboard");

exports.getDashboardIcons = function(req,res){
  logger.emit("log","///////Calling to Get Dashboard Icons///////");
  var sessionuserid=req.user.userid;
  // var prodle=req.params.prodle;
  // var orgid=req.params.orgid;
  // logger.emit("log","prodle"+prodle+"\nsessionid:"+sessionuserid);
   var managedashboard= new ManageDashboard();
     // product.setMaxListeners(0); 
  managedashboard.removeAllListeners("failedGetDashboardIcons");
  managedashboard.on("failedGetDashboardIcons",function(err){
    logger.emit("log","error:"+err.error.message+":"+sessionuserid);
    logger.emit("error", err.error.message,sessionuserid);
    // managedashboard.removeAllListeners();
    res.send(err);
     // eventEmitter.removeListener(this);
  });
  managedashboard.removeAllListeners("successfulGetDashboardIcons");
  managedashboard.on("successfulGetDashboardIcons",function(result){
    logger.emit("log","Getting Dashboard Icons Successfully");
    // logger.emit("info", result.success.message,sessionuserid);
    // managedashboard.removeAllListeners();

    res.send(result);
    // eventEmitter.removeListener(this);
  });
 
  managedashboard.getDashboardIcons();
}

exports.addQuery = function(req,res){    
    var querydata = req.body;
    logger.emit("log","req product body"+JSON.stringify(req.body));
    var managedashboard = new ManageDashboard(querydata);
  
    var sessionuserid=req.user.userid;
     logger.emit("log","sessionid:"+sessionuserid);
    managedashboard.removeAllListeners("failedAddDashboardQuery");
    managedashboard.on("failedAddDashboardQuery",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // managedashboard.removeAllListeners();
      res.send(err);
    });
    managedashboard.removeAllListeners("successfulAddDashboardQuery");
    managedashboard.on("successfulAddDashboardQuery",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // managedashboard.removeAllListeners();
      res.send(result);
    });   
   
    if(req.user.isAdmin!=true){
      logger.emit("error","You are not an admin to manage dashboard query",sessionuserid);
      managedashboard.emit("failedAddDashboardQuery",{"error":{"code":"EA001","message":"You have not authorize to manage dashboard"}});
    }else{
      managedashboard.addQuery(sessionuserid);
    }
}