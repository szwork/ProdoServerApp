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



var Product = function(productdata) {
	this.product = productdata;
};

var regxemail = /\S+@\S+\.\S+/; 
Product.prototype = new events.EventEmitter;
module.exports = Product;


Product.prototype.addProduct=function(orgid,sessionuserid){
	var self=this;
	var productdata=this.product;
	_validateProductData(self,productdata,orgid,sessionuserid);
}

	var _validateProductData = function(self,productdata,orgid,sessionuserid) {
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
				// 	_hasAlreadyProduct(self,productdata,sessionuserid);
				// 	///////////////////////////////////////////////////////////
				
		  // }
		  productdata.orgid=orgid;
		  var product=new productModel(productdata);
		  product.save(function(err,product_data){
		  	logger.emit("error",err);
		  	self.emit("successfulProductAdd",{"success":{"message":"Product added sucessfully"}})
		  })
   
	};