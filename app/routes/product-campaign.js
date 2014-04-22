var api = require("../api/api.js");
var auth=require('../common/js/security');

exports.init = function (app) {
	// Product Campain CRUD
	app.post("/api/productcampaign/:orgid/:prodle",auth,api.productcampaignapi.addProductCampaign);//add new product campain
	app.put("/api/productcampaign/:orgid/:campaign_id",auth,api.productcampaignapi.updateProductCampaign);//update product campain
	app.get("/api/productcampaign/:orgid",auth,api.productcampaignapi.getAllOrgCampaign);//get all org product campain
	app.get("/api/productcampaign/:prodle",auth,api.productcampaignapi.getAllProductCampaign);//get all org product campain
  	app.get("/api/productcampaign/:orgid/:campaign_id",auth,api.productcampaignapi.getProductCampaign);//get single product campain data
  	app.delete("/api/productcampaign/:campaign_id",auth,api.productcampaignapi.removeProductCampaign);//delete product campaign
  	app.delete("/api/productcampaign/image/:campaign_id",auth,api.productcampaignapi.deleteCampaignImage);//delet campaign images
}
