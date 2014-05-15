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

var productTagsSchema = mongoose.Schema({

});
var pricingSchema = mongoose.Schema({

});
var pricingHistorySchema = mongoose.Schema({

});
var productFeatureSchema = mongoose.Schema({
  featureid:{type:String},
  featurename:{type:String},
  featuredescription:{type:String}
});

var commentSchema = mongoose.Schema({
  commentid:{type:String},
  user:{userid:{type:String,ref:"User"},profilepic:{type:String},username:{type:String},orgname:{type:String},grpname:{type:String}},
  //orgname and grpname set when user is organization  user
  status:{type:String},
  datecreated:{type:Date}, 
  dateremoved:{type:Date},   
  commenttext:{type:String},
  agreecount:{type:Number},
  disagreecount:{type:Number},
  commentcategory:{type:String},  
  tags:[{type:String,ref:"Tags"}], 
  comment_image:[{bucket:String,key:String,imageid:{type:String},image:{type:String}}]
});

////////////
//Product Data Model
var productSchema = mongoose.Schema({
  prodle:{type:String,unique: true},
  orgid:{type:String,ref:"Organization"},//means manufacturer
  orgprodid:{type:String},
  product_logo:{bucket:String,key:String,image:{type:String}},
  name: { type: String },/**/
  display_name:{type:String},/**/
  model_no:{type:String},/**/
  model_name:{type:String},/**/
  serial_no:{type:String},/**/
  description: { type: String},/**/
  introduction_date: { type: Date},
  sale_discontinuation_date:{type:Date},
  support_discontinuation_date: { type:Date },
  banneddate: { type: Date },
  product_images: [{bucket:String,key:String,image:{type:String},imageid:{type:String}}],
  category:[{type:String}],
  commentcategory:[{type:String}],
  features: [productFeatureSchema], 
  substitutes: [{prodle:{type:String,ref:"product"}}], 
  incompatability: [{prodle:{type:String,ref:"product"}}], 
  status:{type:String,default:"init"},//init,active,inactive
  createddate:{type:Date,default:Date.now},
  modifieddate:{type:Date},
  removeddate:{type:Date},
  comments_shown:{type:Number},
  product_comments: [commentSchema], 
  pricing:[pricingSchema],
  pricinghistory:[pricingHistorySchema],
  blogs: [{blogid:{type:String}}]
});

productSchema.pre('save', function(next) {
  var product = this;
  product.prodle=shortId.generate();  
   console.log("product pre"+product);
  next(); 
})
//Seed a product
 productSchema.set('redisCache', true);
 productSchema.set('expires', 6000);
 productSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
    return this.collection.findAndModify(query, sort, doc, options, callback);
};
var Product = mongoose.model('products', productSchema);

module.exports = Product;