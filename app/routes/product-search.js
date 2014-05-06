var api = require("../api/api.js");
var auth=require('../common/js/security');

exports.init = function(app){
	// Product CRUD
	// app.post("/api/allproduct",auth,api.allproductsapi.allProduct);//getting all products
	app.post("/api/allproduct",auth,api.productsearchapi.allProduct);//getting all products
	app.post("/api/searchproduct",auth,api.productsearchapi.searchProduct);//search for products
	// app.get("/api/searchorg/:orgid/:orgname",auth,api.productsearchapi.getOrgProducts);//search all products for organisation
	app.post("/api/orgproducts",auth,api.productsearchapi.getOrgProducts);//search all products for organisation
}