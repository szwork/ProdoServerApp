 var api = require("../api/api.js");
var auth=require('../common/js/security');
// var noCache = require('connect-nocache')();
// product - REST apis
exports.init = function (app) {
  //Warranty CRUD
	app.post("/api/warranty",auth,api.warrantyapi.addUserWarranty);//add new product
	app.post("/api/warranty/:userid/:prodle",auth,api.warrantyapi.updateUserWarranty);//update user warranty	
  
 //delete warranty
 // app.delete("/api/image/product/:orgid/:prodle",auth,api.productapi.deleteProductImage);
 
 
}
