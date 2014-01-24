var api = require("../api/api.js");
var auth=require('../common/js/security');

exports.init = function(app){
	// Product CRUD
	app.post("/api/searchproduct",auth,api.productsearchapi.searchProduct);//search for products
}