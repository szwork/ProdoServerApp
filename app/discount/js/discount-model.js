
/*
* Overview: Discount Model
* Dated:
* Author: Sunil More
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* 27-3-2013 | xyx | Add a new property
* 09-10-2013|Sunil|add subcription model 
*/

var mongoose = require('../../common/js/db');
var generateId = require('time-uuid');
var discountSchema = mongoose.Schema({
  //planid: { type: String },//
 discountid:{type:String},
 discountcode:{type:String},
 impact:{price:{type:Number},timeperiod:{type:Number}},//imapct price % discount and timeperiod defaults number of days
 applicable:{type:String,ref:"subscription"},
 maxcount:{type:Number},//set wehen at the time of creation
 usedcount:{type:Number},//update whenever use the discount code
 expirtydate:{type:Date},
 status:{type:String,default:"active"}
});
discountSchema.pre('save', function(next) {
	var discount = this;
	discount.discountid=generateId();
	discount.discountcode=generateId();
	next();
});

//if usedcount==maxcount then stauts="deactive"
var discountModel = mongoose.model('discounts', discountSchema);
module.exports = discountModel;
