var TagReffDicModel = require("../../tagreffdictionary/js/tagreffdictionary-model");
var FeatureAnalyticsModel = require("./feature-analytics-model");
var events = require("events");
var logger=require("../../common/js/logger");

var FeatureAnalytics = function(featureanalyticsdata) {
	this.featureanalyticsdata = featureanalyticsdata;
};

FeatureAnalytics.prototype = new events.EventEmitter;
module.exports = FeatureAnalytics;


FeatureAnalytics.prototype.getTagAnalyticsPieChart = function(prodle) {
	var self = this;
	//////////////////
	_getFeatureAnalytics(self,prodle);
	///////////////////
};

var _getFeatureAnalytics = function(self,prodle){
	FeatureAnalyticsModel.aggregate([{$unwind:"$analytics"},{$match:{prodle:prodle}},{$group:{_id:{tagid:"$analytics.tagid",tagname:"$analytics.tagname"},tagcount:{$sum:1}}},{$project:{tagid:"$_id.tagid",tagname:"$_id.tagname",tagcount:1,_id:0}}]).exec(function(err,featureanalytics){
		if(err){
			self.emit("failedGetFeatureAnalytics",{"error":{"code":"ED001","message":"Error in db to find tag analytics"}});
		}else if(featureanalytics.length == 0){
			self.emit("failedGetFeatureAnalytics",{"error":{"code":"AU003","message":"Feature analytics does not exists"}});
		}else{
			////////////////////////////////
			_getTagAnalyticsFromReffDict(self,featureanalytics);
			////////////////////////////////
		}
	})
};

var _getTagAnalyticsFromReffDict = function(self,featureanalytics){
	// console.log("featureanalytics : "+JSON.stringify(featureanalytics));
	var tagids = [];
	for(var i=0;i<featureanalytics.length;i++){
		tagids.push(featureanalytics[i].tagid);
	}

	TagReffDicModel.aggregate([{$match:{tagid:{$in:tagids}}},{$group:{_id:"$emotions.result",tagid:{"$addToSet":"$tagid"}}}]).exec(function(err,taganalytics){
		if(err){
			self.emit("failedGetFeatureAnalytics",{"error":{"code":"ED001","message":"Error in db to find all tag analytics from tagreffdictionary"}});
		}else if(taganalytics.length == 0){
			self.emit("failedGetFeatureAnalytics",{"error":{"code":"AU003","message":"Tag analytics does not exists in refference dictionary"}});
		}else{
			////////////////////////////////
			_getFinalAnalyticsResult(self,featureanalytics,taganalytics);			
			////////////////////////////////
		}
	})
};

var _getFinalAnalyticsResult = function(self,featureanalytics,taganalytics){
	console.log("featureanalytics : "+JSON.stringify(featureanalytics));
	console.log("taganalytics : "+JSON.stringify(taganalytics));
	var feature_tagids = [];
	var productanalytics=[];
	for(var i=0;i<featureanalytics.length;i++){
		feature_tagids.push(featureanalytics[i].tagid);
	}

	for(var j=0;j<taganalytics.length;j++){
		var taganalyticscount=0;
		for(var k=0;k<taganalytics[j].tagid.length;k++){
			if(feature_tagids.indexOf(taganalytics[j].tagid[k])>=0){
				taganalyticscount+=featureanalytics[feature_tagids.indexOf(taganalytics[j].tagid[k])].tagcount;
			}
		}
		productanalytics.push({emotionname:taganalytics[j]._id,tagcount:taganalyticscount})
	}
	console.log("productanalytics : "+productanalytics);
	_successfulGetFeatureAnalytics(self,productanalytics);
}

var _successfulGetFeatureAnalytics = function(self,taganalytics){
	logger.emit("log","_successfulGetFeatureAnalytics");
	self.emit("successfulGetFeatureAnalytics", {"success":{"message":"Getting tag analytics successfully","taganalytics":taganalytics}});
}

FeatureAnalytics.prototype.getTagAnalyticsForBarChart = function(prodle) {
	var self = this;
	//////////////////
	_getFeatureAnalyticsForBarChart(self,prodle);
	///////////////////
};

var _getFeatureAnalyticsForBarChart = function(self,prodle){
	FeatureAnalyticsModel.aggregate([{$unwind:"$analytics"},{$match:{prodle:prodle}},{$group:{_id:{tagid:"$analytics.tagid",tagname:"$analytics.tagname"},tagcount:{$sum:1}}},{$project:{/*tagid:"$_id.tagid",*/tagname:"$_id.tagname",tagcount:1,_id:0}}]).exec(function(err,featureanalytics){
		if(err){
			self.emit("failedGetTagAnalyticsForBarChart",{"error":{"code":"ED001","message":"Error in db to find tag analytics"}});
		}else if(featureanalytics.length == 0){
			self.emit("failedGetTagAnalyticsForBarChart",{"error":{"code":"AU003","message":"Feature analytics does not exists"}});
		}else{
			////////////////////////////////
			_successfulGetTagAnalyticsForBarChart(self,featureanalytics);
			////////////////////////////////
		}
	})
};

var _successfulGetTagAnalyticsForBarChart = function(self,taganalytics){
	logger.emit("log","_successfulGetTagAnalyticsForBarChart");
	self.emit("successfulGetTagAnalyticsForBarChart", {"success":{"message":"Getting tag analytics successfully","taganalytics":taganalytics}});
}