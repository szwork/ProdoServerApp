 var api = require("../api/api.js");
var auth=require('../common/js/security');

// product - REST apis
exports.init = function (app) {
  //Marketing CRUD
	
  	app.get("/api/marketing",api.marketingapi.getAllMarketingData);//get all marketing data
	
}