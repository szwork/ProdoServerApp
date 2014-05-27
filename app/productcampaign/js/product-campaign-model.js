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

//Product Campaign Comment Model
// var commentSchema = mongoose.Schema({
//   commentid:{type:String},
//   user:{userid:{type:String,ref:"User"},profilepic:{type:String},username:{type:String},orgname:{type:String},grpname:{type:String}},
//   //orgname and grpname set when user is organization  user
//   status:{type:String},
//   datecreated:{type:Date}, 
//   agreecount:{type:Number},
//   disagreecount:{type:Number},
//   dateremoved:{type:Date},   
//   commenttext:{type:String},   
//   tags:[{type:String,ref:"Tags"}], 
//   comment_image:[{bucket:String,key:String,imageid:{type:String},image:{type:String}}]
// });
//Product Campaign Model
var productCampaignSchema = mongoose.Schema({
  orgid:{type:String,ref:"Organisation"},
  prodle:{type:String,ref:"Products"},
  productname:{type:String,ref:"Products"},
  category:[{type:String}],
  campaign_id:{type:String},
  banner_image:{bucket:String,key:String,image:{type:String}},
  campaign_tags:[{type:String}],
  bannertext:{type:String},
  name:{type:String},
  description:{type:String},
  createdate:{type:Date,default:Date.now},
  startdate:{type:Date},
  resultdate:{type:Date},
  enddate:{type:Date},
  impression_limit:{type:Number},// talkins + comment = 1 impression
  status:{type:String,default:"init"},//init,active,deactive
  artwork:[{bucket:{type:String},key:{type:String},image:{type:String},imageid:{type:String}}],
  // campaign_comments: [commentSchema], 
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