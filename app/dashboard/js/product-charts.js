/*
* Overview: Product Charts
* Dated:
* Author: Dinesh Sawant
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* 27-3-2013 | xyx | Add a new property
* 12-11-2013|Sunil|Add a subscription 
*/

var util = require("util");
var events = require("events");
var logger = require("../../common/js/logger");
var S=require('string');
var shortId = require('shortid');
var DashboardModel = require("../../dashboard/js/dashboard-charts-model");

var ProductCharts = function(productdata) {
	this.product = productdata;
};

ProductCharts.prototype = new events.EventEmitter;
module.exports = ProductCharts;

ProductCharts.prototype.getDashboardIcons = function() {
	var self=this;
	/////////////////////////
	_getDashboardIcons(self);
	////////////////////////
};
var _getDashboardIcons=function(self){
	DashboardModel.aggregate([{$group:{_id:{category:"$category"},charticons:{"$addToSet":{chartname:"$chartname",description:"$description",type:"$type",charts:"$charts"}}}},{$project:{category:"$_id.category",charticons:"$charticons",_id:0}}]).exec(function(err,dashboardicons){
		if(err){
			self.emit("failedGetProductCharts",{"error":{"code":"ED001","message":"Error in db to find dashboard icons"}});
		}else if(dashboardicons){
			 ////////////////////////////////
			_successfulGetProductCharts(self,dashboardicons);
			//////////////////////////////////
		}else{			
			self.emit("failedGetProductCharts",{"error":{"code":"AP001","message":"Dashboard Icons Not Available"}});
		}
	})
}

var _successfulGetProductCharts=function(self,dashboardicons){
	logger.emit("log","_successfulGetProductCharts");
	self.emit("successfulGetProductCharts", {"success":{"message":"Getting Dashboard Icons Successfully","doc":dashboardicons}});
}