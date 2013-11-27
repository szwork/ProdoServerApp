/*
* Overview: Product Data Model
* Dated:
* Author: Ramesh Kunhiraman
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* 27-3-2013 | xyx | Add a new property
*/

var mongoose = require('../../common/js/db');
var ObjectId = mongoose.Schema.ObjectId;
var commonapi=require('../../common/js/common-api');
var shortId = require('shortid');
var logger = require("../../common/js/logger")

var productTagsSchema = mongoose.Schema({

});

var commentSchema = mongoose.Schema({
  commentid:{type:String},
  commentby:{type:String},
  profilepicpath:{type:String}, 
  username:{type:String}, 
  productid:{type:String},   
  status:{type:String},
  datecreated:{type:String}, 
  dateremoved:{type:String},   
  commenttext:{type:String},   
  tags:{type:String}, 
  orgid:{type:String, ref:"productTagsSchema"}
  companyname:{type:String},   
  groupname:{type:String},   
  images:{type:String}, 
  replyComments:{type:String, ref:"Schema"}

});

////////////
//Product Data Model
var productSchema = mongoose.Schema({
  prodle:{type:String, required: true, unique: true},
  orgprodid:{type:String},
  name: { type: String },
  display_name:{type:String},
  model_no:{type:Date},
  model_name:{type:String},
  phone:{type:String},
  serial_no:{type:String},
  description: { type: String},
  introduction_date: { type: String},
  sale_discontinuation_date:{type:date},
  support_discontinuation_date: { type:date },
  banneddate: { type: date },
  product_images: [{prodle:{type:String,ref:"product"}}], 
  features: [{prodle:{type:String,ref:"product"}}], 
  substitutes: [{prodle:{type:String,ref:"product"}}], 
  incompatability: [{prodle:{type:String,ref:"product"}}], 
  category: [{prodle:{type:String,ref:"product"}}], 
  product_images: [{prodle:{type:String,ref:"product"}}], 
  status:{type:String,default:"active"},
  modified_date:
  createddate:
  removeddate:
  comments_shown:5
  product_comments: [{prodle:{type:String,ref:"comments"}}], 
  pricing:
  pricing history:[ {}, {}]
  blogs: [blogid, blogid]
});

//Seed a product
var Product = mongoose.model('Product', productSchema);

module.exports = Category;