//importing system
var mongodb = require("mongodb");
var events = require('events');
var eventEmitter = new events.EventEmitter();
var logger=require("../../common/js/logger");

var Marketing=require("./marketing");

exports.getAllMarketingData = function(req, res) {
  console.log("getAllMarketingData");
  var orgid=req.params.orgid;
  var sessionuserid;//=req.user.userid;
  var marketing=new Marketing();
  marketing.removeAllListeners("failedGetMarketingData");
  marketing.on("failedGetMarketingData",function(err){
      // logger.emit("error", err.error.message,req.user.userid);
      // marketing.removeAllListeners();
      res.send(err);
    });
  marketing.removeAllListeners("successfulGetMarketingData");
  marketing.on("successfulGetMarketingData",function(result){
    // logger.emit("info", result.success.message);
      // marketing.removeAllListeners();
    res.send(result);
  });
  
  marketing.getAllMarketingData();

};