/*
* Overview: Warranty Data Model
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

////////////
//Product Warranty Data Model
var warrantySchema = mongoose.Schema({
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
  status:{type:String,default:"active"},
  modified_date:
  createddate:
  removeddate:
  comments_shown:5
  product_comments: [{prodle:{type:String,ref:"comments"}}], 
});

//Seed a product
var Warranty = mongoose.model('Warranty', warrantySchema);

module.exports = Warranty;



=========
WARRANTY
=========
date of purchase
customer name & address
customer phone 
customer signature
dealer name and address
dealer signature
warranty type - standard or extended
warrantyconditions: []
warranty applicability: []
warrantyregion:
countryofpurchase:
warrantyperiod :
warrantyservices: //Pick up & return, on-site, postal return
Warrantycoverage:
Warrantyclaimrequests: []
Warrantystatus: 
expirynotification:
warrantyterms:
istransferrable:

warranty conditions
extended warranty solutions
warranty applicability
region
or country of purchase
warranty period 
The warranty period applies from the date of purchase by the first customer and is transferable only between end-users.
warranty services
  Pick up & return, on-site, postal return
Warranty coverage
Warranty claim request
Warranty status, expiry notification


warranty is confined to the first purchaser of the product only and is not transferrable
repairs are carried by company authorized personnel
