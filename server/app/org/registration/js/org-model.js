/*
* Overview: Organization Model
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

var mongoose = require('../common/db');
var ObjectId = mongoose.Schema.ObjectId;

var UserGroupSchema = mongoose.Schema({     
      grpname:{type:String},
      /*role means:myaybe service engineers,marketing,production employee of particular organization*/
      invites: {type:String}, 
      grpmembers:
      [
       {
       		userid:{type:ObjectId, ref: 'User'}
       } 
	   ]   
	}
);
var LocationSchema = mongoose.Schema({
		  geo:
      {
        latitude:{type:String},
        longitude:{type:String}
      },
    	address:
    	{
    	 	address1:String,
    		address2:String,
    		address3:String,
    		city:String,
    		state:String,
    		country:String
    	},
    	region:{type:String},
    	timezone:{type:String}
});

var ContactSchema = mongoose.Schema({ customerhelpline: {type:String}
});

var OrganizationSchema = mongoose.Schema({
    parentorgid: { type: String, default:0 },
    //oranization has many suborganiztion then 1parent have many organization
    orgtype:{type:String},
    //type means org is also a consumer orgtypid of consumer & also of company
    name: { type:String },
    description: { type:String },
    prdsetupdate: { type:Date,default:Date.now()}, /*the date the company was setup on prodonus*/
    prdclosedate: { type:Date },/* the date the company was closed on Prodonus*/
    contact:[ContactSchema],//multiple contact numbers
    location:[LocationSchema],
    usergrp:[UserGroupSchema],
    status: { type:String,default:"active"},/*wheather organization is active(1) or deactive(0)*/
    contractid:{type:String}  
});

var Organization = mongoose.model('organization', OrganizationSchema);

//export model schema
module.exports = Organization;
