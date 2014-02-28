/*
* Overview: Product Campain Model
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
  //orgname and grpname set when user is organization  user
  status:{type:String},
  datecreated:{type:Date}, 
  dateremoved:{type:Date},   
  commenttext:{type:String},   
  tags:[{type:String,ref:"Tags"}], 
  comment_image:[{imageid:{type:String},image:{type:String}}]
});

//Product Campain Model
var productCampainSchema = mongoose.Schema({
  orgid:{type:String,ref:"Organisation"},
  campain_id:{type:String},
  campain_lead:{type:String},
  title:{type:String},
  description:{type:String},
  startdate:{type:Date},//,default:Date.now
  enddate:{type:Date},
  status:{type:String,default:"init"},//init,active,deactive
  campain_logo:{type:String},
  artwork:{logo:{type:String},banner:{type:String},photose:[{type:String}]},
  campain_comments: [commentSchema],
});

productCampainSchema.pre('save', function(next) {
  var productscampain = this;
  productscampain.campain_id = shortId.generate();  
  // console.log("ProductsCampain pre "+ productscampain);
  next();
})

//Seed a Product Campain
productCampainSchema.set('redisCache', true);
productCampainSchema.set('expires', 90);
 
var ProductCampain = mongoose.model('productcampain', productCampainSchema);

module.exports = ProductCampain;