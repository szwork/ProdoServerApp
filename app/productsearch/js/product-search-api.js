// Importing 
var ProductModel = require("../../product/js/product-model");
var logger=require("../../common/js/logger");
var reds = require('../lib/reds');
var search = reds.createSearch('products');
// var strs = require("../all-product_api/strs");


exports.searchProduct = function(req,res){
	
	var productsearchdata = req.body.productserachdata;
	console.log(JSON.stringify(productsearchdata));
	
	
	
			search.query(query = productsearchdata.name).end(function(err, ids){
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