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

var mongoose = require('../../common/js/db');
var ObjectId = mongoose.Schema.ObjectId;

var shortId = require('shortid');

var UserGroupSchema = mongoose.Schema({     
      grpname:{type:String},
      /*role means:myaybe service engineers,marketing,production employee of particular organization*/
      invites: {type:String}, 
      grpmembers:
      [
       {
       		type:String
       } 
	   ]   
	}
);
var LocationSchema = mongoose.Schema({
      locationtype:{type:String},//location type means service centers,office address,
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
        zipcode:String,
    		city:String,
    		state:String,
    		country:String
    	},
      contacts:[{customerhelpline:String}],
    	region:{type:String},
    	timezone:{type:String}
});



var OrganizationSchema = mongoose.Schema({
    orgid:{type:String},
    parentorgid: { type: String, default:0 },
    //oranization has many suborganiztion then 1parent have many organization
    orgtype:{type:String,require:true},
    //type means org is also a consumer orgtypid of consumer & also of company
    name: { type:String ,require:true},
    description: { type:String },
    prodo_setupdate: { type:Date,default:Date.now()}, /*the date the company was setup on prodonus*/
    prodo_closedate: { type:Date },/* the date the company was closed on Prodonus*/
    location:[LocationSchema],
    usergrp:[UserGroupSchema],
    status: { type:String,default:"active"},/*wheather organization is active(1) or deactive(0)*/
    contractid:{type:String},
    subscription:{
      planid:{type:ObjectId,ref:"Subscription"} ,//individdual
      planstartdate:{type:Date,default:Date.now()}, 
      planexpirydate:Date
    },
    orginvites:[{type:String}],//inivte by organization to other companies or manufacturer to join on prodonus
    terms:{type:Boolean}

});

OrganizationSchema.pre('save', function(next) {
  var organization = this;
  organization.orgid="org"+shortId.generate();  
  next(); 
  })

var Organization = mongoose.model('organization', OrganizationSchema);
module.exports = Organization;
