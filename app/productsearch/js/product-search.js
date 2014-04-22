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
var OrganizationModel = require("../../org/js/org-model");
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
		 			product_or_name_array.push(new RegExp('^'+prod_name_arr[i].substr(0,prod_name_arr[i].length), "i"));
		 			// product_or_name_array.push(new RegExp(prod_name_arr[i].substr(0,prod_name_arr[i].length), "i"));
		 			searchCriteria.push({name: new RegExp(prod_name_arr[i], "i")});
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
		 			searchCriteria.push({"category": new RegExp(category_array[i], "i")});
		 		}
		 		query["category"]={$in:category_or_array};
	  		}
	  	}

	  	if(productsearchdata.Organization_Name!=undefined){
	  		if(productsearchdata.Organization_Name==""){
	  			_searchProduct(self,productsearchdata,searchCriteria,query);
	  		}else{
	  			/*********GETTING ORG_ID BY ORG_NAME*********/
	  			var orgid_arr = [];
				var org_array = [];
				if(S(productsearchdata.Organization_Name).contains(",")){
					org_array=productsearchdata.Organization_Name.split(",");
				}else if(S(productsearchdata.Organization_Name).contains(" ")){
					org_array=productsearchdata.Organization_Name.split(" ");
				}else{
					org_array.push(productsearchdata.Organization_Name);
				}

				var org_or_array=[];
				for(var i=0;i<org_array.length;i++){
					org_or_array.push(new RegExp('^'+org_array[i], "i"));
					org_or_array.push(new RegExp('^'+org_array[i].substr(0,org_array[i].length), "i"));
				}
				var Q = {status:{$in:["active","init"]},name:{$in:org_or_array}};
				// console.log("QQQQQ " + JSON.stringify(Q));
				OrganizationModel.find(Q,{name:1,orgid:1,_id:0}).limit(5).exec(function(err,doc){
					if(err){
						self.emit("failedToSearchProduct",{"error":{"code":"ED001","message":"Error in db to get orgid by orgname"}});
					}else if(doc.length==0){
						self.emit("successfulProductSearch",{"success":{"message":"No organisation found for specified criteria"}});
					}else{
						for(var i=0;i<doc.length;i++){
							orgid_arr.push(doc[i].orgid);
						}
						if(productsearchdata.Product_Name=="" && productsearchdata.Model_Number=="" && productsearchdata.Feature=="" && productsearchdata.Category==""){
							// _successfulOrgSearch(self,doc);
							_getProdleOfOrganisation(self,doc);
						}else{
							query.orgid={$in:orgid_arr};
							_searchProduct(self,productsearchdata,searchCriteria,query);
						}				 		
				  	}
				})
			}
	  	}
	  	// _searchProduct(self,productsearchdata,searchCriteria,query);
}


var _searchProduct = function(self,productsearchdata,searchCriteria,query){
    if(searchCriteria.length!=0){
    	query.$or=searchCriteria;
    }
    
	console.log(query);
	ProductModel.find(query,{name:1,prodle:1,orgid:1,description:1,_id:0}).limit(50).exec(function(err,doc){
		if(err){
			self.emit("failedToSearchProduct",{"error":{"code":"ED001","message":"Error in db to search product"+err}});
		}else if(doc.length==0){
			self.emit("successfulProductSearch",{"success":{"message":"No product found for specified criteria"}});
		}else{
	  		_successfulProductSearch(self,doc);
	  	}
	})
}

var _successfulProductSearch = function(self,doc){
	logger.emit("log","_successfulProductSearch");
	self.emit("successfulProductSearch", {"success":{"message":"Search Result - "+doc.length+" Products Found","doc":doc}});
}

var _getProdleOfOrganisation = function(self,doc){
	var initialvalue=0;
	var doc1=[];
	_getOrgProdle(self,doc,initialvalue,doc1);
}

var _getOrgProdle = function(self,doc,i,doc1){
	// logger.emit("log",doc);
	// logger.emit("log","doc length"+doc.length+"i:"+i);

    if(doc.length>i){
		ProductModel.find({status:{$ne:"deactive"},orgid:doc[i].orgid},{prodle:1,name:1,description:1,_id:0}).exec(function(err,productdata){
			if(err){
				self.emit("failedToSearchProduct",{"error":{"code":"ED001","message":"Error in db to get org products "+err}});
			}else if(productdata){
				console.log("ProductData1 " + productdata.length);
				if(productdata.length==0){
					var products = [{name:"",prodle:"",description:""}];
					// products.push();
					doc1.push({name:doc[i].name,orgid:doc[i].orgid,info:"No products exist for this organisation",products:products});	
				}else{
					doc1.push({name:doc[i].name,orgid:doc[i].orgid,products:productdata});
				}
				// console.log("test "+JSON.stringify(doc1));
				_getOrgProdle(self,doc,++i,doc1);
			}else{
				console.log("ProductData2 " +productdata);
		  		//doc1.push({name:doc[i].name,orgid:doc[i].orgid})
		  		_getOrgProdle(self,doc,++i,doc1);
		  	}
		})
	}else{
		_successfulOrgSearch(self,doc1);
	}
}

var _successfulOrgSearch = function(self,doc){
	logger.emit("log","_successfulProductSearch");
	self.emit("successfulProductSearch", {"success":{"message":"Search Result - "+doc.length+" Organisations Found","doc":doc}});
}

ProductSearch.prototype.getOrgProducts = function(orgdata){
	console.log("OrgId : " + orgdata.orgid + " OrgName " + orgdata.orgname);
	var self=this;
	// var productsearchdata=this.product;
	_validateOrgData(self,orgdata);
	
}

var _validateOrgData = function(self,orgdata){
	// console.log("_getAllOrgProducts " + JSON.stringify(orgdata));
	if(orgdata==undefined){
		self.emit("failedGetOrgProduct",{"error":{"code":"AV001","message":"Please provide data to get org products"}});
	}else if(orgdata.orgname==undefined){
		self.emit("failedGetOrgProduct",{"error":{"code":"AV001","message":"Please pass orgname"}});
	} else if(orgdata.orgid==undefined){
	  	self.emit("failedGetOrgProduct",{"error":{"code":"AV001","message":"please pass orgid"}});
	}else{
	  	_getAllOrgProducts(self,orgdata);
	}
}

var _getAllOrgProducts = function(self,orgdata){
	
	ProductModel.find({orgid:orgdata.orgid},{name:1,prodle:1,orgid:1,_id:0}).limit(50).exec(function(err,doc){
		if(err){
			self.emit("failedGetOrgProduct",{"error":{"code":"ED001","message":"Error in db to get org products "+err}});
		}else if(doc.length==0){
			self.emit("successfulGetOrgProduct",{"success":{"message":"No products found for this organisation"}});
		}else{
	  		_successfulAllOrgProducts(self,doc,orgdata);
	  	}
	})
}

var _successfulAllOrgProducts = function(self,doc,orgdata){
	logger.emit("log","_successfulGetOrgProduct");
	self.emit("successfulGetOrgProduct",{"success":{"message":"Following products found for "+orgdata.orgname,"doc":doc}});
}