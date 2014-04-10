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
	}else if(warrantydata.purchase_location==undefined){
	  	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"please pass purchase location"}});
	}else if(warrantydata.purchase_location.city==undefined){
	  	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"please pass city in purchase location"}});
	}else if(warrantydata.purchase_location.country==undefined){
	  	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"please pass country in purchase location"}});
	}else if(warrantydata.expirydate==undefined){
	  	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"please pass expiry date"}});
	}else if(warrantydata.description==undefined){
	  	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"please pass description "}});
	}else if(warrantydata.warranty_type==undefined && warrantydata.warranty_type!="standard" && warrantydata.warranty_type!="extended"){
	  	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"please pass warranty_type as standard or extended"}});
	}else{
		if(warrantydata.prodle==""){
			_addUserWarranty(self,warrantydata,sessionuserid);
		}else{
			_checkProdleIsValid(self,warrantydata,sessionuserid);
		}	
	}
};

var _checkProdleIsValid = function(self,warrantydata,sessionuserid){

	ProductModel.findOne({prodle:warrantydata.prodle},function(err,productdata){
		if(err){
			self.emit("failedAddUserWarranty",{"error":{"code":"ED001","message":" function:_checkProdleIsValid \nError in db to find product err message: "+err}});
		}else if(!productdata){
			self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"Wrong prodle"}});
		}else{
			///////////////////////////////////
			_checkWarrantyAlreadyExist(self,warrantydata,sessionuserid);
			///////////////////////////////////
		}
	})
}

var _checkWarrantyAlreadyExist = function(self,warrantydata,sessionuserid){
	warrantydata.userid = sessionuserid;
	WarrantyModel.findOne({prodle:warrantydata.prodle,userid:warrantydata.userid},function(err,warranty){
		if(err){
			self.emit("failedAddUserWarranty",{"error":{"code":"ED001","message":"Error in db to find warranty err message: "+err}});
		}else if(!warranty){
			///////////////////////////////////
			_addUserWarranty(self,warrantydata,sessionuserid);
			///////////////////////////////////			
		}else{
			self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"Warranty Already Exist"}});
		}
	})	
}

var _addUserWarranty = function(self,warrantydata,sessionuserid){

	var purchaseDate = new Date(warrantydata.purchase_date);
	var expiryDate = new Date(warrantydata.expirydate);

	// console.log("Date " + purchaseDate);
	// var day = purchaseDate.getDate();
	purchaseDate.setDate(purchaseDate.getDate()+1);
	expiryDate.setDate(expiryDate.getDate()+1);
	// console.log("NewDate " + purchaseDate);
	if(purchaseDate == "Invalid Date"){
		self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"Invalid purchase date"}});
	}else if(expiryDate == "Invalid Date"){
		self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"Invalid expiry date"}});
	}else{
		warrantydata.purchase_date = purchaseDate;
		warrantydata.expirydate = expiryDate;
		warrantydata.userid = sessionuserid;
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
	
}

var _successfulWarrantyAdd = function(self){
	logger.log("log","successfulAddUserWarranty");
	self.emit("successfulAddUserWarranty",{"success":{"message":"Warranty added sucessfully"}})
}

Warranty.prototype.updateUserWarranty = function(userid,warranty_id){
	var self = this;
	var warrantydata = this.warranty;
	// console.log("WarrantyData : " + JSON.stringify(warrantydata));
	////////////////////////////////////////////////
	_validateUpdateWarrantyData(self,userid,warranty_id);
	////////////////////////////////////////////////
}

var _validateUpdateWarrantyData = function(self,userid,warranty_id){
	//validate warranty update data
	var warrantydata = self.warranty;
	if(warrantydata==undefined){
		self.emit("failedUpdateWarranty",{"error":{"code":"AV001","message":"Please provide data to add warranty"}});
	}else{
	  	_updateUserWarranty(self,userid,warranty_id,warrantydata);
	}
};

var _updateUserWarranty = function(self,userid,warranty_id,warrantydata){
	var modifieddate = new Date();
	console.log("userid " + userid+ " warranty_id : "+warranty_id);
	warrantydata.modified_date = modifieddate;
	WarrantyModel.update({userid:userid,warranty_id:warranty_id},{$set:warrantydata}).lean().exec(function(err,warrantyupdatestatus){
		if(err){
			self.emit("failedUpdateWarranty",{"error":{"code":"ED001","message":"Error in db to update warranty"}});
		}else if(warrantyupdatestatus!=1){
			self.emit("failedUpdateWarranty",{"error":{"code":"AP001","message":"userid or warranty_id is wrong"}});
		}else{
			////////////////////////////////
			_successfulUpdateWarranty(self);
			////////////////////////////////
		}
	})
}

var _successfulUpdateWarranty = function(self){
	logger.emit("log","_successfulUpdateProduct");
	self.emit("successfulWarrantyUpdation", {"success":{"message":"Warranty Updated Successfully"}});
}

Warranty.prototype.deleteUserWarranty = function(userid,warranty_id){	
	var self = this;
	////////////////////////////////////////////
	_deleteUserWarranty(self,userid,warranty_id);
	////////////////////////////////////////////
}

var _deleteUserWarranty = function(self,userid,warranty_id){
	console.log("Delete UserId " + userid + " Warranty_id " + warranty_id);
	WarrantyModel.update({userid:userid,warranty_id:warranty_id},{$set:{removedate:new Date(),status:'deactive'}},function(err,userupdatestatus){
		if(err){
			self.emit("failedDeleteUserWarranty",{"error":{"code":"ED001","message":"Error in db to update user data"}});
		}else if(userupdatestatus!=1){
			self.emit("failedDeleteUserWarranty",{"error":{"code":"AU005","message":"Provided userid or Warranty is wrong"}});
		}else{
			/////////////////////////////////////
			_successfulUserWarrantyDeletion(self);
			/////////////////////////////////////
		}
	})
}

var _successfulUserWarrantyDeletion = function(self){
	logger.emit("log","_successfulDeleteUserWarranty");
	self.emit("successfulDeleteUserWarranty", {"success":{"message":"User Warranty Deleted Successfully"}});
}

Warranty.prototype.getUserWarranty = function(userid,warranty_id){
	var self = this;
	/////////////////////////////////////////
	_getUserWarranty(self,userid,warranty_id);
	/////////////////////////////////////////
}

var _getUserWarranty = function(self,userid,warranty_id){
	console.log("_getUserWarranty " + userid+" "+warranty_id);
	WarrantyModel.findOne({status:"active",userid:userid,warranty_id:warranty_id},function(err,warranty){
		if(err){
			self.emit("failedGetUserWarranty",{"error":{"code":"ED001","message":"Error in db to find warranty err message: "+err}})
		}else if(!warranty){
			self.emit("failedGetUserWarranty",{"error":{"code":"AV001","message":"User warranty does not exist"}})
		}else{
			_successfulGetUserWarranty(self,warranty);
		}
	});
}

var _successfulGetUserWarranty = function(self,doc){
	logger.emit("log","_successfulGetUserWarranty");
	self.emit("successfulGetUserWarranty", {"success":{"message":"Getting Warranty details Successfully","Warranty":doc}});
}

Warranty.prototype.getAllUserWarranty = function(userid){
	var self = this;
	/////////////////////////////////////////
	_getAllUserWarranty(self,userid);
	/////////////////////////////////////////
}

var _getAllUserWarranty = function(self,userid){
	console.log("_getAllUserWarranty " + userid);
	WarrantyModel.find({status:"active",userid:userid},function(err,warranty){
		if(err){
			self.emit("failedGetAllUserWarranty",{"error":{"code":"ED001","message":"Error in db to find warranty err message: "+err}})
		}else if(!warranty){
			self.emit("failedGetAllUserWarranty",{"error":{"code":"AV001","message":"User warranty does not exist"}})
		}else{
			_successfulGetAllUserWarranty(self,warranty);
		}
	});
}

var _successfulGetAllUserWarranty = function(self,doc){
	logger.emit("log","_successfulGetAllUserWarranty");
	self.emit("successfulGetAllUserWarranty", {"success":{"message":"Getting Warranty details Successfully","Warranty":doc}});
}