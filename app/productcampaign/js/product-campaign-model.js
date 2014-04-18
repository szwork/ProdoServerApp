/*
* Overview: Product Campaign Model
* Dated:
* Author: Dinesh Sawant
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* Date | author | description 
* ----------------------------------------------------------------------
* 21-04-2014 | xyx | Add a new property
*/

var mongoose = require('../../common/js/db');
var shortId = require('shortid');
var logger = require("../../common/js/logger");

//Product Campaign Model
var productCampaignSchema = mongoose.Schema({
  orgid:{type:String,ref:"Organisation"},
  prodle:{type:String,ref:"Products"},
  productname:{type:String,ref:"Products"},
  category:[{type:String}],
  campaign_id:{type:String},  
  name:{type:String},
  description:{type:String},
  startdate:{type:Date},//,default:Date.now
  enddate:{type:Date},
  status:{type:String,default:"init"},//init,active,deactive
  artwork:[{bucket:{type:String},key:{type:String},image:{type:String},imageid:{type:String}}],
  // artwork:{logo:{type:String},banner:{type:String},photos:[{type:String}]},
});

productCampaignSchema.pre('save', function(next) {
  var productscampaign = this;
  productscampaign.campaign_id = shortId.generate();  
  console.log("ProductsCampaign pre "+ productscampaign);
  next();
})

//Seed a Product Campain
productCampaignSchema.set('redisCache', true);
productCampaignSchema.set('expires', 90);

productCampaignSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
  return this.collection.findAndModify(query, sort, doc, options, callback);
};

var ProductCampaign = mongoose.model('productcampaign', productCampaignSchema);

module.exports = ProductCampaign;