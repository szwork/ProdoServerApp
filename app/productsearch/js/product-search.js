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
	var query={};
		if(productsearchdata.Product_Name!=undefined){
			if(productsearchdata.Product_Name==""){				
		 	}else{
		 		query.name={$regex:"^"+productsearchdata.Product_Name.substring(0,1), $options: 'i'};		 	
		 		searchCriteria.push({name:{$regex:productsearchdata.Product_Name,$options: 'i'}});
		 	}
		}
		if(productsearchdata.Model_Number!=undefined){
			if(productsearchdata.Model_Number==""){
			}else{
				query.model_no={$regex:"^"+productsearchdata.Model_Number.substring(0,1), $options: 'i'};		 	
		 		searchCriteria.push({model_no:{$regex:productsearchdata.Model_Number,$options: 'i'}});	
			}
			
	  	}
	  	if(productsearchdata.Feature!=undefined){
	  		if(productsearchdata.Feature==""){
	  		}else{
	  			query.features={$regex:"^"+productsearchdata.Feature.substring(0,1), $options: 'i'};		 	
		 		searchCriteria.push({features:{$regex:productsearchdata.Feature,$options: 'i'}});	
	  		}	  		
	  	}
	  	if(productsearchdata.Category!=undefined){
	  		if(productsearchdata.Category==""){
	  		}else{
	  			query.category={$regex:"^"+productsearchdata.Category.substring(0,1), $options: 'i'};		 	
		 		searchCriteria.push({category:{$regex:productsearchdata.Category,$options: 'i'}});	
	  		}
	  		
	  	}
		_searchProduct(self,productsearchdata,searchCriteria,query);   
	   	
};
var _searchProduct = function(self,productsearchdata,searchCriteria,query){
	// var firstChar = productsearchdata.Product_Name.substring(0,1);
	// var firstTwoChar = productsearchdata.Product_Name.substring(0,2);
	// var firstThreeChar = productsearchdata.Product_Name.substring(0,3);

	// var firstCharM = productsearchdata.Model_Number.substring(0,1);
	// var firstTwoCharM = productsearchdata.Model_Number.substring(0,2);
	// var firstThreeCharM = productsearchdata.Model_Number.substring(0,3);

	// var firstCharF = productsearchdata.Feature.substring(0,1);
	// var firstTwoCharF = productsearchdata.Feature.substring(0,2);
	// var firstThreeCharF = productsearchdata.Feature.substring(0,3);
     // query.$or=searchCriteria;
	var query = {$or : searchCriteria
	// 					// {name:
	// 					// 	{$regex : productsearchdata.Product_Name, $options: 'i'}},
	// 					// 	{name:{$regex : firstThreeChar, $options: 'i'}},
	// 					// 	{name:{$regex : firstTwoChar, $options: 'i'}},
	// 					// 	{name:{$regex : firstChar, $options: 'i'}},

	// 					// {model_no:
	// 					// 	{$regex : productsearchdata.Model_Number, $options: 'i'}},
	// 					// 	{model_no:{$regex : firstCharM, $options: 'i'}},
	// 					// 	{model_no:{$regex : firstTwoCharM, $options: 'i'}},
	// 					// 	{model_no:{$regex : firstThreeCharM, $options: 'i'}},

	// 					// {features:
	// 					// 	{featurename:{$regex:productsearchdata.Feature, $options: 'i'}}},
	// 					// 	{features:{featurename:{$regex :firstCharF, $options: 'i'}}},
	// 					// 	{features:{featurename:{$regex :firstTwoCharF, $options: 'i'}}},
	// 					// 	{features:{featurename:{$regex :firstThreeCharF, $options: 'i'}}},

	// 					// {category:{prodle:
	// 					// 	{$regex : productsearchdata.Category, $options: 'i'}}}
						
				}
		console.log(query);	
	ProductModel.find(query,{name:1,prodle:1,orgid:1,_id:0}).exec(function(err,doc){
		if(err){
			self.emit("failedToSearchProduct",{"error":{"code":"ED001","message":"Error in db to search product"}});
		// }else if(doc.length==0){
		// 	self.emit("failedToSearchProduct",{"error":{"code":"ED001","message":"Product does not exist with given name"}});
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
	self.emit("successfulProductSearch", {"success":{"message":"Product details","doc":doc}});
}