 var api = require("../api/api.js");
var auth=require('../common/js/security');
// var noCache = require('connect-nocache')();
// product - REST apis
exports.init = function (app) {
  //product CRUD
  app.post('/api/product/:orgid',auth,api.productapi.addProduct);//add new product
 // // app.post("/api/product/addcomment/:prodle",auth,api.productapi.commentToProduct);
  app.get("/api/product",auth,api.productapi.getAllProduct);//get all product data
  app.get("/api/product/:prodle",auth,api.productapi.getProduct);//get single product data
   //app.put("/api/product/:prodle",auth,api.productapi.updateProduct);//update the product data
  // app.delete("/api/product/:prodle",auth,api.productapi.deleteProduct);//delete product
}
