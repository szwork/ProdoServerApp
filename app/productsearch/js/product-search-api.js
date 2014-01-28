// Importing 
var ProductModel = require("../../product/js/product-model");
var logger=require("../../common/js/logger");
var reds = require('../lib/reds');
var search = reds.createSearch('products');
// var strs = require("../all-product_api/strs");


exports.searchProduct = function(req,res){
	
	var productsearchdata = req.body.productserachdata;
	console.log(JSON.stringify(productsearchdata));
	
	
	// var query = {$or : [{name:productsearchdata.name},{orgid:productsearchdata.orgid},{model_no:productsearchdata.model_no}]}
	// var query = {$or : [{name:{$regex : productsearchdata.name}},{orgid:productsearchdata.orgid}]}
	// var query = {}
	// console.log(query);
	// ProductModel.find(query,{name:1,prodle:1,orgid:1,_id:0}).exec(function(err,doc){
	// 	if(err){
	// 		self.emit("failedToSearchProduct",{"error":{"code":"ED001","message":"Error in db to search product"}});
	// 	}else{
	// 		res.send(doc);
	// 	}
	// 	 console.log("Product searching..." + doc);
	// });
	/* SEARCH */
	//var strs = [];
			search.query(query = 'driv').end(function(err, ids){
			  if (err) throw err;
			  console.log("ids " + ids);
			  var result = ids.map(function(i){ return strs[i]; });
			  // console.log(result);
			  console.log('  Search results for "%s"', query);
			  result.forEach(function(str){
			    console.log('    - %s', str);
			    res.send(str);
			  });
			});
}