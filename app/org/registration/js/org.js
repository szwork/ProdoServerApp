var util = require("util");
var events = require("events");

var Organization = function() {
	events.EventEmitter.call(this);
	this.registerOrg = function(orgData) {
	 var newOrg = orgData;
	 this.emit("newOrgRegistration", newOrg);
	};

	var _validate = function(organization) {
		//validate the org data
		
		  if(organization.name==undefined){
		  	this.emit("failedorgregistration",{"error":{"message":"Please type organization name"}});
		  } else if(organization.orgtype==undefined){
		    this.emit("failedorgregistration",{"error":{"message":"please select organization type"}});
		  }else if(organization.contact_numbers.length<1){
		    this.emit("failedorgregistration",{"error":{"message":"please give atleast one contact numbers"}});
		  }else if(organization.location==undefined){
		  	this.emit("failedorgregistration",{"error":{"message":"please give a location details"}});
		  }else if(organization.terms==false){
		  	this.emit("failedorgregistration",{"error":{"message":"please agree the terms and condition"}});
		  }else{
		    	logger.emit("log","_validated");
				this.emit("validated", organization);
		  }
   
	};

	var _addorg = function(org) {
		//validate the org data

	    organization.save(function(err,organization){
	      	if(err){
	        	this.emit("failedorgregistration",{"error":{"message":"Error in db to add organization"}});
	      	}else{  
		        
		        var orgid = organization.orgid;
				logger.emit("log","addedorg");
				this.emit("addedorg", orgid);		        
	      	}
	    })

		console.log("addedorg");
		this.emit("addedorg", org);
	};

	var _addUserToOrg = function(org) {
		//validate the org data
				console.log("useraddedtoorg");
		this.emit("useraddedtoorg", org);
	};

	var _addAdminGroup = function(org) {
		//validate the org data
				console.log("addedadmingroup");
		this.emit("addedadmingroup", org);
	};

	var _addUserInvitees = function(org) {
		//validate the org data
				console.log("addedInvitees");
		this.emit("addedInvitees", org);
	};

	var _sendEmailToInvitees = function(org) {
		//validate the org data
				console.log("emailsenttoinvites");
		this.emit("emailsenttoinvites", org);
	};

	var _addInviteeGroupMembers = function(org) {
		//validate the org data
				console.log("addedgroupmembers");
		this.emit("addedgroupmembers", org);
	};

	var _successfulOrgRegistration = function(org) {
		//validate the org data
		console.log("successfulOrgRegistration");
		this.emit("successfulOrgRegistration", org);
	};

	//workflow
	this.on("newOrgRegistration", _validate);
	this.on("validated", _addorg);
	this.on("addedorg", _addUserToOrg);
	this.on("useraddedtoorg", _addAdminGroup);
	this.on("addedadmingroup", _addUserInvitees);
	this.on("addedInvitees", _sendEmailToInvitees);
	this.on("emailsenttoinvites", _addInviteeGroupMembers);
	this.on("addedgroupmembers", _successfulOrgRegistration);	
};

util.inherits(Organization, events.EventEmitter);
module.exports = new Organization();
