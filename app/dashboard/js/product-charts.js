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
var ProductPoolModel = require("../../dashboard/js/product-charts-model");

var ProductCharts = function(productdata) {
	this.product = productdata;
};

ProductCharts.prototype = new events.EventEmitter;
module.exports = ProductCharts;

ProductCharts.prototype.getDashboardIcons = function(prodle) {
	var self=this;
	/////////////////////////
	_getDashboardIcons(self,prodle);
	////////////////////////
};
var _getDashboardIcons=function(self,prodle){
	ProductPoolModel.findOne({prodle:prodle},{_id:0}).lean().exec(function(err,productcharts){
		if(err){
			self.emit("failedGetProductCharts",{"error":{"code":"ED001","message":"Error in db to find dashboard icons"}});
		}else if(productcharts){
			 ////////////////////////////////
			_successfulGetProductCharts(self,productcharts);
			//////////////////////////////////
		}else{			
			self.emit("failedGetProductCharts",{"error":{"code":"AP001","message":"Provided prodle is wrong"}});
		}
	})
}

var _successfulGetProductCharts=function(self,productcharts){
	logger.emit("log","_successfulGetProductCharts");
	self.emit("successfulGetProductCharts", {"success":{"message":"Getting Dashboard Icons Successfully","dashboardicons":productcharts}});
}