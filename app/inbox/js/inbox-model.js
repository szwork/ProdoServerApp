/*
* Overview: Product Comments Model
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
// var commonapi=require('../../common/js/common-api');
var shortId = require('shortid');
var logger = require("../../common/js/logger");

var InboxSchema = mongoose.Schema({
  messageid:{type:String,unique:true},
  userid:{type:String,ref:"users"},
  from:{email:String,userid:String,username:String},//email
  body:{type:String},
  subject:{type:String},
  messagetype:{type:String,default:"normal"},
  status:{type:String,default:"unread"},
  createdate:{type:Date,default:new Date()},
  parentid:{type:String,default:null},
  testimonial:{type:Object}//if messagetype is testimonial
});
InboxSchema.pre('save', function(next) {
  var inbox = this;
  inbox.messageid=shortId.generate();  
  next(); 
})
InboxSchema.set('redisCache', true);
 InboxSchema.set('expires', 90);
//Seed a product Comment
InboxSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
    return this.collection.findAndModify(query, sort, doc, options, callback);
};
var Inbox = mongoose.model('inbox', InboxSchema);

module.exports = Inbox;