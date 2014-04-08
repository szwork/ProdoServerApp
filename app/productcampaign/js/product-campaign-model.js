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
var logger = require("../../common/js/logger")

var commentSchema = mongoose.Schema({
  commentid:{type:String},
  user:{userid:{type:String,ref:"User"},profilepic:{type:String},username:{type:String},orgname:{type:String},grpname:{type:String}},
  status:{type:String},
  datecreated:{type:Date}, 
  dateremoved:{type:Date},   
  commenttext:{type:String},   
  tags:[{type:String,ref:"Tags"}], 
  comment_image:[{imageid:{type:String},image:{type:String}}]
});

//Product Campaign Model
var productCampaignSchema = mongoose.Schema({
  orgid:{type:String,ref:"Organisation"},
  campaign_id:{type:String},
  campaign_lead:{type:String},
  title:{type:String},
  description:{type:String},
  startdate:{type:Date},//,default:Date.now
  enddate:{type:Date},
  status:{type:String,default:"init"},//init,active,deactive
  campaign_logo:{type:String},
  artwork:{logo:{type:String},banner:{type:String},photose:[{type:String}]},
  campaign_comments: [commentSchema],
});

productCampaignSchema.pre('save', function(next) {
  var productscampaign = this;
  productscampaign.campain_id = shortId.generate();  
  // console.log("ProductsCampaign pre "+ productscampaign);
  next();
})

//Seed a Product Campain
productCampaignSchema.set('redisCache', true);
productCampaignSchema.set('expires', 90);
 
var ProductCampaign = mongoose.model('productcampaign', productCampaignSchema);

module.exports = ProductCampaign;