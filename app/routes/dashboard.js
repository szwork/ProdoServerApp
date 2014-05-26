
 var api = require("../api/api.js");
var auth=require('../common/js/security');
// var noCache = require('connect-nocache')();
// product - REST apis
exports.init = function (app) {
  //dashboard charts CRUD
 
  app.get("/api/dashboard/icons",auth,api.managedashboardapi.getDashboardIcons);//get dashboard icons
  app.get("/api/dashboard/chartdata",auth,api.managedashboardapi.getDashboardChartsData);//get dashboard chart data
  app.post("/api/dashboard/addquery",auth,api.managedashboardapi.addQuery);//Add Query for Dashboard
  app.get("/api/dashboard/queries",auth,api.managedashboardapi.getAllDashboardQuery);//get dashboard querys

  app.post("/api/dashboard/RBONDS_Mapping",auth,api.managedashboardapi.addRBONDS_Mapping);
  app.put("/api/dashboard/RBONDS_Mapping/:code",auth,api.managedashboardapi.updateRBONDS_Mapping);
  app.get("/api/dashboard/RBONDS_Mapping",auth,api.managedashboardapi.getRBONDS_Mapping);

  app.get("/api/chart/:prodle/:queryid",auth,api.managedashboardapi.getAnalyticsDataForProduct);//get analytics data for product
}