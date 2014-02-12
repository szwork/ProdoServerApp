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
// var mongooseRedisCache = require("mongoose-redis-cache");
var shortId = require('shortid');
var mongoShortId = require('mongoose-shortid');
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
  contacts:[{customerhelpline:String,contactemail:String}],
	region:{type:String},
	timezone:{type:String},
  // contactemail:{type:String}//contact emails
});



var OrganizationSchema = mongoose.Schema({
    orgid:{type:String},
    parentorgid: { type: String, default:0 },
    //oranization has many suborganiztion then 1parent have many organization
    orgtype:{type:String,require:true},
    //type means org is also a consumer orgtypid of consumer & also of company
    name: { type:String ,require:true},
    description: { type:String },
    org_logo:{type:String},
    prodo_setupdate: { type:Date,default:Date.now()}, /*the date the company was setup on prodonus*/
    prodo_closedate: { type:Date },/* the date the company was closed on Prodonus*/
    location:[LocationSchema],
    usergrp:[UserGroupSchema],
    status: { type:String,default:"active"},/*wheather organization is active(1) or deactive(0)*/
    contractid:{type:String},
    subscription:{
      planid:{type:String,ref:"Subscription"} ,//individdual
      planstartdate:{type:Date}, 
      planexpirydate:Date
    },
    payment:{paymentid:{type:String,default:null}},
    org_images:[{image:{type:String},imageid:{type:String}}], 
    orginvites:[{type:String}],//inivte by organization to other companies or manufacturer to join on prodonus
    terms:{type:Boolean},
    broadcast:[{message:{type:String},expirydate:{type:Date}}]

});

OrganizationSchema.pre('save', function(next) {
  var organization = this;
  organization.orgid="org"+shortId.generate();  
  next(); 
  })
 OrganizationSchema.set('redisCache', true);
 OrganizationSchema.set('expires', 90);
 // mongooseRedisCache(mongoose)
   

var Organization = mongoose.model('organization', OrganizationSchema);
 
module.exports = Organization;
