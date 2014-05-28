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
var TagReffDicModel = require("../../tagreffdictionary/js/tagreffdictionary-model");
var FeatureAnalyticsModel = require("../../featureanalytics/js/feature-analytics-model");
var __=require("underscore");

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
	// _getDashboardIcons(self);
	_getChartIdsByCode(self,dashboard_access_code);
	////////////////////////
};

var _getChartIdsByCode=function(self,code){
	chartAccessModel.findOne({code:code}).exec(function(err,accesscoderesult){
		if(err){
			self.emit("failedGetDashboardIcons",{"error":{"code":"ED001","message":"Error in db to find chartids by code"}});
		}else if(accesscoderesult){
			console.log("ABC : "+JSON.stringify(accesscoderesult.chartids));
			/////////////////////////////////////////////////////////
			_getDashboardIcons(self,accesscoderesult.chartids);
			/////////////////////////////////////////////////////////
		}else{			
			self.emit("failedGetDashboardIcons",{"error":{"code":"AP001","message":"Dashboard Icons Not Available"}});
		}
	})
}

var _getDashboardIcons=function(self,chartids){
	DashboardModel.aggregate([{$match:{chartid:{$in:chartids}}},{$group:{_id:{category:"$category"},charticons:{"$addToSet":{chartname:"$chartname",description:"$description",type:"$type",charts:"$charts",query:"$query"}}}},{$project:{category:"$_id.category",charticons:"$charticons",_id:0}}]).exec(function(err,dashboardicons){
		if(err){
			self.emit("failedGetDashboardIcons",{"error":{"code":"ED001","message":"Error in db to find dashboard icons"}});
		}else if(dashboardicons.length>0){
			if(dashboardicons.length==3){
				/////////////////////////////////////////////////
				_successfulGetDashboardIcons(self,dashboardicons);
				/////////////////////////////////////////////////
			}else{
				var resultcategoryarray=[];
				var categoryarray=["Product","Campaign","Organization"];
				for(var i=0;i<dashboardicons.length;i++){
					resultcategoryarray.push(dashboardicons[i].category);
			    }
			    var category_array=__.difference(categoryarray,resultcategoryarray);
			    for(var j=0;j<category_array.length;j++){
			    	dashboardicons.push({category:category_array[j],charticons:[]});
			    }
			    /////////////////////////////////////////////////
				_successfulGetDashboardIcons(self,dashboardicons);
				/////////////////////////////////////////////////							
			}
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
	if(chartaccessdata==undefined){
		self.emit("failedAddRBONDS_Mapping",{"error":{"code":"AV001","message":"Please pass data"}});
    }else if(chartaccessdata.code==undefined){
		self.emit("failedAddRBONDS_Mapping",{"error":{"code":"AV001","message":"Please pass code"}});
    }else if(chartaccessdata.chartids==undefined){
	  	self.emit("failedAddRBONDS_Mapping",{"error":{"code":"AV001","message":"Please pass chartids"}});
    }else if(!isArray(chartaccessdata.chartids)){
	  	self.emit("failedAddRBONDS_Mapping",{"error":{"code":"AV001","message":"chartids should be an array"}});
    }else{
    	_checkRBONDS_MappingAlreadyExist(self,chartaccessdata,userid);		
    }
}

var _checkRBONDS_MappingAlreadyExist = function(self,chartaccessdata,userid){
	chartAccessModel.findOne({code:chartaccessdata.code},function(err,chartaccesscode){
		if(err){
			self.emit("failedAddRBONDS_Mapping",{"error":{"code":"ED001","message":"Error in db to check RBONDS_Mapping "}});	
		}else if(chartaccesscode){
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

ManageDashboard.prototype.updateRBONDS_Mapping=function(code,sessionuserid){
	var self=this;
	var chartaccessdata=this.dashboarddata;
	console.log("chartaccessdata : "+JSON.stringify(chartaccessdata));
	////////////////////////////////////////////////////////////
	_validateUpdateRBONDS_Mapping(self,code,chartaccessdata,sessionuserid);
	//////////////////////////////////////////////////////////
}

var _validateUpdateRBONDS_Mapping = function(self,code,chartaccessdata,userid){
	if(chartaccessdata==undefined){
		self.emit("failedUpdateRBONDS_Mapping",{"error":{"code":"AV001","message":"Please pass data"}});
    }else if(chartaccessdata.code!=undefined){
		self.emit("failedUpdateRBONDS_Mapping",{"error":{"code":"AV001","message":"Can't update code"}});
    }else if(chartaccessdata.chartids==undefined){
	  	self.emit("failedUpdateRBONDS_Mapping",{"error":{"code":"AV001","message":"Please pass chartids"}});
    }else if(!isArray(chartaccessdata.chartids)){
	  	self.emit("failedUpdateRBONDS_Mapping",{"error":{"code":"AV001","message":"chartids should be an array"}});
    }else{
    	_updateRBONDS_Mapping(self,code,chartaccessdata,userid);		
    }
}

var _updateRBONDS_Mapping = function(self,code,chartaccessdata,userid){
	chartAccessModel.update({code:code},{$set:chartaccessdata}).lean().exec(function(err,RBONDS_MappingUpdateStatus){
		if(err){
			self.emit("failedUpdateRBONDS_Mapping",{"error":{"code":"ED001","message":"Error in db to update RBONDS_Mapping"}});
		}else if(RBONDS_MappingUpdateStatus!=1){
			self.emit("failedUpdateRBONDS_Mapping",{"error":{"code":"AP001","message":"Wrong code"}});
		}else{
			////////////////////////////////
			_successfulUpdateRBONDS_Mapping(self);
			//////////////////////////////////
		}
	})	
}

var _successfulUpdateRBONDS_Mapping=function(self){
	logger.emit("log","_successfulUpdateRBONDS_Mapping");
	self.emit("successfulUpdateRBONDS_Mapping", {"success":{"message":"RBONDS_Mapping Updated Successfully"}});
}

ManageDashboard.prototype.getRBONDS_Mapping=function(sessionuserid){
	var self=this;
	///////////////////////////////////////
	_getRBONDS_Mapping(self,sessionuserid);
	///////////////////////////////////////
}

var _getRBONDS_Mapping = function(self,sessionuserid){
	chartAccessModel.find({},function(err,RBONDS_Mapping){
		if(err){
			self.emit("failedGetRBONDS_Mapping",{"error":{"code":"ED001","message":"Error in db to get RBONDS_Mapping"}});	
		}else if(RBONDS_Mapping){
			var rbond_code = [];
			for(var i=0;i<RBONDS_Mapping.length;i++){
				rbond_code.push({code:RBONDS_Mapping[i].code,chartids:RBONDS_Mapping[i].chartids});
			}
			var initialvalue=0;     
			var result_arr =[];
	        _getChartIDAndName(self,rbond_code,initialvalue,result_arr);
		}else{
			self.emit("failedGetRBONDS_Mapping",{"error":{"message":"RBONDS_Mapping Code Does Not Exist"}});
		}
	});
}

var _getChartIDAndName = function(self,rbond_code,initialvalue,result_arr){
	var code=rbond_code[initialvalue];
	if(rbond_code.length>initialvalue){
		DashboardModel.find({chartid:{$in:code.chartids}},{chartid:1,chartname:1,_id:0}).lean().exec(function(err,doc){
	        if(err){
	            self.emit("failedGetRBONDS_Mapping",{"error":{"code":"ED001","message":"Error in db to get RBONDS_Mapping"}});	
	        }else{
	            result_arr.push({code:code.code,charts:doc});
	            _getChartIDAndName(self,rbond_code,++initialvalue,result_arr);
	        }
    	});
	}else{
       _successfulGetRBONDS_Mapping(self,result_arr);
	}
}

var _successfulGetRBONDS_Mapping=function(self,RBONDS_Mapping){
	logger.emit("log","_successfulGetRBONDS_Mapping");
	self.emit("successfulGetRBONDS_Mapping", {"success":{"message":"Getting RBONDS_Mapping Details Successfully","RBONDS_Mapping":RBONDS_Mapping}});
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

var _validateQueryExecution = function(self,prodle,query){
	console.log("QueryNamq #### : "+JSON.stringify(query));
	if(query.queryname == "overall product sentiment"){
		// Calculate count for each tag from product comments
		_tagCountForProductComment(self,prodle);
	}else if(query.queryname == "detailed product comments response"){
		// Calculate positive, negative and neutral responses from product comments
		_posiNegaNeutResponseForProductComment(self,prodle);
	}else if(query.queryname == "overall campaign sentiment"){
		// Based on Emotional Scale Model get overall view of what people are talking about the campaign
		_posiNegaNeutResponseForCampaignComment(self,prodle);
	}
}

var _tagCountForProductComment = function(self,prodle){
	FeatureAnalyticsModel.aggregate([{$unwind:"$analytics"},{$match:{prodle:prodle}},{$group:{_id:{tagid:"$analytics.tagid",tagname:"$analytics.tagname"},tagcount:{$sum:1}}},{$project:{tagid:"$_id.tagid",tagname:"$_id.tagname",tagcount:1,_id:0}}]).exec(function(err,producttagcount){
		if(err){
			self.emit("failedGetAnalyticsDataForProduct",{"error":{"code":"ED001","message":"Error in db to find overall product sentiment"}});
		}else if(producttagcount.length == 0){
			self.emit("failedGetAnalyticsDataForProduct",{"error":{"code":"AU003","message":"overall product sentiment does not exists"}});
		}else{
			////////////////////////////////
			_successfulGetAnalyticsDataForProduct(self,producttagcount);
			////////////////////////////////
		}
	})
};

var _posiNegaNeutResponseForProductComment = function(self,prodle){
	//Get Tag and Count of tag
	FeatureAnalyticsModel.aggregate([{$unwind:"$analytics"},{$match:{prodle:prodle}},{$group:{_id:{tagid:"$analytics.tagid",tagname:"$analytics.tagname"},tagcount:{$sum:1}}},{$project:{tagid:"$_id.tagid",tagname:"$_id.tagname",tagcount:1,_id:0}}]).exec(function(err,producttagcount){
		if(err){
			self.emit("failedGetAnalyticsDataForProduct",{"error":{"code":"ED001","message":"Error in db to find tag analytics"}});
		}else if(producttagcount.length == 0){
			self.emit("failedGetAnalyticsDataForProduct",{"error":{"code":"AU003","message":"Feature analytics does not exists"}});
		}else{
			//////////////////////////////////////////////////////////
			_getTagAnalyticsFromReffDict(self,prodle,producttagcount);
			//////////////////////////////////////////////////////////
		}
	})
};

var _getTagAnalyticsFromReffDict = function(self,prodle,producttagcount){
	// Get Positive Negative Neutral Respons for tag
	var tagids = [];
	for(var i=0;i<producttagcount.length;i++){
		tagids.push(producttagcount[i].tagid);
	}

	TagReffDicModel.aggregate([{$match:{tagid:{$in:tagids}}},{$group:{_id:"$emotions.result",tagid:{"$addToSet":"$tagid"}}}]).exec(function(err,taganalytics){
		if(err){
			self.emit("failedGetAnalyticsDataForProduct",{"error":{"code":"ED001","message":"Error in db to find all tag analytics from tagreffdictionary"}});
		}else if(taganalytics.length == 0){
			self.emit("failedGetAnalyticsDataForProduct",{"error":{"code":"AU003","message":"Tag analytics does not exists in refference dictionary"}});
		}else{
			////////////////////////////////
			_getFinalAnalyticsResult(self,prodle,producttagcount,taganalytics);			
			////////////////////////////////
		}
	})
};

var _getFinalAnalyticsResult = function(self,prodle,producttagcount,taganalytics){
	var feature_tagids = [];
	var productanalytics=[];
	for(var i=0;i<producttagcount.length;i++){
		feature_tagids.push(producttagcount[i].tagid);
	}

	for(var j=0;j<taganalytics.length;j++){
		var taganalyticscount=0;
		for(var k=0;k<taganalytics[j].tagid.length;k++){
			if(feature_tagids.indexOf(taganalytics[j].tagid[k])>=0){
				taganalyticscount+=producttagcount[feature_tagids.indexOf(taganalytics[j].tagid[k])].tagcount;
			}
		}
		productanalytics.push({emotionname:taganalytics[j]._id,tagcount:taganalyticscount});	
	}

	_successfulGetAnalyticsDataForProduct(self,productanalytics);
}

var _successfulGetAnalyticsDataForProduct = function(self,doc){
	logger.emit("log","_successfulGetAnalyticsDataForProduct");
	self.emit("successfulGetAnalyticsDataForProduct", {"success":{"message":"Getting product chart details successfully","doc":doc}});
}

var _posiNegaNeutResponseForCampaignComment = function(self,prodle){
	//Get Tag and Count of tag
	FeatureAnalyticsModel.aggregate([{$unwind:"$analytics"},{$match:{prodle:prodle}},{$group:{_id:{tagid:"$analytics.tagid",tagname:"$analytics.tagname"},tagcount:{$sum:1}}},{$project:{tagid:"$_id.tagid",tagname:"$_id.tagname",tagcount:1,_id:0}}]).exec(function(err,producttagcount){
		if(err){
			self.emit("failedGetAnalyticsDataForProduct",{"error":{"code":"ED001","message":"Error in db to find tag analytics"}});
		}else if(producttagcount.length == 0){
			self.emit("failedGetAnalyticsDataForProduct",{"error":{"code":"AU003","message":"Feature analytics does not exists"}});
		}else{
			//////////////////////////////////////////////////////////
			_getTagAnalyticsFromReffDict(self,prodle,producttagcount);
			//////////////////////////////////////////////////////////
		}
	})
};