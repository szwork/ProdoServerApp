/*
* Overview: Product Tags Model
* Dated: 04-FEB-2014
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

var TagReffDictionary = mongoose.Schema({
  tagid:{type:String}, 
  tagname:{type:String},
  domain_tag:[{type:String}],
  emotions:{category:{type:String},emotion:{type:String},level:{type:String},result:{type:String},emotion_url:{type:String}}  
});

//generate the tagid when you save.
TagReffDictionary.pre('save', function(next) {
  console.log("calling to tags save pre");  
  var tag = this;
  logger.emit("log","tagdata in pre "+tag);
  tag.tagid = "t"+shortId.generate();
  logger.emit("log","shortid : "+tag.tagid);
  next();
});

TagReffDictionary.set('redisCache', true);
TagReffDictionary.set('expires', 90);
//Seed a tagreffdictionary
TagReffDictionary.statics.findAndModify = function (query, sort, doc, options, callback) {
  return this.collection.findAndModify(query, sort, doc, options, callback);
};
var ProductTags = mongoose.model('tagreffdictionary', TagReffDictionary);

module.exports = ProductTags;