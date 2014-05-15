/*
* Overview: Dashboard Chart Access Model
* Dated: 18-04-2014
* Author: Dinesh Sawant
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description
* ----------------------------------------------------------------------
* 15-05-2014 | xyx | Add a new property
*/

var mongoose = require('../../common/js/db');
var ObjectId = mongoose.Schema.ObjectId;
var commonapi=require('../../common/js/common-api');
var shortId = require('shortid');
var logger = require("../../common/js/logger");

var DashboardChartAccessSchema = mongoose.Schema({
  code:{type:String},
  chartids:[{type:String}],
  status:{type:String,default:"active"}//active,deactive
});

//call when you save.
// DashboardChartAccessSchema.pre('save', function(next) {
//   console.log("calling to dashboard chart access save pre");
//   var dashboardchart = this;
//   logger.emit("log","dashboardchart in pre "+dashboardchart);
//   logger.emit("log","shortid : "+dashboardchart.chartname);
//   next();
// });

DashboardChartAccessSchema.set('redisCache', true);
DashboardChartAccessSchema.set('expires', 90);

//Seed a DashboardChartAccess
DashboardChartAccessSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
  return this.collection.findAndModify(query, sort, doc, options, callback);
};

var DashboardChart = mongoose.model('dashboardaccess', DashboardChartAccessSchema);
module.exports = DashboardChart;