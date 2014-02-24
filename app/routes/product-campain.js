var api = require("../api/api.js");
var auth=require('../common/js/security');

exports.init = function (app) {
	// Product Campain CRUD
	app.post("/api/productcampain/:orgid",auth,api.productcampainapi.addProductCampain);//add new product campain
	app.get("/api/productcampain/:orgid",auth,api.productcampainapi.getAllProductCampain);//get all product campain data
  	app.get("/api/productcampain/:orgid/:campain_id",auth,api.productcampainapi.getProductCampain);//get single product campain data
}
