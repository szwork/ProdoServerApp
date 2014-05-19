/*
* Overview: Blog Model
* Dated: 14-May-2014
* Author: Dinesh Sawant
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

var authorSchema = mongoose.Schema({
  authorid:{type:String,unique:true},
  userid:{type:String,unique:true},
  firstname:{type:String},
  lastname:{type:String},
  email:{type:String,required:true,unique:true},
  aboutyou:{type:String},
  country:{type:String,default:null},
  category:[{type:String}],
  posted_date:{type:Date},
  accepted_date:{type:Date},
  rejected_date:{type:Date},
  status:{type:String,default:"requested"},//requested,accepted
  portfolio:[{type:{type:String},url:{type:String}}]
  // portfolio:{
  //   facebook:[{type:String}],
  //   twitter:[{type:String}],
  //   google:[{type:String}],
  //   other:[{type:String}]
  // }
});

authorSchema.pre('save', function(next) {
  var author = this;
  author.authorid=shortId.generate();  
  console.log("author pre"+author);
  next();
})

//Seed a Author
authorSchema.set('redisCache', true);
authorSchema.set('expires', 6000);
authorSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
  return this.collection.findAndModify(query, sort, doc, options, callback);
};

var Author = mongoose.model('Author', authorSchema);
module.exports = Author;