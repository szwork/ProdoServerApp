
/*
* Overview: Organization History
* Dated:
* Author: Sunil More
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* 27-3/2013 | xyx | Add a new property
* 
*/

var mongoose = require('../../../common/js/db');
var ObjectId = mongoose.Schema.ObjectId;
var organizationHistorySchema = mongoose.Schema({
	orgid:{ type:ObjectId,required: true, ref: 'Organization' },
	updateddate:{ type:Date,default:Date.now }, 
  	updatedby:{ type:String }
});

var OrganizationHistory = mongoose.model('organizationshistory', organizationHistorySchema);

//export model schema
module.exports=OrganizationHistory;
