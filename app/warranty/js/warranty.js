/*
* Overview: Warranty 
* Dated:
* Author: Ramesh Kunhiraman
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* 26-02-2014|Dinesh|Add a Warranty 
*/

var events = require("events");
var logger = require("../../common/js/logger");
var ProductModel = require("../../product/js/product-model");
var WarrantyModel = require("./warranty-model");

var Warranty = function(warrantydata) {
	this.warranty = warrantydata;
};
 
Warranty.prototype = new events.EventEmitter;
module.exports = Warranty;

Warranty.prototype.addUserWarranty = function(sessionuserid){
	var self = this;
	var warrantydata = this.warranty;
	// console.log("WarrantyData : " + JSON.stringify(warrantydata));
	////////////////////////////////////////////////////////////
	_validateWarrantyData(self,warrantydata,sessionuserid);
	//////////////////////////////////////////////////////////
}

var _validateWarrantyData = function(self,warrantydata,sessionuserid){
	//validate warranty data
	if(warrantydata==undefined){
		self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"Please provide data to add warranty"}});
	}else if(warrantydata.prodle==undefined){
		self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"Please pass prdouct id"}});
	}else if(warrantydata.userid==undefined){
		self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"Please provide userid"}});		
	}else if(warrantydata.name==undefined){
		self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"Please pass prdouct name"}});
	}else if(warrantydata.model_no==undefined){
		self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"Please pass model number"}});
	}else if(warrantydata.model_name==undefined){
	  	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"please pass model name"}});
	}else if(warrantydata.serial_no==undefined){
	  	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"please pass serial number"}});
	}else if(warrantydata.purchase_date==undefined){
	  	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"please pass date of purchase"}});
	}else if(warrantydata.expirydate==undefined){
	  	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"please pass expiry date"}});
	}else if(warrantydata.description==undefined){
	  	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"please pass description "}});
	}else{
	  	_checkProdleIsValid(self,warrantydata,sessionuserid);	   	
	}
};

var _checkProdleIsValid = function(self,warrantydata,sessionuserid){
	ProductModel.findOne({prodle:warrantydata.prodle},function(err,productdata){
		if(err){
			self.emit("failedAddUserWarranty",{"error":{"code":"ED001","message":" function:_checkProdleIsValid \nError in db to find product err message: "+err}})
		}else if(!productdata){
			self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"Wrong prodle"}})
		}else{
			///////////////////////////////////
			_checkWarrantyAlreadyExist(self,warrantydata);
			///////////////////////////////////
		}
	})
}

var _checkWarrantyAlreadyExist = function(self,warrantydata){
	WarrantyModel.findOne({prodle:warrantydata.prodle,userid:warrantydata.userid},function(err,warranty){
		if(err){
			self.emit("failedAddUserWarranty",{"error":{"code":"ED001","message":"Error in db to find warranty err message: "+err}})
		}else if(!warranty){
			///////////////////////////////////
			_addUserWarranty(self,warrantydata);
			///////////////////////////////////			
		}else{
			self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"Warranty Already Exist"}})		
		}
	})	
}

var _addUserWarranty = function(self,warrantydata){
	
	var warranty = new WarrantyModel(warrantydata);
	warranty.save(function(err,warranty_data){
	 	if(err){
	  		self.emit("failedAddUserWarranty",{"error":{"code":"ED001","message":"Error in db to add new warranty "+ err}});	
	  	}else{
	  		////////////////////////////
	  		_successfulWarrantyAdd(self);
	  		////////////////////////////
	  	}
	})	
}

var _successfulWarrantyAdd = function(self){
	logger.log("log","successfulAddUserWarranty");
	self.emit("successfulAddUserWarranty",{"success":{"message":"Warranty added sucessfully"}})
}

Warranty.prototype.updateUserWarranty = function(userid,prodle){
	var self = this;
	var warrantydata = this.warranty;
	// console.log("WarrantyData : " + JSON.stringify(warrantydata));
	////////////////////////////////////////////////////////////
	_validateUpdateWarrantyData(self,userid,prodle);
	//////////////////////////////////////////////////////////
}

var _validateUpdateWarrantyData = function(self,userid,prodle){
	//validate warranty update data
	var warrantydata = self.warranty;
	if(warrantydata==undefined){
		self.emit("failedUpdateWarranty",{"error":{"code":"AV001","message":"Please provide data to add warranty"}});
	}else if(warrantydata.name==undefined){
		self.emit("failedUpdateWarranty",{"error":{"code":"AV001","message":"Please pass prdouct name"}});
	}else if(warrantydata.model_no==undefined){
		self.emit("failedUpdateWarranty",{"error":{"code":"AV001","message":"Please pass model number"}});
	}else if(warrantydata.model_name==undefined){
	  	self.emit("failedUpdateWarranty",{"error":{"code":"AV001","message":"please pass model name"}});
	}else if(warrantydata.serial_no==undefined){
	  	self.emit("failedUpdateWarranty",{"error":{"code":"AV001","message":"please pass serial number"}});
	}else if(warrantydata.purchase_date==undefined){
	  	self.emit("failedUpdateWarranty",{"error":{"code":"AV001","message":"please pass date of purchase"}});
	}else if(warrantydata.expirydate==undefined){
	  	self.emit("failedUpdateWarranty",{"error":{"code":"AV001","message":"please pass expiry date"}});
	}else if(warrantydata.description==undefined){
	  	self.emit("failedUpdateWarranty",{"error":{"code":"AV001","message":"please pass description "}});
	}else{
		
	  	// _checkProdleIsValid(self,warrantydata);	   	
	}
};