/*
* Overview: Product/Campaign Comments Model
* Dated: 24-Nov-2013
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
var logger = require("../../common/js/logger");
var replySchema=mongoose.Schema({
  replyid:{type:String},
  user:{userid:{type:String,ref:"User"},profilepic:{type:String},username:{type:String},orgname:{type:String},grpname:{type:String}},
  datecreated:{type:Date},
  replytext:{type:String}
  
})
var CommentSchema = mongoose.Schema({
  commentid:{type:String}, 
  user:{userid:{type:String,ref:"User"},profilepic:{type:String},username:{type:String},orgname:{type:String},grpname:{type:String}},
  prodle:{type:String, ref:"Product"},
  campaign_id:{type:String},
  commentcategory:{type:String},//its mandetory
  status:{type:String,default:"active"}, 
  agreecount:{type:Number,default:0},
  disagreecount:{type:Number,default:0},
  type:{type:String},//proudct,campain
  replies:[replySchema],
  datecreated:{type:Date,default:Date.now}, 
  dateremoved:{type:Date},   
  commenttext:{type:String},   
  tags:[{type:String,ref:"Tags"}],
  featureanalytics:[{featurename:String,tag:String}],
  comment_image:[{bucket:String,key:String,imageid:{type:String},image:{type:String}}]  
});

CommentSchema.set('redisCache', true);
 CommentSchema.set('expires', 90);
//Seed a product Comment
CommentSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
    return this.collection.findAndModify(query, sort, doc, options, callback);
};
var ProductComment = mongoose.model('comments', CommentSchema);

module.exports = ProductComment;