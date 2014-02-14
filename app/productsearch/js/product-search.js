/*
* Overview: Product Search
* Dated:
* Author: 
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* 27-1-2014 | xyx | Add a new property
* 
*/

var ProductModel = require("../../product/js/product-model");
var events = require("events");
var util = require("util");
var events = require("events");
var logger = require("../../common/js/logger");
var commonapi = require('../../common/js/common-api');
var S = require("string");


var ProductSearch = function(productsearchdata) {
	this.product = productsearchdata;
};

ProductSearch.prototype = new events.EventEmitter;
module.exports = ProductSearch;

ProductSearch.prototype.searchProduct = function(productsearchdata){
	console.log("ProductSearch" + productsearchdata);
	var self=this;
	// var productsearchdata=this.product;
	_validateProductSearchData(self,productsearchdata);
}

var _validateProductSearchData = function(self,productsearchdata) {
	console.log("_validateProductSearchData");
	var searchCriteria = [];
	var query={status:{$in:["active","init"]}};

		if(productsearchdata.Product_Name!=undefined){
			if(productsearchdata.Product_Name==""){
		 	}else{
		 		var prod_name_arr = [];
		 		if(S(productsearchdata.Product_Name).contains(",")){
		 			prod_name_arr=productsearchdata.Product_Name.split(",");
		 		}else if(S(productsearchdata.Product_Name).contains(" ")){
		 			prod_name_arr=productsearchdata.Product_Name.split(" ");
		 		}else{
		 			prod_name_arr.push(productsearchdata.Product_Name);
		 		}
		 		// query.name=new RegExp('^'+productsearchdata.Product_Name, "i");
		 		// searchCriteria.push({name: new RegExp('^'+productsearchdata.Product_Name, "i")});
		 		
                var product_or_name_array=[];
		 		for(var i=0;i<prod_name_arr.length;i++){
		 			product_or_name_array.push(new RegExp('^'+prod_name_arr[i].substr(0,1), "i"));
		 			searchCriteria.push({name: new RegExp(prod_name_arr[i].substr(0,1), "i")});
		 		}
		 		query.name={$in:product_or_name_array};
		 	}
		}

		if(productsearchdata.Model_Number!=undefined){
			if(productsearchdata.Model_Number==""){
			}else{
				var model_no_array = [];
		 		if(S(productsearchdata.Model_Number).contains(",")){
		 			model_no_array=productsearchdata.Model_Number.split(",");
		 		}else if(S(productsearchdata.Model_Number).contains(" ")){
		 			model_no_array=productsearchdata.Model_Number.split(" ");
		 		}else{
		 			model_no_array.push(productsearchdata.Model_Number);
		 		}
				// query.model_no= new RegExp('^'+productsearchdata.Model_Number, "i");		 	
		 		// searchCriteria.push({model_no:new RegExp('^'+productsearchdata.Model_Number, "i")});	
		 		var model_no_or_array=[];
		 		for(var i=0;i<model_no_array.length;i++){
		 			model_no_or_array.push(new RegExp('^'+model_no_array[i], "i"));
		 			searchCriteria.push({model_no: model_no_array[i]});
		 		}
		 		query.model_no={$in:model_no_or_array};	
			}			
	  	}

	  	if(productsearchdata.Feature!=undefined){
	  		if(productsearchdata.Feature==""){
	  		}else{
	  			var feature_array = [];
		 		if(S(productsearchdata.Feature).contains(",")){
		 			feature_array=productsearchdata.Feature.split(",");
		 		}else if(S(productsearchdata.Feature).contains(" ")){
		 			feature_array=productsearchdata.Feature.split(" ");
		 		}else{
		 			feature_array.push(productsearchdata.Feature);
		 		}
	  			// query.features={featurename:new RegExp('^'+productsearchdata.Feature, "i")};		 	
		 		// searchCriteria.push({features:{featurename:new RegExp('^'+productsearchdata.Feature, "i")}});	
		 		var feature_or_array=[];
		 		for(var i=0;i<feature_array.length;i++){
		 			feature_or_array.push(new RegExp('^'+feature_array[i].substr(0,1), "i"));		 			
		 			searchCriteria.push({"features.featurename": new RegExp(feature_array[i], "i")});
		 		}
		 		query["features.featurename"]={$in:feature_or_array};
	  		}	  		
	  	}

	  	if(productsearchdata.Category!=undefined){
	  		if(productsearchdata.Category==""){
	  		}else{
	  			var category_array = [];
		 		if(S(productsearchdata.Category).contains(",")){
		 			category_array=productsearchdata.Category.split(",");
		 		}else if(S(productsearchdata.Category).contains(" ")){
		 			category_array=productsearchdata.Category.split(" ");
		 		}else{
		 			category_array.push(productsearchdata.Category);
		 		}
	  			// query.category=new RegExp('^'+productsearchdata.Category, "i");		 	
		 		// searchCriteria.push({category:{$regex:productsearchdata.Category,$options: 'i'}});	
		 		var category_or_array=[];
		 		for(var i=0;i<category_array.length;i++){
		 			category_or_array.push(new RegExp('^'+category_array[i].substr(0,1), "i"));		 			
		 			searchCriteria.push({"category.prodle": new RegExp(category_array[i], "i")});
		 		}
		 		query["category.prodle"]={$in:category_or_array};
	  		}	  		
	  	}

		_searchProduct(self,productsearchdata,searchCriteria,query);	   	
};

var _searchProduct = function(self,productsearchdata,searchCriteria,query){
    
    query.$or=searchCriteria;	
	console.log(query);
	ProductModel.find(query,{name:1,prodle:1,orgid:1,_id:0}).limit(50).exec(function(err,doc){
		if(err){
			self.emit("failedToSearchProduct",{"error":{"code":"ED001","message":"Error in db to search product"}});
		}else if(doc.length==0){
			self.emit("successfulProductSearch",{"success":{"message":"No product found for specified criteria"}});
		}else{
			// var productName = [];
			// for(var i=0;i<doc.length;i++){
			// 	productName.push(doc[i].name);
			// }
	  		_successfulProductSearch(self,doc);
	  	}
	})
}
var _successfulProductSearch = function(self,doc){
	logger.emit("log","_successfulProductSearch");
	self.emit("successfulProductSearch", {"success":{"message":"Search Result - "+doc.length+" Products Found","doc":doc}});
}