/*
* Overview: Feature Analytics Model
* Dated:
* Author: Dinesh Sawant
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* Date | author | description 
* ----------------------------------------------------------------------
* 04-02-2014 | xyx | Add a new property
*/

var mongoose = require('../../common/js/db');
// var ObjectId = mongoose.Schema.ObjectId;
// var commonapi=require('../../common/js/common-api');
var shortId = require('shortid');
var logger = require("../../common/js/logger");

//Feature Analytics Model
var featureAnalyticsSchema = mongoose.Schema({
  prodle:{type:String},
  featureid:{type:String,ref:"productFeatureSchema"},
  analytics: [{tagid:{type:String,ref:"TagReffDictionary"},tagname:{type:String,ref:"TagReffDictionary"},count:{type:String}}]
});
// featureAnalyticsSchema.pre('save', function(next) {
//   var product = this;
//   product.prodle=shortId.generate();  
//    console.log("product pre"+product);
//   next();
// })
//Seed a feature analytics
 featureAnalyticsSchema.set('redisCache', true);
 featureAnalyticsSchema.set('expires', 90);
 
var FeatureAnalytics = mongoose.model('featureanalytics', featureAnalyticsSchema);

module.exports = FeatureAnalytics;