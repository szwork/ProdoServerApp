/*===================
SUBSCRIPTION PLANS
===================
id:
plantype: //individual/company/manufacturers
planpaymentcommitments : //type =>monthly, quarterly, yearly
	{ type: , amount: , currency:}
status
location {
	region: , city: , state: , country:
	}
*/
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
* 
*/

var mongoose = require('../../../common/js/db');
var subscriptionSchema = mongoose.Schema({
  plantype: { type: String },
  planpaymentcommitments:
  	[{
  	 type:String,
  	 amount:String,
  	 currency:String
  	}],
  status:{type:String,default:"active"},
  location:{
  	region:String,
  	city:String,
  	state:String,
  	country:String
   }
});

var SubscriptionModel = mongoose.model('Subscription', subscriptionSchema);

module.exports = SubscriptionModel;
