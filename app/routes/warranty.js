 var api = require("../api/api.js");
var auth=require('../common/js/security');
// var noCache = require('connect-nocache')();
// product - REST apis
exports.init = function (app) {
  //Warranty CRUD
	app.post("/api/warranty/:userid",auth,api.warrantyapi.addUserWarranty);//add new product warranty
	app.put("/api/warranty/:userid/:warranty_id",auth,api.warrantyapi.updateUserWarranty);//update user warranty	
  	app.get("/api/warranty/:userid/:warranty_id",auth,api.warrantyapi.getUserWarranty);//get user warranty
  	app.get("/api/warranty/:userid",auth,api.warrantyapi.getAllUserWarranty);//get all user warranty
	app.delete("/api/warranty/:userid/:warranty_id",auth,api.warrantyapi.deleteUserWarranty);//delete warranty
}
