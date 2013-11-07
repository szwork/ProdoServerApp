
/*
* Overview: Subscription History Model
* Dated:
* Author: Sunil More
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* 27-3-2013 | xyx | Add a new property
* 09-10-2013|Sunil|add subcriptionhistory  model 
*/

var mongoose = require('../../../common/js/db');
var ObjectId = mongoose.Schema.ObjectId;
var commitment=mongoose.Schema({
      committype:String,
      amount:Number,
      currency:String
    });s
var subscriptionHistorySchema = mongoose.Schema({
  //planid: { type: String },//
  user_id:{type:ObjectId},//it may be orgid or userid
  plantype:{type:String},//for an individual,company,manufacturers and custom type
  planpaymentcommitment:[commitment],//monthly quarterly yearly
    planstartdat:{type:Date,default:Date.now()},
    status:{type:String,default:"active"},
  
});

var SubscriptionHistoryModel = mongoose.model('subscriptionhistory', subscriptionHistorySchema);

module.exports = SubscriptionHistoryModel;
