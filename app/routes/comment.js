var api = require("../api/api.js");
var auth=require('../common/js/security');

exports.init = function (app) {
 
  // app.post('/api/product/:orgid',auth,api.productapi.addProduct);//add new product
 
  // app.get("/api/product",auth,api.productapi.getAllProduct);//get all product data
  // app.get("/api/product/:prodle",auth,api.productapi.getProduct);//get single product data
   //app.put("/api/product/:prodle",auth,api.productapi.updateProduct);//update the product data
  app.delete("/api/comment/:commentid",auth,api.commentapi.deleteComment);//delete product
  app.get("/api/nextcomments/:commentid",auth,api.commentapi.loadMoreComment);
}
