/*
* Overview: Blog Analytics Model
* Dated:
* Author: Dinesh Sawant
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* Date | author | description 
* ----------------------------------------------------------------------
* 24-05-2014 | xyx | Add a new property
*/

var mongoose = require('../../common/js/db');
var shortId = require('shortid');
var logger = require("../../common/js/logger");

//Camapaign Analytics Model
var blogAnalyticsSchema = mongoose.Schema({
  prodle:{type:String},
  blogid:{type:String},
  featurename:{type:String,ref:"productFeatureSchema"},
  analytics: [{tagid:{type:String,ref:"TagReffDictionary"},tagname:{type:String,ref:"TagReffDictionary"},userid:{type:String,ref:"User"},datecreated:{type:Date},commentavailable:{type:Boolean,default:true}}]
});
// blogAnalyticsSchema.pre('save', function(next) {
//   var product = this;
//   product.prodle=shortId.generate();  
//    console.log("product pre"+product);
//   next();
// })
//Seed a campaign analytics
 blogAnalyticsSchema.set('redisCache', true);
 blogAnalyticsSchema.set('expires', 90);
 
var BlogAnalytics = mongoose.model('bloganalytics', blogAnalyticsSchema);

module.exports = BlogAnalytics;