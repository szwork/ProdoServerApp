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

var MarketingSchema = mongoose.Schema({
  marketing_id:{type:String},
  name:{type:String},
  description:{type:String},
  artwork:{bucket:{type:String},key:{type:String},image:{type:String},imageid:{type:String}},
  status:{type:String,default:"active"}
});

//generate the marketing_id when you save.
MarketingSchema.pre('save', function(next) {
  console.log("calling to marketing save pre");
  var marketing = this;
  logger.emit("log","tagdata in pre "+marketing);
  marketing.marketing_id = "mk"+shortId.generate();
  logger.emit("log","shortid : "+marketing.marketing_id);
  next();
});

MarketingSchema.set('redisCache', true);
MarketingSchema.set('expires', 90);
//Seed a tagreffdictionary
MarketingSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
  return this.collection.findAndModify(query, sort, doc, options, callback);
};
var Marketing = mongoose.model('marketing', MarketingSchema);

module.exports = Marketing;