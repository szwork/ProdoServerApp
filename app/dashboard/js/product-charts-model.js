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

var ProductChartsSchema = mongoose.Schema({
  prodle:{type:String,unique:true},
  charts:[{chartname:{type:String},description:{type:String},bucket:{type:String},key:{type:String},image:{type:String},imageid:{type:String}}]
});

//generate the marketing_id when you save.
// ProductChartsSchema.pre('save', function(next) {
//   console.log("calling to productcharts save pre");
//   var productcharts = this;
//   logger.emit("log","productcharts in pre "+productcharts);
//   productcharts.chartname = productcharts.chartname.toLowerCase();
//   logger.emit("log","shortid : "+productcharts.chartname);
//   next();
// });

ProductChartsSchema.set('redisCache', true);
ProductChartsSchema.set('expires', 90);
//Seed a Dashboard
ProductChartsSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
  return this.collection.findAndModify(query, sort, doc, options, callback);
};
var ProductCharts = mongoose.model('productcharts', ProductChartsSchema);

module.exports = ProductCharts;