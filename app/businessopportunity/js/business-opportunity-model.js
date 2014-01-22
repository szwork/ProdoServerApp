/*
* Overview: Business Opportunity
* Dated:
* Author: Sunil More
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* 27-3-2013 | xyx | Add a new property
* 08-10-2013|Sunil More|adding new model email template
*/

var mongoose = require('../../common/js/db');
// Verification token model
var businessOpportunitySchema = new mongoose.Schema({
  invitetype:{type:String},//business or user or orgcustomer
  from:{type:String},
  to:{type:String},
  fromusertype:{type:String},
  tousertype:{type:String},
  contact:[{type:String}],
  location:{
  	address1:{type:String},
    address2:{type:String},
  	address3:{type:String},
  	city:{type:String},
  	state:{type:String},
  	country:{type:String},
  	zipcode:{type:String}
   }
});



var BusinnessOpportunityModel = mongoose.model('businessopportunities', businessOpportunitySchema);
module.exports = BusinnessOpportunityModel;
