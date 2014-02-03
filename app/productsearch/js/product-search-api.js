// Importing
var ProductModel = require("../../product/js/product-model");
var ProductSearch = require("./product-search");
var logger=require("../../common/js/logger");
var reds = require('../lib/reds');
var search = reds.createSearch('products');


exports.searchProduct = function(req,res){
	
	var productsearchdata = req.body.productsearchdata;
	// console.log(JSON.stringify(productsearchdata));
	
	var productsearch = new ProductSearch();
	var sessionuserid=req.user.userid;

   // logger.emit("log","\norgid:"+orgid+"\nsessionid:"+sessionuserid);
    productsearch.removeAllListeners("failedProductSearch");
    productsearch.on("failedProductSearch",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      res.send(err);
    });
    productsearch.removeAllListeners("successfulProductSearch");
    productsearch.on("successfulProductSearch",function(doc){
      logger.emit("info", doc.success.message,sessionuserid);
      res.send(doc);
    });

	productsearch.searchProduct(productsearchdata);	
}

