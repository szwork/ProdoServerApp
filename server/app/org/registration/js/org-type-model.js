/*
* Overview: Prodonus App
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

var mongoose = require('../../common/js/db');

var orgTypeSchema = mongoose.Schema({	
	orgtypename:{ type:String,required:true }//orgtype namemeans
});

var OrgType = mongoose.model('orgtype', orgTypeSchema);

//export model schema
module.exports = OrgType;
