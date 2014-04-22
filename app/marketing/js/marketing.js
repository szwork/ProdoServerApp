var util = require("util");
var events = require("events");
var logger=require("../../common/js/logger");
var MarketingModel = require("./marketing-model");

var Marketing = function(marketingdata) {
	this.marketing=marketingdata;
};

Marketing.prototype = new events.EventEmitter;
module.exports = Marketing;

Marketing.prototype.getAllMarketingData=function(){
	var self=this;
	_getAllMarketingData(self);
}

var _getAllMarketingData = function(self){
    MarketingModel.find({status:{$ne:"deactive"}},{name:1,description:1,artwork:1,_id:0}).lean().exec(function(err,doc){
        if(err){
            self.emit("failedGetMarketingData",{"error":{"code":"ED001","message":"Error in db to find all marketing data"}});
        }else if(doc.length==0){
            self.emit("failedGetMarketingData",{"error":{"code":"A003","message":"No marketing data exists"}});
        }else{
            ////////////////////////////////////////////////
            _successfulGetMarketingData(self,doc);
            ///////////////////////////////////////////////
        }
    })
}

var _successfulGetMarketingData=function(self,doc){
    logger.emit("log","_successfulGetMarketingData");
    self.emit("successfulGetMarketingData", {"success":{"message":"Getting Marketing Data Successfully","marketingdata":doc}});
}