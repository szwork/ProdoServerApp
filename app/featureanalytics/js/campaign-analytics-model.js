/*
* Overview: Campaign Analytics Model
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
var shortId = require('shortid');
var logger = require("../../common/js/logger");

//Camapaign Analytics Model
var campaignAnalyticsSchema = mongoose.Schema({
  prodle:{type:String},
  campaign_id:{type:String},
  featurename:{type:String,ref:"productFeatureSchema"},
  analytics: [{tagid:{type:String,ref:"TagReffDictionary"},tagname:{type:String,ref:"TagReffDictionary"},userid:{type:String,ref:"User"},datecreated:{type:Date,default:new Date()}}]
});
// campaignAnalyticsSchema.pre('save', function(next) {
//   var product = this;
//   product.prodle=shortId.generate();  
//    console.log("product pre"+product);
//   next();
// })
//Seed a campaign analytics
 campaignAnalyticsSchema.set('redisCache', true);
 campaignAnalyticsSchema.set('expires', 90);
 
var CampaignAnalytics = mongoose.model('campaignanalytics', campaignAnalyticsSchema);

module.exports = CampaignAnalytics;