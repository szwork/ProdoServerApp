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

var manageDashboard = mongoose.Schema({
  queryid:{type:String,unique:true},
  queryname:{type:String},
  description:{type:String}
});

// generate queryid when you save.
manageDashboard.pre('save', function(next) {
  console.log("calling to manage dashboard save pre");
  var managedashboard = this;
  logger.emit("log","managedashboard in pre "+managedashboard);
  managedashboard.queryid = "Q"+shortId.generate();
  managedashboard.queryname = managedashboard.queryname.toLowerCase();
  logger.emit("log","queryid : "+managedashboard.queryid);
  next();
});

manageDashboard.set('redisCache', true);
manageDashboard.set('expires', 90);
//Seed a Dashboard
manageDashboard.statics.findAndModify = function (query, sort, doc, options, callback) {
  return this.collection.findAndModify(query, sort, doc, options, callback);
};
var ManageDashboard = mongoose.model('managedashboard', manageDashboard);

module.exports = ManageDashboard;