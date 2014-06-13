/*
* Overview: Product Data Model
* Dated:
* Author: Ramesh Kunhiraman
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* Date | author | description 
* ----------------------------------------------------------------------
* 27-3-2013 | xyx | Add a new property
*/

var mongoose = require('../../common/js/db');
var ObjectId = mongoose.Schema.ObjectId;
var commonapi=require('../../common/js/common-api');
var shortId = require('shortid');
var logger = require("../../common/js/logger")




////////////
//Product Data Model
var productEnquirySchema = mongoose.Schema({
  prodle:{type:String},
  orgid:{type:String,ref:"Organization"},//means manufacturer
  userid:{type:String},
  subject:{type:String},
  body:{type:String},
  enquirydate:{type:Date,default:new Date()}
});
productEnquirySchema.pre('save', function(next) {
  var productenquiry = this;
  productenquiry.productenquiryid=shortId.generate();  
   // console.log("product pre"+product);
  next(); 
 
  })
//Seed a product
 productEnquirySchema.set('redisCache', true);
 productEnquirySchema.set('expires', 6000);
 productEnquirySchema.statics.findAndModify = function (query, sort, doc, options, callback) {
    return this.collection.findAndModify(query, sort, doc, options, callback);
};
var ProductEnquiry = mongoose.model('productenquiries', productEnquirySchema);

module.exports = ProductEnquiry;