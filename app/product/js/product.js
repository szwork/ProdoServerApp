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


Product.prototype.addProduct=function(orgid,sessionprodle){
	var self=this;
	var productdata=this.product;
	_validateProductData(self,productdata,orgid,sessionprodle);
}

	var _validateProductData = function(self,productdata,orgid,sessionprodle) {
		//validate the org data
		
		  // if(productdata.name==undefined){
		  // 	self.emit("failedOrgAdd",{"error":{"message":"Please type organization name"}});
		  // } else if(productdata.orgtype==undefined){
		  //   self.emit("failedOrgAdd",{"error":{"message":"please select organization type"}});
		  // }else if(productdata.location==undefined){
		  // 	self.emit("failedOrgAdd",{"error":{"message":"please give a location details"}});
		  // }else if(productdata.terms=e=false){
		  // 	self.emit("failedOrgAdd",{"error":{"message":"please agree the terms and condition"}});
		  // }else{
		  //   	logger.emit("log","_validated");
				// 	//this.emit("validated", productdata);
				// 	////////////////////////////////////////////////////////////
				// 	_hasAlreadyProduct(self,productdata,sessionprodle);
				// 	///////////////////////////////////////////////////////////
				
		  // }
		  productdata.orgid=orgid;
		  var product=new productModel(productdata);
		  product.save(function(err,product_data){
		  	logger.emit("error",err);
		  	self.emit("successfulProductAdd",{"success":{"message":"Product added sucessfully"}})
		  })
   
	};
Product.prototype.commentToProduct=function(prodle,commentdata){
	var self=this;
	console.log("commentdata"+commentdata);
	commentdata.commentid="prc"+shortId.generate();
	commentdata.status="active";
	commentdata.datecreated=new Date();  
	productModel.update({prodle:prodle},{$push:{product_comments:commentdata}},function(err,commentstatus){
		if(err){

		}else{
			console.log("commentstatus"+commentstatus);
			self.emit("successfulCommentToProduct",{"success":{"message":"Gave comment to product sucessfully"}})
		}
	})
}
Product.prototype.getProduct = function(prodle) {
	var self=this;
	_getProduct(self,prodle);
};
var _getProduct=function(self,prodle){
	productModel.findOne({prodle:prodle},function(err,product){
		if(err){
			self.emit("failedGetProduct",{"error":{"code":"ED001","message":"Error in db to find Product"}});
		}else if(!product){
			self.emit("failedGetProduct",{"error":{"code":"AU005","message":"Provided prodle is wrong"}});
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
			self.emit("failedGetAllProduct",{"error":{"code":"AU003","message":"No product exists"}});
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