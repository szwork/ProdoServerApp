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
var DashboardModel = require("./dashboard-charts-model");
var manageDashboardModel = require("./manage-dashboard-model");
var chartAccessModel = require("./dashboard-chartaccess-model");

function isArray(what) {
    return Object.prototype.toString.call(what) === '[object Array]';
}

var ManageDashboard = function(dashboarddata) {
	this.dashboarddata = dashboarddata;
};

ManageDashboard.prototype = new events.EventEmitter;
module.exports = ManageDashboard;

ManageDashboard.prototype.getDashboardIcons = function(dashboard_access_code) {
	var self=this;
	/////////////////////////
	_getDashboardIcons(self);
	////////////////////////
};

var _getDashboardIcons=function(self){
	DashboardModel.aggregate([{$group:{_id:{category:"$category"},charticons:{"$addToSet":{chartname:"$chartname",description:"$description",type:"$type",charts:"$charts",query:"$query"}}}},{$project:{category:"$_id.category",charticons:"$charticons",_id:0}}]).exec(function(err,dashboardicons){
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

ManageDashboard.prototype.getDashboardChartsData = function() {
	var self=this;
	/////////////////////////
	_getDashboardChartsData(self);
	////////////////////////
};
var _getDashboardChartsData=function(self){
	DashboardModel.find({},{chartid:1,chartname:1,_id:0}).exec(function(err,dashboardchartdata){
		if(err){
			self.emit("failedGetDashboardChartsData",{"error":{"code":"ED001","message":"Error in db to find dashboard icons"}});
		}else if(dashboardchartdata.length>0){
			///////////////////////////////////////////////////////////
			_successfulGetDashboardChartsData(self,dashboardchartdata);
			///////////////////////////////////////////////////////////
		}else{			
			self.emit("failedGetDashboardChartsData",{"error":{"code":"AP001","message":"Dashboard Icons Not Available"}});
		}
	})
}

var _successfulGetDashboardChartsData=function(self,dashboardchartdata){
	logger.emit("log","_successfulGetDashboardChartsData");
	self.emit("successfulGetDashboardChartsData", {"success":{"message":"Getting Dashboard Chart Details Successfully","doc":dashboardchartdata}});
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
	}else if(querydata.queryname==undefined || querydata.queryname==""){
   		self.emit("failedAddDashboardQuery",{"error":{"code":"AV001","message":"Please pass queryname"}});
   	}else if(querydata.description==undefined || querydata.description==""){
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

ManageDashboard.prototype.getAllDashboardQuery = function() {
	var self=this;
	/////////////////////////
	_getAllDashboardQuery(self);
	////////////////////////
};

var _getAllDashboardQuery=function(self){
	manageDashboardModel.find({}).exec(function(err,dashboardquery){
		if(err){
			self.emit("failedGetAllDashboardQuery",{"error":{"code":"ED001","message":"Error in db to find dashboard icons"}});
		}else if(dashboardquery.length>0){
			 ////////////////////////////////
			_successfulGetAllDashboardQuery(self,dashboardquery);
			//////////////////////////////////
		}else{			
			self.emit("failedGetAllDashboardQuery",{"error":{"code":"AP001","message":"Dashboard Queries Not Available"}});
		}
	})
}

var _successfulGetAllDashboardQuery=function(self,dashboardquery){
	logger.emit("log","_successfulGetAllDashboardQuery");
	self.emit("successfulGetAllDashboardQuery", {"success":{"message":"Getting Dashboard Queries Successfully","doc":dashboardquery}});
}

ManageDashboard.prototype.addRBONDS_Mapping=function(sessionuserid){
	var self=this;
	var chartaccessdata=this.dashboarddata;
	console.log("chartaccessdata : "+JSON.stringify(chartaccessdata));
	////////////////////////////////////////////////////////////
	_validateAddRBONDS_Mapping(self,chartaccessdata,sessionuserid);
	//////////////////////////////////////////////////////////
}

var _validateAddRBONDS_Mapping = function(self,chartaccessdata,userid){
	if(chartaccessdata.code==undefined){
		self.emit("failedAddRBONDS_Mapping",{"error":{"code":"AV001","message":"Please pass data"}});
    }else if(chartaccessdata.chartids==undefined){
	  	self.emit("failedAddRBONDS_Mapping",{"error":{"code":"AV001","message":"Please pass chartids"}});
    }else if(!isArray(chartaccessdata.chartids)){
	  	self.emit("failedAddRBONDS_Mapping",{"error":{"code":"AV001","message":"chartids should be an array"}});
    }else{
    	_checkRBONDS_MappingAlreadyExist(self,chartaccessdata,userid);
		
    }
}

var _checkRBONDS_MappingAlreadyExist = function(self,chartaccessdata,userid){
	chartAccessModel.findOne({code:chartaccessdata.code},function(err,product){
		if(err){
			self.emit("failedAddRBONDS_Mapping",{"error":{"code":"ED001","message":"Error in db to add new product "}});	
		}else if(product){
			self.emit("failedAddRBONDS_Mapping",{"error":{"message":"RBONDS_Mapping Code Already Exist"}});
		}else{
			////////////////////////////////////////////////
	   		_addRBONDS_Mapping(self,chartaccessdata,userid);
	   		///////////////////////////////////////////////		
		}
	});
}

var _addRBONDS_Mapping = function(self,chartaccessdata,userid){
	var chartaccess=new chartAccessModel(chartaccessdata);
	chartaccess.save(function(err,addstatus){
	   	if(err){
	  		self.emit("failedAddRBONDS_Mapping",{"error":{"code":"ED001","message":"Error in db to add new product "}});	
	   	}else{
		    /////////////////////////////////////////////
			_successfulAddRBONDS_Mapping(self,addstatus);
	  		/////////////////////////////////////////////
	   	}
	});
}

var _successfulAddRBONDS_Mapping=function(self,dashboardquery){
	logger.emit("log","_successfulAddRBONDS_Mapping");
	self.emit("successfulAddRBONDS_Mapping", {"success":{"message":"RBONDS_Mapping Added Successfully"}});
}

ManageDashboard.prototype.getAnalyticsDataForProduct=function(prodle,queryid,sessionuserid){
	var self=this;
	////////////////////////////////////////////////////////////
	_getQueryNameByQueryid(self,prodle,queryid,sessionuserid);
	//////////////////////////////////////////////////////////
	console.log("prodle : "+prodle+" queryid : "+queryid+" sessionuserid : "+sessionuserid);
}

var _getQueryNameByQueryid = function(self,prodle,queryid,userid){
	manageDashboardModel.findOne({queryid:queryid},function(err,queryname){
		if(err){
			self.emit("failedGetAnalyticsDataForProduct",{"error":{"code":"ED001","message":"Error in db to find queryname"}});	
		}else if(queryname){
			///////////////////////////////////////////////
	   		_validateQueryExecution(self,prodle,queryname);
	   		///////////////////////////////////////////////	
		}else{
			self.emit("failedGetAnalyticsDataForProduct",{"error":{"message":"Wrong queryid"}});
		}
	});
}

var _validateQueryExecution = function(self,prodle,queryname){
	console.log("QueryNamq #### : "+JSON.stringify(queryname));
}