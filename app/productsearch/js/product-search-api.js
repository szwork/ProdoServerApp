// Importing 
var ProductModel = require("../../product/js/product-model");
var logger=require("../../common/js/logger");

exports.searchProduct = function(req,res){
	var productsearchdata=req.body.productsearchdata;
	console.log(JSON.stringify(productsearchdata));
	
	// var query = {$or : [{name:productsearchdata.name},{orgid:productsearchdata.orgid},{model_no:productsearchdata.model_no}]}
	var query = {$or : [{name:{$regex : productsearchdata.name}},{orgid:productsearchdata.orgid}]}

	//console.log(query);
	ProductModel.find(query,{name:1,prodle:1,orgid:1,_id:0}).exec(function(err,doc){
		if(err){
			self.emit("failedToSearchProduct",{"error":{"code":"ED001","message":"Error in db to search product"}});
		}else{
			res.send(doc);
		}
		// console.log("Product searching..." + doc);
	});
}