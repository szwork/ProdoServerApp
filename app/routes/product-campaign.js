var api = require("../api/api.js");
var auth=require('../common/js/security');

exports.init = function (app) {
	// Product Campain CRUD
	app.post("/api/productcampaign/:orgid",auth,api.productcampaignapi.addProductCampaign);//add new product campain
	app.put("/api/productcampaign/:orgid/:campaign_id",auth,api.productcampaignapi.updateProductCampaign);//update product campain
	app.get("/api/productcampaign/:orgid",auth,api.productcampaignapi.getAllProductCampaign);//get all product campain data
  	app.get("/api/productcampaign/:orgid/:campaign_id",auth,api.productcampaignapi.getProductCampaign);//get single product campain data
}
