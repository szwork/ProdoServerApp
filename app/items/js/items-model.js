/*
* Overview: Items Data Model
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


//Items Data Model
var itemSchema = mongoose.Schema({
  itemid:{type:String,unique: true},
  prodle:{type:String},
  name: {type: String},
  model_no:{type:String},
  serial_no:{type:String},
  createddate:{type:Date,default:Date.now},
  modifieddate:{type:Date},
  removeddate:{type:Date},
  status:{type:String,default:"init"},//init,active,inactive
});

itemSchema.pre('save', function(next) {
  var item = this;
  item.itemid=shortId.generate();  
   console.log("item pre"+item);
  next(); 
})

//Seed a items
itemSchema.set('redisCache', true);
itemSchema.set('expires', 6000);
itemSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
  return this.collection.findAndModify(query, sort, doc, options, callback);
};

var Items = mongoose.model('items', itemSchema);

module.exports = Items;