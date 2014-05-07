var TagReffDicModel = require("../../tagreffdictionary/js/tagreffdictionary-model");
var FeatureAnalyticsModel = require("./feature-analytics-model");
var userModel=require("../../user/js/user-model");
var commentModel = require("../../comment/js/comment-model");
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
	_successfulGetFeatureAnalytics(self,featureanalytics,productanalytics);
}

var _successfulGetFeatureAnalytics = function(self,barchart_analytics,piechart_analytics){
	logger.emit("log","_successfulGetFeatureAnalytics");
	self.emit("successfulGetFeatureAnalytics", {"success":{"message":"Getting tag analytics successfully","barchart_analytics":barchart_analytics,"piechart_analytics":piechart_analytics}});
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

// 

FeatureAnalytics.prototype.getDatewiseTrendingForProduct = function(prodle) {
	var self = this;
	//////////////////
	_getDatewiseTrendingForProduct(self,prodle);
	///////////////////
};

var _getDatewiseTrendingForProduct = function(self,prodle){
	userModel.aggregate([{$unwind:"$products_followed"},{$match:{"products_followed.prodle":prodle}},{$group:{_id:"$products_followed.followdate",count:{$sum:1}}},{$project:{x:"$_id",y:"$count",_id:0}}]).exec(function(err,producttrend){
		if(err){
			self.emit("failedGetDatewiseTrendingForProduct",{"error":{"code":"ED001","message":"Error in db to find product follow trending"}});
		}else if(producttrend.length>0){
			////////////////////////////////
			_getDatewiseTrendingForProductComment(self,prodle,producttrend);
			////////////////////////////////
		}else{
			self.emit("failedGetDatewiseTrendingForProduct",{"error":{"code":"AU003","message":"wrong prodle"}});
		}
	})
};

var _getDatewiseTrendingForProductComment = function(self,prodle,producttrend){
	commentModel.aggregate([{$match:{prodle:prodle}},{$project:{day:{$dayOfMonth:'$datecreated'},month:{$month:'$datecreated'},year:{$year:'$datecreated'}}},{$group:{_id:{day:'$day',month:'$month',year:'$year'}, count: {$sum:1}}}]).exec(function(err,commenttrend){
		if(err){
			self.emit("failedGetDatewiseTrendingForProduct",{"error":{"code":"ED001","message":"Error in db to find comment trending"}});
		}else if(commenttrend.length>0){
			////////////////////////////////
			_successfulGetDatewiseTrendingForProduct(self,producttrend,commenttrend);
			////////////////////////////////
		}else{
			self.emit("failedGetDatewiseTrendingForProduct",{"error":{"code":"AU003","message":"wrong prodle"}});
		}
	})
};

var _successfulGetDatewiseTrendingForProduct = function(self,producttrend,commenttrend){
	logger.emit("log","_successfulGetDatewiseTrendingForProduct");
	self.emit("successfulGetDatewiseTrendingForProduct", {"success":{"message":"Getting Datewise Trending Successfully","producttrending":producttrend,"commenttrending":commenttrend}});
}