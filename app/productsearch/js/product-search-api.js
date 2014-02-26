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
    productsearch.removeAllListeners("failedToSearchProduct");
    productsearch.on("failedToSearchProduct",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      res.send(err);
    });
    productsearch.removeAllListeners("successfulProductSearch");
    productsearch.on("successfulProductSearch",function(doc){
      logger.emit("info", doc.success.message,sessionuserid);
      // console.log("L " + doc.success.doc.length);
      res.send(doc);
    });

	productsearch.searchProduct(productsearchdata);	
}

exports.getOrgProducts = function(req,res){
  var sessionuserid = req.user.userid;
  var orgdata = req.body;
  // var orgid = req.params.orgid;
  // var orgname = req.params.orgname;
  // var orgid = orgdata.orgid;
  // var orgname = orgdata.orgname;
  // console.log(orgid+" "+orgname);
  
  var productsearch = new ProductSearch();
  // logger.emit("log","\norgid : "+orgid+"\nsessionid : "+sessionuserid);
  productsearch.removeAllListeners("failedGetOrgProduct");
  productsearch.on("failedGetOrgProduct",function(err){
    logger.emit("error", err.error.message,sessionuserid);
    res.send(err);
  });
  productsearch.removeAllListeners("successfulGetOrgProduct");
  productsearch.on("successfulGetOrgProduct",function(doc){
    logger.emit("info", doc.success.message,sessionuserid);
    // console.log("L " + doc.success.doc.length);
    res.send(doc);
  });

  productsearch.getOrgProducts(orgdata); 
}
