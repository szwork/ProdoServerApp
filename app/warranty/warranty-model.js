/*
* Overview: User Model
* Dated:
* Author: Sunil More
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* 27-3-2013 | xyx | Add a new property
* 12-11-2013|Sunil|Add a subscription 
*/

var mongoose = require('../../common/js/db');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var ObjectId = mongoose.Schema.ObjectId;
var commonapi=require('../../common/js/common-api');
var shortId = require('shortid');
var logger=require("../../common/js/logger");

var warrantySchema = mongoose.Schema({
 warranty_id:{type:String},
 org_warranty_no:{type:String},//organization provided orginal warranty id
 warranty_type:{type:String},//extended or standard
 purchase_date:{type:Date},
 userid:{type:String,ref:"User"},
 invoice_image:{bucket:String,key:String,image:{type:String}},//path of invoice image
 dealer_id:{type:String,ref:"Organization"},
 warranty_conditions:[{condition:{type:String}}],
 warranty_applicability:[{region:{type:String}}],//available on multiple regions
 warranty_claims:[{type:String}],
 warranty_status:{type:String},
 adddate:{type:Date,default:Date.now},
 expirydate:{type:Date},
 warranty_removedate:{type:Date},
 warranty_tranferable:{type:Boolean}
});

warrantySchema.statics.findAndModify = function (query, sort, doc, options, callback) {
    return this.collection.findAndModify(query, sort, doc, options, callback);
};

//Seed a warranty
var Warranty = mongoose.model('warranty', warrantySchema);

module.exports = Warranty;
