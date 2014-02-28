/*
* Overview: Product Campain
* Dated:
* Author: Dinesh Sawant
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* 21-04-2014 | Dinesh | Add a new property
* 
*/
var events = require("events");
var logger = require("../../common/js/logger");
// var productCampainModel = require("./product-campain-model");
var ProductCampainModel = require("./product-campain-model");
var ProductCampain = function(campaindata) {
	this.productcampain = campaindata;
};

ProductCampain.prototype = new events.EventEmitter;
module.exports = ProductCampain;

ProductCampain.prototype.addProductCampain=function(orgid,sessionuserid){
	var self=this;
	var campaindata = this.productcampain;
	//////////////////////////////////////////////////////////////////
	_validateProductCampainData(self,campaindata,orgid,sessionuserid);
	/////////////////////////////////////////////////////////////////
}

var _validateProductCampainData = function(self,campaindata,orgid,sessionuserid) {
	//validate the product campain data
	if(campaindata==undefined){
	 	self.emit("failedAddProductCampain",{"error":{"code":"AV001","message":"Please provide data to add product campain"}});
	}else if(campaindata.campain_lead==undefined){
		self.emit("failedAddProductCampain",{"error":{"code":"AV001","message":"Please pass campain_lead"}});
	}else if(campaindata.title==undefined){
		self.emit("failedAddProductCampain",{"error":{"code":"AV001","message":"Please pass campain title"}});
	}else if(campaindata.description==undefined){
	  	self.emit("failedAddProductCampain",{"error":{"code":"AV001","message":"please pass product description "}});
	}else if(campaindata.startdate==undefined){
	  	self.emit("failedAddProductCampain",{"error":{"code":"AV001","message":"please pass start date"}});
	}else if(campaindata.enddate==undefined){
	  	self.emit("failedAddProductCampain",{"error":{"code":"AV001","message":"please pass end date"}});
	}else{
	  	_addProductCampain(self,campaindata,orgid);	   	
	}
};

var _addProductCampain=function(self,campaindata,orgid){

	campaindata.orgid=orgid;
	// campaindata.features=[{featurename:campaindata.name,featuredescription:"product features"}];
	var productcampain = new ProductCampainModel(campaindata);
	productcampain.save(function(err,product_campain_data){
	 	if(err){
	  		self.emit("failedAddProductCampain",{"error":{"code":"ED001","message":"Error in db to add new product campain : "+err}});	
	  	}else{
	  		//////////////////////////////////
	  		_successfulProductCampainAdd(self);
	  		/////////////////////////////////	  
	  	}
	})
}

var _successfulProductCampainAdd=function(self){
	logger.log("log","_successfulAddProductCampain");
	self.emit("successfulAddProductCampain",{"success":{"message":"Product Campain added sucessfully"}})
}

ProductCampain.prototype.getProductCampain = function(orgid,campain_id) {
	var self=this;
	//////////////////////////////////////////
	_getProductCampain(self,orgid,campain_id);
	/////////////////////////////////////////
};

var _getProductCampain = function(self,orgid,campain_id){
	ProductCampainModel.findOne({orgid:orgid,campain_id:campain_id,status:{$ne:"deactive"}}).lean().exec(function(err,productcampain){
		if(err){
			self.emit("failedGetProductCampain",{"error":{"code":"ED001","message":"Error in db to find Product Campain : " +err}});
		}else if(productcampain){
			//////////////////////////////////////////////////
			_successfulGetProductCampain(self,productcampain);
			//////////////////////////////////////////////////
		}else{			
			self.emit("failedGetProductCampain",{"error":{"code":"AP001","message":"Provided orgid or campain_id is wrong"}});
		}
	})
}

var _successfulGetProductCampain = function(self,productcampain){
	logger.emit("log","_successfulGetProductCampain");
	self.emit("successfulGetProductCampain", {"success":{"message":"Getting Product Campain Details Successfully","Product_Campain":productcampain}});
}

ProductCampain.prototype.getAllProductCampain = function(orgid) {
	var self=this;
	//////////////////////////////////
	_getAllProductCampain(self,orgid);
	/////////////////////////////////
};

var _getAllProductCampain = function(self,orgid){
	ProductCampainModel.find({orgid:orgid,status:{$ne:"deactive"}}).lean().exec(function(err,productcampain){
		if(err){
			self.emit("failedGetAllProductCampain",{"error":{"code":"ED001","message":"Error in db to find All Product Campain : "+err}});
		}else if(productcampain.length==0){
			self.emit("failedGetAllProductCampain",{"error":{"code":"AP002","message":"No Product Campain exists"}});
		}else{
			////////////////////////////////////////////////////
			_successfulGetAllProductCampain(self,productcampain);
			////////////////////////////////////////////////////
		}
	})
}

var _successfulGetAllProductCampain = function(self,productcampain){
	logger.emit("log","_successfulGetAllProductCampain");
	self.emit("successfulGetAllProductCampain",{"success":{"message":"Getting All Product Campain Details Successfully","Product_Campains":productcampain}});
}

