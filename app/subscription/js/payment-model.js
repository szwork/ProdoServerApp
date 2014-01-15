
/*
* Overview: Subscription Model
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
var shortId = require('shortid');
var generateId = require('time-uuid');
var paymentSchema = mongoose.Schema({
  paymentid: {type:String,unique:true},
  price:{type:Number},
  paymenttype:{type:String},
  userid:{type:String,ref:"User"}
  
});
paymentSchema.pre('save', function(next) {
	var payment = this;
	payment.paymentid=generateId();
	next();
});



var PaymentModel = mongoose.model('payments', paymentSchema);

module.exports = PaymentModel;
