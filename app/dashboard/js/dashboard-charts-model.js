/*
* Overview: Product Marketing Model
* Dated: 18-04-2014
* Author: Dinesh Sawant
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description
* ----------------------------------------------------------------------
* 04-02-2014 | xyx | Add a new property
*/

var mongoose = require('../../common/js/db');
var ObjectId = mongoose.Schema.ObjectId;
var commonapi=require('../../common/js/common-api');
var shortId = require('shortid');
var logger = require("../../common/js/logger");

var DashboardChartsSchema = mongoose.Schema({
  // marketing_id:{type:String},
  chartname:{type:String},
  description:{type:String},
  category:{type:String},
  type:{type:String},
  charts:{bucket:{type:String},key:{type:String},image:{type:String},imageid:{type:String}},
  // status:{type:String,default:"active"}
});

//generate the marketing_id when you save.
DashboardChartsSchema.pre('save', function(next) {
  console.log("calling to dashboardchart save pre");
  var dashboardchart = this;
  logger.emit("log","dashboardchart in pre "+dashboardchart);
  dashboardchart.chartname = dashboardchart.chartname.toLowerCase();
  logger.emit("log","shortid : "+dashboardchart.chartname);
  next();
});

DashboardChartsSchema.set('redisCache', true);
DashboardChartsSchema.set('expires', 90);
//Seed a Dashboard
DashboardChartsSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
  return this.collection.findAndModify(query, sort, doc, options, callback);
};
var DashboardChart = mongoose.model('dashboardcharts', DashboardChartsSchema);

module.exports = DashboardChart;