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
var manageDashboardModel = require("../../dashboard/js/manage-dashboard-model");

var ManageDashboard = function(dashboarddata) {
	this.dashboarddata = dashboarddata;
};

ManageDashboard.prototype = new events.EventEmitter;
module.exports = ManageDashboard;

ManageDashboard.prototype.getDashboardIcons = function() {
	var self=this;
	/////////////////////////
	_getDashboardIcons(self);
	////////////////////////
};
var _getDashboardIcons=function(self){
	DashboardModel.aggregate([{$group:{_id:{category:"$category"},charticons:{"$addToSet":{chartname:"$chartname",description:"$description",type:"$type",charts:"$charts"}}}},{$project:{category:"$_id.category",charticons:"$charticons",_id:0}}]).exec(function(err,dashboardicons){
		if(err){
			self.emit("failedGetDashboardIcons",{"error":{"code":"ED001","message":"Error in db to find dashboard icons"}});
		}else if(dashboardicons.length>0){
			 ////////////////////////////////
			_successfulGetDashboardIcons(self,dashboardicons);
			//////////////////////////////////
		}else{			
			self.emit("failedGetDashboardIcons",{"error":{"code":"AP001","message":"Dashboard Icons Not Available"}});
		}
	})
}

var _successfulGetDashboardIcons=function(self,dashboardicons){
	logger.emit("log","_successfulGetDashboardIcons");
	self.emit("successfulGetDashboardIcons", {"success":{"message":"Getting Dashboard Icons Successfully","doc":dashboardicons}});
}

ManageDashboard.prototype.addQuery=function(sessionuserid){
	var self=this;
	var querydata=this.dashboarddata;
	console.log("querydata : "+JSON.stringify(querydata));
	////////////////////////////////////////////////////////////
	_validateAddQueryData(self,querydata,sessionuserid);
	//////////////////////////////////////////////////////////
}

var _validateAddQueryData = function(self,querydata,sessionuserid) {
	if(querydata==undefined){
		self.emit("failedAddDashboardQuery",{"error":{"code":"AV001","message":"Please provide querydata"}});
	}else if(querydata.queryname==undefined){
   		self.emit("failedAddDashboardQuery",{"error":{"code":"AV001","message":"Please pass queryname"}});
   	}else if(querydata.description==undefined){
    	self.emit("failedAddDashboardQuery",{"error":{"code":"AV001","message":"please pass description "}});
  	}else{
  	 	//////////////////////////////////////////
		_checkQueryNameExistOrNot(self,querydata);
		//////////////////////////////////////////
    }
};

var _checkQueryNameExistOrNot = function(self,querydata){
	manageDashboardModel.findOne({queryname:querydata.queryname.toLowerCase()},function(err,querydetails){
		if(err){
			self.emit("failedAddDashboardQuery",{"error":{"code":"ED001","message":"Error in db to add query"}});	
		}else if(querydetails){
			self.emit("failedAddDashboardQuery",{"error":{"code":"AV001","message":"Query Name Already Exist Try Again..."}});
		}else{
			_addQuery(self,querydata);
		}	
	})		
}

var _addQuery = function(self,querydata){		
    var managedashboard=new manageDashboardModel(querydata);
	managedashboard.save(function(err,addstatus){
	  	if(err){
	   		self.emit("failedAddDashboardQuery",{"error":{"code":"ED001","message":"Error in db to add new product "}});	
	   	}else{
			///////////////////////
			_successfulAddDashboardQuery(self);
			/////////////////////////	    		
	    }
	});
}

var _successfulAddDashboardQuery=function(self){
	logger.emit("log","_successfulAddDashboardQuery");
	self.emit("successfulAddDashboardQuery", {"success":{"message":"Dashboard Query Added Successfully"}});
}