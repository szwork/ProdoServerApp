/*
* Overview: Product 
* Dated:
* Author: Ramesh Kunhiraman
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
var productModel = require("./product-model");
var commonapi = require('../../common/js/common-api');
var CONFIG = require('config').Prodonus;
var shortId = require('shortid');


var Product = function(productdata) {
	this.product = productdata;
};

var regxemail = /\S+@\S+\.\S+/; 
Product.prototype = new events.EventEmitter;
module.exports = Product;


Product.prototype.addProduct=function(orgid,sessionuserid){
	var self=this;
	var productdata=this.product;
	////////////////////////////////////////////////////////////
	_validateProductData(self,productdata,orgid,sessionuserid);
	//////////////////////////////////////////////////////////
}

	var _validateProductData = function(self,productdata,orgid,sessionuserid) {
		//validate the org data
		 if(productdata==undefined){
		 	self.emit("failedProductAdd",{"error":{"code":"AV001","message":"Please provide data to add product"}});
		 }else if(productdata.name==undefined){
	   	self.emit("failedProductAdd",{"error":{"code":"AV001","message":"Please pass prdouct name"}});
	   } else if(productdata.description==undefined){
	    self.emit("failedProductAdd",{"error":{"code":"AV001","message":"please pass product description "}});
	   }else{

	   	/////////////////////////////
	   	_addProduct(self,productdata,orgid);
	   	///////////////////////
	   }
	};
	var _addProduct=function(self,productdata,orgid){
		productdata.orgid=orgid;
	  var product=new productModel(productdata);
	  product.save(function(err,product_data){
	  	if(err){
	  		self.emit("failedProductAdd",{"error":{"code":"ED001","message":"Error in db to add new product "}});	
	  	}else{
	  		///////////////////////
	  		_successfulProductAdd(self);
	  		//////////////////////////
	  	  
	  	}
	  })

	}
	var _successfulProductAdd=function(self){
		logger.log("log","_successfulProductAdd");
		self.emit("successfulProductAdd",{"success":{"message":"Product added sucessfully"}})
	}
Product.prototype.commentToProduct=function(sessionuserid,prodle,commentdata){
	var self=this;
      ////////////////////////////////////
	_validateCommentData(self,sessionuserid,prodle,commentdata);
	//////////////////////////////////////
	
}
var _validateCommentData=function(self,sessionuserid,prodle,commentdata) {
	if(commentdata==undefined){
	   self.emit("failedCommentToProduct",{"error":{"code":"AV001","message":"Please provide commentdata"}});	
	}else if(commentdata.user==undefined){
		self.emit("failedCommentToProduct",{"error":{"code":"AV001","message":"Please provide user to commentdata"}});		
	}else if(commentdata.user.userid==undefined){
		self.emit("failedCommentToProduct",{"error":{"code":"AV001","message":"Please provide userid with user object"}});		
	} else if(commentdata.commenttext==undefined){
		self.emit("failedCommentToProduct",{"error":{"code":"AV001","message":"Please pass commenttext"}});			
	}else if(commentdata.commenttext.trim().length==0){
		self.emit("failedCommentToProduct",{"error":{"code":"AV001","message":"Please enter commenttext"}});			
	}else{
		///////////////////////////////////////////////////////
		_isSessionUserToComment(self,sessionuserid,prodle,commentdata);
		///////////////////////////////////////////////////////
	}
}
var _isSessionUserToComment=function(self,sessionuserid,prodle,commentdata){
	if(sessionuserid!=commentdata.user.userid){
		self.emit("failedCommentToProduct",{"error":{"code":"EA001","message":"Provided userid is not match with sessionuserid"}})
	}else{
		///////////////////////////////////////////
		__commentToProduct(self,prodle,commentdata);
		///////////////////////////////////////////
	}
}
var __commentToProduct=function(self,prodle,commentdata){
	commentdata.commentid="prc"+shortId.generate();
	commentdata.status="active";
	commentdata.datecreated=new Date();  
	productModel.update({prodle:prodle},{$push:{product_comments:commentdata}},function(err,commentstatus){
		if(err){
			self.emit("failedCommentToProduct",{"error":{"code":"ED001","message":"Error in db to give comment to product"}});
		}else if(commentstatus!=1){
			self.emit("failedCommentToProduct",{"error":{"code":"AP001","message":"prodct id is wrong"}});
		}else{

			///////////////////////////////////
			_successfulcommentToProduct(self);
			/////////////////////////////////
			
		}
	})
}
var _successfulcommentToProduct=function(self){
	logger.emit("log","_successfulcommentToProduct");
	self.emit("successfulCommentToProduct",{"success":{"message":"Gave comment to product sucessfully"}})
}
Product.prototype.getProduct = function(prodle) {
	var self=this;
	/////////////////////////
	_getProduct(self,prodle);
	////////////////////////
};
var _getProduct=function(self,prodle){
	productModel.findOne({prodle:prodle},function(err,product){
		if(err){
			self.emit("failedGetProduct",{"error":{"code":"ED001","message":"Error in db to find Product"}});
		}else if(!product){
			self.emit("failedGetProduct",{"error":{"code":"AP001","message":"Provided prodle is wrong"}});
		}else{
			 ////////////////////////////////
			_successfulGetProduct(self,product);
			//////////////////////////////////
		}
	})
}
var _successfulGetProduct=function(self,product){
	logger.emit("log","_successfulProductGet");
	self.emit("successfulGetProduct", {"success":{"message":"Getting Product details Successfully","product":product}});
}
Product.prototype.getAllProduct = function() {
	var self=this;
	//////////////////
	_getAllProduct(self);
	///////////////////
};
var _getAllProduct=function(self){
	productModel.find({},function(err,product){
		if(err){
			self.emit("failedGetAllProduct",{"error":{"code":"ED001","message":"Error in db to find all product"}});
		}else if(product.length==0){
			self.emit("failedGetAllProduct",{"error":{"code":"AP002","message":"No product exists"}});
		}else{
			////////////////////////////////
			_successfulGetAllProduct(self,product);
			//////////////////////////////////
		}
	})
};

var _successfulGetAllProduct=function(self,product){
	logger.emit("log","successfulGetAllProduct");
	self.emit("successfulGetAllProduct", {"success":{"message":"Getting All Product details Successfully","product":product}});
}