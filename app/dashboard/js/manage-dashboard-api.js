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
  var dashboard_access_code = req.user.dashboard_access_code;
  // logger.emit("log","prodle"+prodle+"\nsessionid:"+sessionuserid);
  var managedashboard= new ManageDashboard();
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
  if(dashboard_access_code==undefined || dashboard_access_code==null){
    logger.emit("error","You are not authorize to get dashboard icons",sessionuserid);
    managedashboard.emit("failedGetDashboardIcons",{"error":{"code":"EA001","message":"You have not authorize to get dashboard icons"}});
  }else{
    managedashboard.getDashboardIcons(dashboard_access_code);  
  }
}

exports.getDashboardChartsData = function(req,res){
  var sessionuserid=req.user.userid;
  // logger.emit("log","prodle"+prodle+"\nsessionid:"+sessionuserid);
  var managedashboard= new ManageDashboard();
  managedashboard.removeAllListeners("failedGetDashboardChartsData");
  managedashboard.on("failedGetDashboardChartsData",function(err){
    logger.emit("log","error:"+err.error.message+":"+sessionuserid);
    logger.emit("error", err.error.message,sessionuserid);
    // managedashboard.removeAllListeners();
    res.send(err);
     // eventEmitter.removeListener(this);
  });
  managedashboard.removeAllListeners("successfulGetDashboardChartsData");
  managedashboard.on("successfulGetDashboardChartsData",function(result){
    logger.emit("log","Getting Dashboard Chart Details Successfully");
    // logger.emit("info", result.success.message,sessionuserid);
    // managedashboard.removeAllListeners();
    res.send(result);
    // eventEmitter.removeListener(this);
  }); 
  managedashboard.getDashboardChartsData();
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
    if(req.user.isAdmin==false){
      logger.emit("error","You are not an admin to manage dashboard query",sessionuserid);
      managedashboard.emit("failedAddDashboardQuery",{"error":{"code":"EA001","message":"You have not authorize to manage dashboard"}});
    }else{
      managedashboard.addQuery(sessionuserid);
    }
}

exports.getAllDashboardQuery = function(req,res){
  logger.emit("log","///////Calling to Get Dashboard Query///////");
  var sessionuserid=req.user.userid;
  var managedashboard= new ManageDashboard();
  managedashboard.removeAllListeners("failedGetAllDashboardQuery");
  managedashboard.on("failedGetAllDashboardQuery",function(err){
    logger.emit("log","error:"+err.error.message+":"+sessionuserid);
    logger.emit("error", err.error.message,sessionuserid);
    // managedashboard.removeAllListeners();
    res.send(err);
     // eventEmitter.removeListener(this);
  });
  managedashboard.removeAllListeners("successfulGetAllDashboardQuery");
  managedashboard.on("successfulGetAllDashboardQuery",function(result){
    logger.emit("log","Getting All Dashboard Query Successfully");
    // logger.emit("info", result.success.message,sessionuserid);
    // managedashboard.removeAllListeners();
    res.send(result);
    // eventEmitter.removeListener(this);
  });
  if(req.user.isAdmin==false){
    logger.emit("error","You are not an admin to get dashboard query",sessionuserid);
    managedashboard.emit("failedAddDashboardQuery",{"error":{"code":"EA001","message":"You have not authorize to get dashboard query"}});
  }else{
    managedashboard.getAllDashboardQuery();
  }
}

exports.addRBONDS_Mapping = function(req,res){    
    var chartaccessdata = req.body;
    logger.emit("log","req product body"+JSON.stringify(req.body));
    var managedashboard = new ManageDashboard(chartaccessdata);
  
    var sessionuserid=req.user.userid;
     logger.emit("log","sessionid:"+sessionuserid);
    managedashboard.removeAllListeners("failedAddRBONDS_Mapping");
    managedashboard.on("failedAddRBONDS_Mapping",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // managedashboard.removeAllListeners();
      res.send(err);
    });
    managedashboard.removeAllListeners("successfulAddRBONDS_Mapping");
    managedashboard.on("successfulAddRBONDS_Mapping",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // managedashboard.removeAllListeners();
      res.send(result);
    });   
    if(req.user.isAdmin==false){
      logger.emit("error","You are not an admin to manage RBONDS_Mapping",sessionuserid);
      managedashboard.emit("failedAddDashboardQuery",{"error":{"code":"EA001","message":"You have not authorize to manage RBONDS_Mapping"}});
    }else{
      managedashboard.addRBONDS_Mapping(sessionuserid);
    }
}

exports.updateRBONDS_Mapping = function(req,res){    
    var chartaccessdata = req.body;
    var code = req.params.code;
    logger.emit("log","req product body"+JSON.stringify(req.body));
    var managedashboard = new ManageDashboard(chartaccessdata);
  
    var sessionuserid=req.user.userid;
     logger.emit("log","sessionid:"+sessionuserid);
    managedashboard.removeAllListeners("failedUpdateRBONDS_Mapping");
    managedashboard.on("failedUpdateRBONDS_Mapping",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // managedashboard.removeAllListeners();
      res.send(err);
    });
    managedashboard.removeAllListeners("successfulUpdateRBONDS_Mapping");
    managedashboard.on("successfulUpdateRBONDS_Mapping",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // managedashboard.removeAllListeners();
      res.send(result);
    });   
    if(req.user.isAdmin==false){
      logger.emit("error","You are not an admin to manage RBONDS_Mapping",sessionuserid);
      managedashboard.emit("failedAddDashboardQuery",{"error":{"code":"EA001","message":"You have not authorize to manage RBONDS_Mapping"}});
    }else{
      managedashboard.updateRBONDS_Mapping(code,sessionuserid);
    }
}

exports.getRBONDS_Mapping = function(req,res){    
    var managedashboard = new ManageDashboard();  
    var sessionuserid=req.user.userid;
     logger.emit("log","sessionid:"+sessionuserid);
    managedashboard.removeAllListeners("failedGetRBONDS_Mapping");
    managedashboard.on("failedGetRBONDS_Mapping",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // managedashboard.removeAllListeners();
      res.send(err);
    });
    managedashboard.removeAllListeners("successfulGetRBONDS_Mapping");
    managedashboard.on("successfulGetRBONDS_Mapping",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // managedashboard.removeAllListeners();
      res.send(result);
    });   
    if(req.user.isAdmin==false){
      logger.emit("error","You are not an admin to get RBONDS_Mapping code",sessionuserid);
      managedashboard.emit("failedGetRBONDS_Mapping",{"error":{"code":"EA001","message":"You have not authorize to get RBONDS_Mapping"}});
    }else{
      managedashboard.getRBONDS_Mapping(sessionuserid);
    }
}

exports.getAnalyticsDataForProduct = function(req, res) {
  var sessionuserid = req.user.userid;
  var prodle = req.params.prodle;
  var queryid = req.params.queryid;
  var managedashboard = new ManageDashboard();

  managedashboard.removeAllListeners("failedGetAnalyticsDataForProduct");
    managedashboard.on("failedGetAnalyticsDataForProduct",function(err){
      logger.emit("error", err.error.message,req.user.userid);
      res.send(err);
    });

    managedashboard.removeAllListeners("successfulGetAnalyticsDataForProduct");
  managedashboard.on("successfulGetAnalyticsDataForProduct",function(result){
      logger.emit("info", result.success.message);      
    res.send(result);
  });
  managedashboard.getAnalyticsDataForProduct(prodle,queryid,sessionuserid);
}