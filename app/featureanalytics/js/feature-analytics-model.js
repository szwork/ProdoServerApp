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
  featurename:{type:String,ref:"productFeatureSchema"},
  // featureid:{type:String,ref:"productFeatureSchema"},
  analytics: [{tagid:{type:String,ref:"TagReffDictionary"},tagname:{type:String,ref:"TagReffDictionary"},userid:{type:String,ref:"User"},datecreated:{type:Date},commentavailable:{type:Boolean,default:true}}]

});

//Seed a feature analytics
 featureAnalyticsSchema.set('redisCache', true);
 featureAnalyticsSchema.set('expires', 90);
 
var FeatureAnalytics = mongoose.model('featureanalytics', featureAnalyticsSchema);

module.exports = FeatureAnalytics;