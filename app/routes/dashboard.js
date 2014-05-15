
 var api = require("../api/api.js");
var auth=require('../common/js/security');
// var noCache = require('connect-nocache')();
// product - REST apis
exports.init = function (app) {
  //dashboard charts CRUD
 
  app.get("/api/dashboard/icons",auth,api.managedashboardapi.getDashboardIcons);//get dashboard icons
  app.post("/api/dashboard/addquery",auth,api.managedashboardapi.addQuery);//Add Query for Dashboard
}