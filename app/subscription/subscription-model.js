
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

var mongoose = require('../common/js/db');
var commitment=mongoose.Schema({
      commitmenttype:String,
      amount:Number,
      currency:String
    });
var subscriptionSchema = mongoose.Schema({
  //planid: { type: String },//
  plantype:{type:String},//for an individual,company,manufacturers and custom type
  planpaymentcommitment:[commitment],//monthly quarterly yearly
  planstartdate:{type:Date,default:Date.now()},
  status:{type:String,default:"active"},
  
});

var SubscriptionModel = mongoose.model('subscription', subscriptionSchema);

module.exports = SubscriptionModel;
