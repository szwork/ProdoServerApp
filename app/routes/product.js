 var api = require("../api/api.js");
var auth=require('../common/js/security');
// var noCache = require('connect-nocache')();
// product - REST apis
exports.init = function (app) {
  //product CRUD
  app.post("/api/product/:orgid",auth,api.productapi.addProduct);//add new product
 
  app.get("/api/product/:orgid",auth,api.productapi.getAllProduct);//get all product data
  app.get("/api/productname",auth,api.productapi.getAllProductNames);//get all product names
  app.get("/api/product/:orgid/:prodle",auth,api.productapi.getProduct);//get single product data
  app.put("/api/product/:orgid/:prodle",auth,api.productapi.updateProduct);//update the product data
  app.get("/api/product",api.productapi.getLatestFiveProducts);//get latest added five products data
  app.delete("/api/product/:orgid/:prodle",auth,api.productapi.deleteProduct);//delete product
 //delete product image
 app.delete("/api/image/product/:orgid/:prodle",auth,api.productapi.deleteProductImage);
 app.post("/api/productfeature/:orgid/:prodle",auth,api.productapi.addProductFeatures);
 app.put("/api/productfeature/:orgid/:prodle/:productfeatureid",auth,api.productapi.updateProductFeature);
 app.delete("/api/productfeature/:orgid/:prodle/:productfeatureid",auth,api.productapi.deleteProductFeature);
 app.get("/api/productfeature/:orgid/:prodle",auth,api.productapi.getProductFeature);
 app.get("/api/trendingproducts",auth,api.productapi.getProductTrending);
 app.get("/api/domaintrending",auth,api.productapi.getCategorySpecificTrending);//domain specifi trending
 app.get("/api/categorytags",auth,api.productapi.getAllCategoryTags);
 app.get('/api/latestproduct',api.productapi.getLatestAddedProduct);
}
