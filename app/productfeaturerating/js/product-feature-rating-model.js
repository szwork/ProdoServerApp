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
var productFeatureRatingSchema = mongoose.Schema({
  prodle:{type:String},
  // featurerating:[]
  featurename:{type:String},
  ratecount:{type:Number},
  usercount:{type:Number}
  
});
// productFeatureRatingSchema.pre('save', function(next) {
//   var productenquiry = this;
//   productenquiry.productenquiryid=shortId.generate();  
//    // console.log("product pre"+product);
//   next(); 
 
//   })
//Seed a product
 productFeatureRatingSchema.set('redisCache', true);
 productFeatureRatingSchema.set('expires', 6000);
 productFeatureRatingSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
    return this.collection.findAndModify(query, sort, doc, options, callback);
};
var ProductFeatureRating = mongoose.model('productfeatureratings', productFeatureRatingSchema);

module.exports = ProductFeatureRating;