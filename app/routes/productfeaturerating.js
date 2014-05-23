
 var api = require("../api/api.js");
var auth=require('../common/js/security');
// var noCache = require('connect-nocache')();
// product - REST apis
exports.init = function (app) {
  //dashboard charts CRUD
 
  app.post("/api/productfeaturating/:prodle",auth,api.productfeatureratingapi.rateProductFeature);
  app.get('/api/myproductfeaturerating/:prodle',auth,api.productfeatureratingapi.getMyProductFeatureRating);
  app.get('/api/overallproductfeaturerating/:prodle',auth,api.productfeatureratingapi.getOverallProductFeatureRating)
}