
 var api = require("../api/api.js");
var auth=require('../common/js/security');
// var noCache = require('connect-nocache')();
// product - REST apis
exports.init = function (app) {
  //product charts CRUD
 
  app.get("/api/dashboard/icons",auth,api.productchartsapi.getDashboardIcons);//get dashboard icons
  
}