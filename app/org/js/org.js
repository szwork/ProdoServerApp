var util = require("util");
var events = require("events");
var userModel = require('../../user/js/user-model');
var orgModel=require("./org-model");
var logger=require("../../common/js/logger");
var S=require("string");
var EmailTemplateModel=require('../../common/js/email-template-model');
var orgHistoryModel=require("./org-history-model");
var __=require("underscore");
var SubscriptionModel=require("../../subscription/js/subscription-model");
var verificationTokenModel = require('../../common/js/verification-token-model');
var BusinessOpportunityModel=require("../../businessopportunity/js/business-opportunity-model");
var Organization = function(organizationdata) {
	this.organization=organizationdata;
};
//this function is used to remvoe duplication element from json array
function removeDuplicates(arrayIn) {
    var arrayOut = [];
    for (var a=0; a < arrayIn.length; a++) {
        if (arrayOut[arrayOut.length-1] != arrayIn[a]) {
            arrayOut.push(arrayIn[a]);
        }
    }
    return arrayOut;
}
Organization.prototype = new events.EventEmitter;
module.exports = Organization;

Organization.prototype.addOrganization=function(sessionuserid,subscriptiondata){
	var self=this;
	var organizationdata=this.organization;
	_validateOganizationData(self,organizationdata,subscriptiondata,sessionuserid);
}

	var _validateOganizationData = function(self,organizationdata,subscriptiondata,sessionuserid) {
		//validate the org data
		
		  if(organizationdata.name==undefined){
		  	self.emit("failedOrgAdd",{"error":{"code":"AV001","message":"Please type organization name"}});
		  } else if(organizationdata.orgtype==undefined){
		    self.emit("failedOrgAdd",{"error":{"code":"AV001","message":"please select organization type"}});
		  }else if(organizationdata.location==undefined){
		  	self.emit("failedOrgAdd",{"error":{"code":"AV001","message":"please give a location details"}});
		  }else if(organizationdata.terms==false){
		  	self.emit("failedOrgAdd",{"error":{"code":"AV001","message":"please agree the terms and condition"}});
		  }else if(subscriptiondata==undefined){
		  	self.emit("failedOrgAdd",{"error":{"code":"AV001","message":"please provide subscrption details for Organization"}});
		  }else if(subscriptiondata.plantype==undefined){
		  	self.emit("failedOrgAdd",{"error":{"code":"AV001","message":"please pass plantype"}});
		  }else if(subscriptiondata.planid==undefined){
		  	self.emit("failedOrgAdd",{"error":{"code":"AV001","message":"please pass subscrption planid"}});
		  }else{

		    	logger.emit("log","_validated");
					//this.emit("validated", organizationdata);
					////////////////////////////////////////////////////////////
					_hasAlreadyOrganization(self,organizationdata,sessionuserid,subscriptiondata);
					///////////////////////////////////////////////////////////
		  }
		  
   
	};
	var _hasAlreadyOrganization=function(self,organizationdata,sessionuserid,subscriptiondata){
		userModel.findOne({userid:sessionuserid,"org.orgid":null},{userid:1}).lean().exec(function(err,user){
			if(err){
					self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"Error in db to find user"}});
				}else if(user){
					logger.emit("log","_hasAlreadyOrganization");
					//////////////////////////////////////////////////////////////////////////////
					_validateSubscriptionPlan(self,organizationdata,sessionuserid,subscriptiondata);
					//////////////////////////////////////////////////////////////////////////////
				
				}else{
					self.emit("failedOrgAdd",{"error":{"code":"AO001","message":"You can add only one organization"}});
				}
		})
	}
var _validateSubscriptionPlan=function(self,organizationdata,sessionuserid,subscriptiondata){
	SubscriptionModel.findOne({planid:subscriptiondata.planid,plantype:S(subscriptiondata.plantype).toLowerCase().s},function(err,subscription){
		if(err){
		 	self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"_validateSubscriptionPlan:Database"+err}});	
		}else if(!subscription){
			self.emit("failedOrgAdd",{"error":{"message":"Subscription plan of planid"+subscriptiondata.planid+" and plantype"+subscriptiondata.plantype+"doesn't exists"}});	
		}else{
			//////////////////////////////////////////////////////////////////////
			_addOrganization(self,organizationdata,sessionuserid,subscriptiondata);
			////////////////////////////////////////////////////////////////////
		}
	})

}
	var _addOrganization = function(self,organizationdata,sessionuserid,subscriptiondata) {
		//validate the org data
        organizationdata.subscription={planid:subscriptiondata.planid};
		var organization=new orgModel(organizationdata);

		organization.save(function(err,organization){
	     if(err){
	     	 self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"Error in db to find user"}});
	    }else{  
	    	logger.emit("log","_addOrganization");
	    	//////////////////////////////////////////////
		    _addOrgDetailsToUser(self,organization,sessionuserid);
		    /////////////////////////////////////////////      
	     }
	  })
	};

    
	var _addOrgDetailsToUser = function(self,organization,sessionuserid) {

		userModel.update({userid:sessionuserid},{$set:{"subscription.planid":organization.subscription.planid,usertype:S(organization.orgtype).toLowerCase().s,org:{orgid:organization.orgid,isAdmin:true,orgtype:organization.orgtype}}},function(err,userupdatestatus){
	 	  if(err){
	   	 self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"Error in db to update user"}});
	  	}else if(userupdatestatus!=1){
	    	self.emit("failedOrgAdd",{"error":{"code":"AU002","message":"Provided userid is wrong"}});
	  	}else{
	  			logger.emit("log","_addAdminGroup");
	  		///////////////////////////////////////////////
	  		_addAdminGroup(self,organization,sessionuserid);
	  		///////////////////////////////////////////////
	  	}
		})
	};

	var _addAdminGroup = function(self,organization,sessionuserid) {
		//validate the org data
		orgModel.update({ orgid:organization.orgid},{$push:{usergrp:{grpname:"admin",grpmembers:sessionuserid}}},function(err,status){
	      if(err){
	       	self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"Error in db to add admin group"}});
	      } else if(status!=1){
	      	self.emit("failedOrgAdd",{"error":{"code":"AO002","message":"Provided orgid doesn't exists"}});
	      }else{
	      	var organizationdata=self.organization;
	      	var invites="";
	      	if(organizationdata.usergrp!=undefined){
						for(var i=0;i<organizationdata.usergrp.length;i++){
							invites+=organizationdata.usergrp[0].invites;
						}
	    		}
	      	if(invites.trim().length==0){
		      	logger.emit("log","there is not ivtitee");
		      	////////////////////////////////
		      	_successfulOrgAdd(self);
		      	///////////////////////////////
	      	}else{
	      		logger.emit("log","_addUserInvitees");
		      	///////////////////////////////////
		      	_addUserInvitees(self,organization);
		      	/////////////////////////////////////
	      	}
	      }
    })
	};

	var _addUserInvitees = function(self,organization) {
		var usergrp=self.organization.usergrp;
		var invitees=[];
		var usergrp_array=[];

		for(var i=0;i<usergrp.length;i++)
		{
			var grpname=usergrp[i].grpname;
			if(usergrp[i].invites.trim().length>0){
				var invites=S(usergrp[i].invites.trim());
				var inivte_emails=[];
				if(invites.contains(",")){
					inivte_emails=invites.split(",");
				}else{
					inivte_emails.push(invites.s);
				}
				invitees=__.union(invitees,inivte_emails);
				usergrp_array.push({grpname:grpname,invites:inivte_emails});
			}
		}
		logger.emit("log","invitee"+invitees);
		userModel.find({email:{$in:invitees}},{email:1}).lean().exec(function(err,user){
	    if(err){
	    	self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"Error in db to find users"+err}});
	    }else{
	    	var existingusers=[];
	      for(var i=0;i<user.length;i++)
	      {
	        existingusers.push(user[i].email);
	      }
	      var newusers=[];
	      newusers=__.difference(invitees,existingusers);
	      
	      if(newusers.length>0){
	      	var userdata=[];
	      	for(var i=0;i<newusers.length;i++)
	     		{
						userdata[i]={email:newusers[i],username:newusers[i],usertype:S(organization.orgtype).toLowerCase().s,org:{orgid:organization.orgid,orgtype:organization.orgtype,isAdmin:false},subscription:{planid:organization.subscription.planid}};
	      	}
	        userModel.create(userdata,function(err,inviteuserdata){
	          if(err){
	            self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"_addUserInvitees"+err}});
	          }else if(inviteuserdata){
	          	logger.emit("log",inviteuserdata);
	          	var inviteusers=userdata;
	          	/////////////////////////////////////////////////
	           _sendEmailToInvitees(self,organization,usergrp_array,newusers);
	            /////////////////////////////////////////////////
	          }
	        })
	      }else{//if the provided email id is already registered with prodonus
			      /////////////////////////////////////////////////////////////
			     	_sendEmailToInvitees(self,organization,usergrp_array,newusers);
			     	////////////////////////////////////////////////////////////
	    	}
	  }
  })
};

	var _sendEmailToInvitees = function(self,organization,usergrp_array,newusers){
		//validate the org data
		var initialvalue=0;
		EmailTemplateModel.findOne({templatetype:"orgmemberinvite"}).lean().exec(function(err,neworgusertemplate){
	  	if(err){
	    	 self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"Error in db to find invite email templates"}});
	  	}else if(neworgusertemplate){
	  		EmailTemplateModel.findOne({templatetype:"orgmemberonlyinvite"}).lean().exec(function(err,orgusertemplate){
	  			if(err){
	    			 self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"Error in db to find invite email templates"}});
	  			}else if(orgusertemplate){
	  		// logger.emit("log","calling to sendinvitemail");
	          for(var i=0;i<usergrp_array.length;i++){
	          	for(var j=0;j<usergrp_array[i].invites.length;j++){
	          		if(__.contains(newusers, usergrp_array[i].invites[j])){//it is new user
	          			self.emit("sendneorguserinviteemail", usergrp_array[i].invites[j],neworgusertemplate,organization.name,usergrp_array[i].grpname);
	          		}else{//already prodonus registered user
	          			self.emit("sendinvitemail", usergrp_array[i].invites[j],orgusertemplate,organization.name,usergrp_array[i].grpname);	
	          		}	
	          	}
	          }
	          /////////////////////////////////////////
						_addInviteUserToGroup(self,organization,usergrp_array);
						///////////////////////////////////////
	    	}else{
	  				self.emit("failedOrgAdd",{"error":{"code":"ED002","message":"Server setup template issue"}});
	  		}
			})//end of orgmemberonlyinvite
		}
	})
}
				
		

	var _addInviteUserToGroup = function(self,organization,usergrp_array) {
		
		for(var i=0;i<usergrp_array.length;i++){
			////////////////////////////////////////
			addgrpmember(self,organization,usergrp_array[i]);
			////////////////////////////////////////
		}
		////////////////////
		_successfulOrgAdd(self);
		////////////////////
	
	};
	var addgrpmember=function(self,organization,usergrp){
		userModel.find({ email:{ $in :usergrp.invites}},{userid:1}).lean().exec(function(err,user){
			if( err ){
				self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"Error in db to find user"}});
			}else if( user.length==0 ){
				self.emit("failedOrgAdd",{"error":{"code":"AU003","message":"No user exists"}});
			}else{ //add the userid into respective group
				var newuser=[];
				for(var p=0;p<user.length;p++)
				{
					newuser[p]=user[p].userid;
					logger.emit("log","newuser["+p+"]"+user[p].userid);
				}
					orgModel.update({ orgid :organization.orgid,"usergrp.grpname":usergrp.grpname},{$addToSet:{"usergrp.$.grpmembers":{$each:newuser}},$set:{"usergrp.$.invites":""}},function(err,status){
			  	if( err ){
			  		self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"Error in db to update org to add grpmembers"}});
			  	}else if(status==1){
			    // callback("success");
			  		logger.emit("info","new group "+usergrp.grpname+"added");
				  }else {
			   		logger.emit("error","Provided orgid doesnt exists");
			    }
				});//end of orgmodel update
			}
		})
	}


	var _successfulOrgAdd = function(self) {
		//validate the org data
		logger.emit("log","successfulOrgAdd");
		self.emit("successfulOrgAdd",{"success":{"message":"Organization Added Sucessfully"}});
	};


	Organization.prototype.updateOrganization = function(orgid,sessionuserid) {
		var self=this;
		var orgdata=this.organization;
		logger.emit("log",orgdata);
		if(orgdata==undefined){
			self.emit("failedOrgUpdation",{"error":{"code":"AV001","message":"Please provide organizationdata"}});
		}else if(orgdata.subscription!=undefined ||orgdata.payment!=undefined || orgdata.usergrp!=undefined || orgdata.orgid!=undefined ||orgdata.org_logo!=undefined ||orgdata.location!=undefined ){
			self.emit("failedOrgUpdation",{"error":{"code":"ED002","message":"You can not change this information of organization"}});
		}else{
			////////////////////////////////////////
			_updateOrganization(self,orgid,orgdata,sessionuserid);
			///////////////////////////////////////
		}
};

var _updateOrganization=function(self,orgid,orgdata,sessionuserid){
	
	logger.emit("log","_updateOrganization");
	orgModel.update({orgid:orgid},{$set:orgdata},function(err,organizationupdatestatus){
		if(err){
			self.emit("failedOrgUpdation",{"error":{"code":"ED001","message":"Error in db to update user data"}});
		}else if(organizationupdatestatus!=1){
			self.emit("failedOrgUpdation",{"error":{"code":"AU002","message":"Provided orgid is wrong"}});
		}else{
			/////////////////////////////////////
			_updateOrganizationHistory(self,orgid,sessionuserid);
			////////////////////////////////////
		}
	})
}
var _updateOrganizationHistory=function(self,orgid,sessionuserid){
	var orghistorydata=new orgHistoryModel({orgid:orgid,updatedby:sessionuserid});

	orghistorydata.save(function(err,orghistorydata){
		if(err){
			self.emit("failedOrgUpdation",{"error":{"code":"ED001","message":"Error in db to history model update"}});
		}else{
			/////////////////////////////////////
			_successfulOrganizationUpdation(self);
			////////////////////////////////////
		}
	})
}
var _successfulOrganizationUpdation = function(self) {
		//validate the user data
		logger.emit("log","_successfulOrganizationUpdation");
	
		self.emit("successfulOrgUpdation", {"success":{"message":"Organization Updated Successfully"}});
	}
Organization.prototype.deleteOrganization = function(orgid,sessionuserid) {
		var self=this;
		
		
	
		////////////////////////////////////////
		_deleteOrganization(self,orgid,sessionuserid);
		///////////////////////////////////////
		
};

var _deleteOrganization=function(self,orgid,sessionuserid){
	
	logger.emit("log","_deleteOrganization");
	orgModel.update({orgid:orgid},{$set:{status:"deactive"}},function(err,organizationdeletestatus){
		if(err){
			self.emit("failedOrgDeletion",{"error":{"code":"ED001","message":"Error in db to deleteuser data"}});
		}else if(organizationdeletestatus!=1){
			self.emit("failedOrgDeletion",{"error":{"code":"AO002","message":"Provided orgid is wrong"}});
		}else{
			////////////////////////////////////
			_deleteOrganizationHistory(self,orgid,sessionuserid);
			///////////////////////////////////
		}
	})
}
var _deleteOrganizationHistory=function(self,orgid,sessionuserid){
	var orghistorydata=new orgHistoryModel({orgid:orgid,updatedby:sessionuserid});

	

	orghistorydata.save(function(err,orghistorydata){
		if(err){
			self.emit("failedOrgDeletion",{"error":{"code":"ED001","message":"Error in db to history model update"}});
		}else{
			/////////////////////////////////////
			_successfulOrganizationDeletion(self);
			////////////////////////////////////
		}
	})
}
var _successfulOrganizationDeletion = function(self) {
		//validate the user data
		logger.emit("log","_successfulOrganizationDeletion");
	
		self.emit("successfulOrgDeletion", {"success":{"message":"Organization Deleted Successfully"}});
	}
Organization.prototype.getOrganization = function(orgid) {
	var self=this;
	_getOrganization(self,orgid);
};
var _getOrganization=function(self,orgid){

	orgModel.findOne({orgid:orgid,status:"active"},{location:0}).lean().exec(function(err,organization){
		if(err){
			self.emit("failedUserGet",{"error":{"code":"ED001","message":"Error in db to find organizationdata"}});
		}else if(organization){
			 /////////////////////////////////////////////
			_successfulOrganizationGet(self,organization);
			/////////////////////////////////////////////
		}else{
		  self.emit("failedUserGet",{"error":{"code":"AO002","message":"Organization doesnt exists"}});
		}
	})
}
var _successfulOrganizationGet=function(self,organization){
	logger.emit("log","_successfulOrganizationGet");
	self.emit("successfulOrganizationGet", {"success":{"message":"Getting Organization details Successfully","organization":organization}});
}
Organization.prototype.getAllOrganization = function() {
	var self=this;
	//////////////////
	_getAllOrganization(self);
	///////////////////
};
var _getAllOrganization=function(self){
	
	userModel.find({}).lean().exec(function(err,organization){
		if(err){
			self.emit("failedUserGetAll",{"error":{"code":"ED001","message":"Error in db to find all organizations"}});
		}else if(organization.length==0){
			self.emit("failedUserGetAll",{"error":{"code":"AO003","message":"No organization exists"}});
		}else{
			////////////////////////////////////////////////
			_successfulOrganizationGetAll(self,organization);
			///////////////////////////////////////////////
		}
	})
};

var _successfulOrganizationGetAll=function(self,organization){
	logger.emit("log","_successfulOrganizationGetAll");
	self.emit("successfulOrganizationGetAll", {"success":{"message":"Getting Organization details Successfully","organization":organization}});
}
Organization.prototype.getOrgAddressByCriteria = function(OrgCriteriaData,orgid) {
	var self=this;
	//////////////////
	_splitOrgAddressCriteria(self,OrgCriteriaData,orgid);
	///////////////////
};
var _splitOrgAddressCriteria=function(self,OrgCriteriaData,orgid){
	var org_locationtype=[];
	var org_city=[];
	var org_country=[];
	var org_region=[];
	
	var search_criteria={};
	if(OrgCriteriaData.locationtype!=undefined){
		if(S(OrgCriteriaData.locationtype).contains(",")){
			locationtype=S(OrgCriteriaData.locationtype).split(",");
		}else{
			org_locationtype.push(OrgCriteriaData.locationtype);
		}
		// Org_criteriadata.org_locationtype=org_locationtype;
		search_criteria["location.locationtype"]={$in:org_locationtype};
	}
	if(OrgCriteriaData.city!=undefined){
		if(S(OrgCriteriaData.city).contains(",")){
			org_city=S(OrgCriteriaData.city).split(",");
		}else{
			org_city.push(OrgCriteriaData.city);
		}
		search_criteria["location.address.city"]={$in:org_city};
	}
	if(OrgCriteriaData.country!=undefined){
		if(S(OrgCriteriaData.country).contains(",")){
			org_country=S(OrgCriteriaData.country).split(",");
		}else{
			org_country.push(OrgCriteriaData.country);
		}
		search_criteria["location.address.country"]={$in:org_country};
	}
	
	if(OrgCriteriaData.region!=undefined){
		if(S(OrgCriteriaData.region).contains(",")){
			org_region=S(OrgCriteriaData.region).split(",");
		}else{
			org_region.push(OrgCriteriaData.region);
		}
		search_criteria["location.region"]={$in:org_region};
	}
	// console.log(Object.keys(OrgCriteriaData).length);
	
	
	// OrgCriteriaData={org_locationtype:org_locationtype,org_city:org_city,org_country:org_country,org_region:org_region};
	/////////////////////////
  _getOrgAddressByCriteria(self,search_criteria,orgid);
	//////////////////////
}
var _getOrgAddressByCriteria=function(self,search_criteria,orgid){
  
  console.log("orgid"+JSON.stringify(search_criteria));
  orgModel.aggregate([{$match:{orgid:orgid}},{$unwind:"$location"},{$group:{_id:"$location.locationtype",location:{$push:{locid:"$location._id",contacts:"$location.contacts",address:"$location.address",geo:"$location.geo",region:"$location.region",timezone:"$location.timezone"}}}},{$project:{loctype:"$_id",location:1,_id:0}}]
,function(err,orgaddress){
	if(err){
			logger.emit("error",err);
			self.emit("failedGetOrgAddressByCriteria",{"error":{"code":"ED001","message":"Error in db  _getOrgAddressByCriteria to get address"}});
		}else if(orgaddress.length==0){
			self.emit("failedGetOrgAddressByCriteria",{"error":{"code":"A0003","message":"There is no organization address according to your criteria search"}});		
		}else{
			///////////////////////////////////////////////////
			_successfulgetOrgAddressByCriteria(self,orgaddress);
			//////////////////////////////////////////////////
		}
	
	})
}
var _successfulgetOrgAddressByCriteria=function(self,orgaddress){
	logger.emit("log","_successfulgetOrgAddressByCriteria");
	self.emit("successfulGetOrgAddressByCriteria",{"success":{"message":"Organization address getting Successfully","orgaddress":orgaddress}});
}
Organization.prototype.addOrgAddress = function(orgid,orgaddress) {
	var self=this;
	// var orgaddress=self.orgaddress;
	//////////////////////////////////////////////
	_validateOrgAddressData(self,orgaddress,orgid);
	//////////////////////////////////////////////
};
var _validateOrgAddressData=function(self,orgaddress,orgid){
   
	if(orgaddress==undefined){
		self.emit("failedaddOrgAddress",{"error":{"code":"AV001","message":"Please pass orgaddress data to add"}}); 
	}else if(orgaddress.locationtype==undefined){
		self.emit("failedaddOrgAddress",{"error":{"code":"AV001","message":"Please pass locationtype"}}); 		
	}else if(orgaddress.address==undefined){
		self.emit("failedaddOrgAddress",{"error":{"code":"AV001","message":"Please provide address details"}}); 				
	}else if(orgaddress.address.city==undefined){
	 self.emit("failedaddOrgAddress",{"error":{"code":"AV001","message":"Please provide orgaddress city"}}); 				
	}else if(orgaddress.address.country==undefined){
		self.emit("failedaddOrgAddress",{"error":{"code":"AV001","message":"Please provide coutry for orgaddress"}}); 				
	}else if(orgaddress.address.state==undefined){
		self.emit("failedaddOrgAddress",{"error":{"code":"AV001","message":"Please provide provinence details"}}); 					
	}else{
		///////////////////////////////////////
     _addOrgAddress(self,orgaddress,orgid);
		///////////////////////////////////////
	}
}
var _addOrgAddress=function(self,orgaddress,orgid){
	orgModel.update({orgid:orgid},{$push:{location:orgaddress}},function(err,orgaddstatus){
		if(err){
			self.emit("failedaddOrgAddress",{"error":{"code":"ED001","message":"Error in db to add organization address"}});
		}else if(orgaddstatus!=1){
			self.emit("failedaddOrgAddress",{"error":{"code":"AO002","message":"Provides userd is wrong to add organization address"}});			
		}else{
			///////////////////////////////
			_successfulOrgAddressAdd(self)	
			//////////////////////////////
		}
	})
}
var _successfulOrgAddressAdd=function(self){
	logger.emit("log","_successfulOrgAddressAdd");
	self.emit("successfuladdOrgAddress",{"success":{"message":"Organization Address Added Successfully"}});
}
Organization.prototype.updateOrgAddress = function(orgid,orgaddressid,orgaddress) {
	var self=this;
	// var orgaddress=self.orgaddress;
	//////////////////////////////////////////////
	_validateUpdateOrgAddressData(self,orgid,orgaddressid,orgaddress);
	//////////////////////////////////////////////
};
var _validateUpdateOrgAddressData=function(self,orgid,orgaddressid,orgaddress){
   
	if(orgaddress==undefined){
		self.emit("failedUpdateAddress",{"error":{"code":"AV001","message":"Please pass orgaddress data to add"}}); 
	 }else  if(orgaddress.address==undefined){
		self.emit("failedUpdateAddress",{"error":{"code":"AV001","message":"Please provide address details"}}); 				
	}else if(orgaddress.address.city==undefined){
	 self.emit("failedUpdateAddress",{"error":{"code":"AV001","message":"Please provide orgaddress city"}}); 				
	}else if(orgaddress.address.country==undefined){
		self.emit("failedUpdateAddress",{"error":{"code":"AV001","message":"Please provide coutry for orgaddress"}}); 				
	}else if(orgaddress.address.state==undefined){
		self.emit("failedUpdateAddress",{"error":{"code":"AV001","message":"Please provide provinence details"}}); 					
	}else{
		///////////////////////////////////////
    	_updateOrgAddress(self,orgaddress,orgid,orgaddressid);
		///////////////////////////////////////
	}
}
var _updateOrgAddress=function(self,orgaddress,orgid,orgaddressid){
	orgModel.update({orgid:orgid,"location._id":orgaddressid},{$pull:{location:{_id:orgaddressid}}},function(err,orgaddrespullstatus){
		if(err){
			self.emit("failedUpdateAddress",{"error":{"code":"ED001","message":"Error in db to update organization address"}});
		}else if(orgaddrespullstatus!=1){
			self.emit("failedUpdateAddress",{"error":{"code":"AO002","message":"Provides orgid or orgaddress id is wrong to update organization address"}});			
		}else{
			orgModel.update({orgid:orgid},{$push:{location:orgaddress}},function(err,orgaddrespushstatus){
				if(err){
					self.emit("failedUpdateAddress",{"error":{"code":"ED001","message":"Error in db to update organization address"}});		
				}else if(orgaddrespushstatus!=1){
					self.emit("failedUpdateAddress",{"error":{"code":"AO002","message":"Provides orgid or orgaddress id is wrong to update organization address"}});				
				}else{
					///////////////////////////
					_successfulOrgUpdateressAdd(self)
					//////////////////////////
				}
			})
		}
	})
}
var _successfulOrgUpdateressAdd=function(self){
	logger.emit("log","successfulUpdateAddress");
	self.emit("successfulUpdateAddress",{"success":{"message":"Organization Address Updated Successfully"}});
}
Organization.prototype.deleteOrgAddress = function(orgid,orgaddressid) {
	var self=this;
	// var orgaddress=self.orgaddress;
	//////////////////////////////////////////////
	_deleteOrgAddress(self,orgid,orgaddressid);
	//////////////////////////////////////////////
};
var _deleteOrgAddress=function(self,orgid,orgaddressid){
	orgModel.update({orgid:orgid,"location._id":orgaddressid},{$pull:{location:{_id:orgaddressid}}},function(err,orgaddrespullstatus){
		if(err){
			self.emit("failedDeleteOrgAddress",{"error":{"code":"ED001","message":"Error in db to delete organization address"}});
		}else if(orgaddrespullstatus!=1){
			self.emit("failedDeleteOrgAddress",{"error":{"code":"AO002","message":"Provides orgid or orgaddressid is wrong to delete organization address"}});			
		}else{
			////////////////////////////////
			_successfulDeleteAddress(self);
			/////////////////////////////////
		}
	})
}
var _successfulDeleteAddress=function(self){
	logger.emit("log","successfulDeleteAddress");
	self.emit("successfulDeleteOrgAddress",{"success":{"message":"Organization Address Deleted Successfully"}});
}

Organization.prototype.deleteOrgImage = function(orgimageids,orgid) {
	var self=this;
	if(orgimageids==undefined){
		self.emit("failedDeleteOrgImage",{"error":{"code":"AV001","message":"Please provide orgimageids "}});
	}else if(orgimageids.length==0){
		self.emit("failedDeleteOrgImage",{"error":{"message":"Given orgimageids is empty "}});
	}else{
		///////////////////////////////////////////////////////////////////
	_deleteOrgImage(self,orgimageids,orgid);
	/////////////////////////////////////////////////////////////////	
	}
	
};
var _deleteOrgImage=function(self,orgimageids,orgid){
	 var org_imagearray=[];
	orgimageids=S(orgimageids);
	//db.products.update({"product_images.imageid":{$in:["7pz904msymu","333"]}},{$pull:{"product_images":{imageid:{$in:["7pz904msymu","333"]}}}});
   if(orgimageids.contains(",")){
   		org_imagearray=orgimageids.split(",");
   }else{
   		org_imagearray.push(orgimageids.s);
   }
	orgModel.update({orgid:orgid,"org_images.imageid":{$in:org_imagearray}},{$pull:{org_images:{imageid:{$in:org_imagearray}}}},function(err,deleteimagestatus){
		if(err){
			self.emit("failedDeleteOrgImage",{"error":{"code":"ED001","message":"function:_deleteOrgImage\nError in db to "}});
		}else if(deleteimagestatus==0){
			self.emit("failedDeleteOrgImage",{"error":{"message":"orgid or given orgimageids is wrong "}});
		}else{
			//////////////////////////////////
			_successfulDeleteOrgImage(self);
			/////////////////////////////////////
		}
	})
}
var _successfulDeleteOrgImage=function(self){
	logger.emit("log","_successfulDeleteOrgImage");
	self.emit("successfulDeleteOrgImage",{"success":{"message":"Delete Organizations Images Successfully"}});
}
Organization.prototype.orgInvites=function(orgid,usergrp){
	var self=this;
	/////////////////////
	_validateOrgInvites(self,orgid,usergrp);

}
var _validateOrgInvites=function(self,orgid,usergrp){

	if(usergrp==undefined){
		self.emit("failedOrgInvites",{"error":{"code":"AV001","message":"Please pass usergrp data"}});
	}else if(usergrp.grpname==undefined){
		self.emit("failedOrgInvites",{"error":{"code":"AV001","message":"Please pass grpname"}});
	}else if(usergrp.invites==undefined){
		self.emit("failedOrgInvites",{"error":{"code":"AV001","message":"Please pass invites"}});
	}else if(usergrp.invites.trim().length==0){
		self.emit("failedOrgInvites",{"error":{"code":"AV001","message":"plese fill invites emails"}});
	}else{
		//////////////////
		_addOrgInvitees(self,orgid,usergrp)
		//////////////////
	}

}
var _addOrgInvitees = function(self,orgid,usergrp) {
	var invitees=[]
	var j=0;
	//to add invtiees email into array group by grpname
	var invites=S(usergrp.invites);
	if(invites.contains(",")){
		invitees=invites.split(",");
	}else{
		invitees.push(invites.s);
	}
	console.log("invitee"+invitees);
	logger.emit("log","invitee"+invitees);
	userModel.find({email:{$in:invitees}},{email:1}).lean().exec(function(err,user){
	  if(err){
    	self.emit("failedOrgInvites",{"error":{"code":"ED001","message":"Error in db to find users"+err}});
    }else {
    		//if one email id already exist in database
    		var existingusers=[];
    	for(var i=0;i<user.length;i++)
	    {
	    	existingusers.push(user[i].email); 	
	    }
      	
      	var newusers=__.difference(invitees,existingusers);
        logger.emit("log","newusers:"+newusers);
        logger.emit("log","existingusers"+existingusers);
      	////////////////////////////////
        
      	//////////////////////////////

      //invitees only contain user not exist in database
      orgModel.findOne({orgid:orgid},function(err,organization){
				if(err){
					self.emit("failedOrgInvites",{"error":{"code":"ED001","message":"Error in db to find org"+err}});
				}else if(!organization){
					self.emit("failedOrgInvites",{"error":{"code":"AO001","message":"provided orgid is wrong"}});
				}else{
					 
			    	if(newusers.length>0){//
				    	var userdata=[];
					    for(var i=0;i<newusers.length;i++)
					    {
					      userdata[i]={email:newusers[i],org:{orgid:orgid,isAdmin:false,orgtype:organization.orgtype},username:newusers[i]};
					    }
							userModel.create(userdata,function(err,inviteuserdata){
								if(err){
								  self.emit("failedOrgInvites",{"error":{"code":"ED001","message":"Error in db to create invite users"+err}});
								}else if(inviteuserdata){
									logger.emit("log",inviteuserdata);
									var inviteusers=userdata;
									/////////////////////////////////////////////////
								 _sendInviteEmailToOrgInvitees(self,newusers,existingusers,usergrp.grpname,organization);
								  /////////////////////////////////////////////////
								}
							})
						}else{//if provided invites already exists 
							logger.emit("log","provided invites emails already exists");
							//////////////////////////////////////////////////////////////////////////////////////
							_sendInviteEmailToOrgInvitees(self,newusers,existingusers,usergrp.grpname,organization);
							/////////////////////////////////////////////////////////////////////////////
						}
    			}
			})
		};
	})
}


	var _sendInviteEmailToOrgInvitees = function(self,newusers,existingusers,grpname,organization) {
		//validate the org data
		var initialvalue=0;
		logger.emit("log","_sendInviteEmailToOrgInvitees");
			EmailTemplateModel.findOne({templatetype:"orgmemberinvite"}).lean().exec(function(err,neworgusertemplate){
	  	if(err){
	  			logger.emit("log","2");
	    	 self.emit("failedOrgInvites",{"error":{"code":"ED001","message":"Error in db to find invite email templates"}});
	  	}else if(neworgusertemplate){
	  		EmailTemplateModel.findOne({templatetype:"orgmemberonlyinvite"}).lean().exec(function(err,orgusertemplate){
	  			if(err){
	  				logger.emit("log","3");
	    			 self.emit("failedOrgInvites",{"error":{"code":"ED001","message":"Error in db to find invite email templates"}});
	  			}else if(orgusertemplate){
	  	 			for(var i=0;i<newusers.length;i++){
							/////////////////////////////////////////////////////////////////////////////////
							self.emit("sendorginviteandverification", newusers[i],neworgusertemplate,organization.name,grpname);
							////////////////////////////////////////////////////////////////////////////////	
			  		}
			  		for(var j=0;j<existingusers.length;j++)
			  		{
			  			/////////////////////////////////////////////////////////////////////////////////
							self.emit("sendorginvites", existingusers[j],orgusertemplate,organization.name,grpname);
							////////////////////////////////////////////////////////////////////////////////
			  		}	
			  		logger.emit("log","1");
			  	///////////////////////////////////////////
			  	_AddUserIntoOrgGroup(self,newusers,existingusers,organization,grpname);
			  	///////////////////////////////////////////
				}else{
					logger.emit("log","4");
			  	self.emit("failedOrgInvites",{"error":{"code":"ED002","message":"Server setup template issue"}});
				}
			})
		}else{
			logger.emit("log","5");
			self.emit("failedOrgInvites",{"error":{"code":"ED002","message":"Server setup template issue"}});
		}
	})
}
	
var _AddUserIntoOrgGroup=function(self,newusers,existingusers,organization,grpname){
	var useremails=__.union(newusers,existingusers);
	logger.emit("log","useremails"+useremails);
	userModel.find({email:{$in:useremails}},{userid:1},function(err,user){
		if(err){
			self.emit("failedOrgInvites",{"error":{"code":"ED001","message":"function:_AddUserIntoOrgGroup\nError in db to find user"+err}});
		}else if(user.length==0){
			self.emit("failedOrgInvites",{"error":{"code":"AU003","message":"No User Exists"}});		
		}else {
			var userids=[];
			for(var i=0;i<user.length;i++){
				userids.push(user[i].userid);
			}
		   orgModel.update({orgid:organization.orgid,"usergrp.grpname":grpname},{$addToSet:{"usergrp.$.grpmembers":{$each:userids}}},function(err,orggrpmemberaddstatus){
		   		if(err){
		   			self.emit("failedOrgInvites",{"error":{"code":"ED001","message":"function:_AddUserIntoOrgGroup\nOrg find to grp exists"+err}});
		   		}else if(orggrpmemberaddstatus==1){
		   				///////////////////////////////////////
		   				_succesfullOrgMembersInvites(self);
		   				//////////////////////////////////////
		   		}else{
		   			orgModel.update({orgid:organization.orgid},{$push:{usergrp:{grpname:grpname,grpmembers:userids}}},function(err,newgrpaddstatus){
		   				if(err){
		   					self.emit("failedOrgInvites",{"error":{"code":"ED001","message":"function:_AddUserIntoOrgGroup\nnewgrpaddstatus	"+err}});
		   				}else if(newgrpaddstatus==0){
		   					self.emit("failedOrgInvites",{"error":{"code":"AO002","message":"function:_AddUserIntoOrgGroup\nOrgid is Wrong"}});
		   				}else{	
						///////////////////////////////////////
		   				_succesfullOrgMembersInvites(self);
		   				//////////////////////////////////////	
		   				}
		   			})
		   		}
		   })
		}	
	})

}
var _succesfullOrgMembersInvites=function(self){
	logger.emit("log","_succesfullOrgMembersInvites");
	self.emit("successfulOrgInvites",{"success":{"message":"Organization Invites sent successfully"}});

}
Organization.prototype.sendOrgCustomerInvites=function(orgid,orgcustomerinvites,sessionuserid){
	var self=this;
	/////////////////////
	_validateOrgCustomerInvites(self,orgid,orgcustomerinvites,sessionuserid);
}
var _validateOrgCustomerInvites=function(self,orgid,orgcustomerinvites,sessionuserid){
	if(orgcustomerinvites==undefined){
		self.emit("failedOrgCustomerInvites",{"error":{"code":"AV001","message":"Please pass other orgcustomerinvites  data"}});
	}else if(orgcustomerinvites.length==0){
		self.emit("failedOrgCustomerInvites",{"error":{"code":"AV001","message":"Please pass atleast one organization details to send invites"}});
	}else{
		///////////////////////////////////
    _sendOrgCustomerInvitation(self,orgid,orgcustomerinvites,sessionuserid);
		///////////////////////////////
	}
}
var _sendOrgCustomerInvitation=function(self,orgid,orgcustomerinvites,sessionuserid){
	orgModel.findOne({orgid:orgid},function(err,organization){
				if(err){
					self.emit("failedOrgCustomerInvites",{"error":{"code":"ED001","message":"Error in db to find org"+err}});
				}else if(!organization){
					self.emit("failedOrgCustomerInvites",{"error":{"code":"AO001","message":"provided orgid is wrong"}});
				}else{
					userModel.findOne({userid:sessionuserid},function(err,user){
						if(err){
							self.emit("failedOrgCustomerInvites",{"error":{"code":"ED001","message":"_sendOtherOrgInvitation DbError"+err}});
						}else if(!user){
							self.emit("failedOrgCustomerInvites",{"error":{"code":"AU003","message":"Userid is Wrong"}});	
						}else{
							EmailTemplateModel.findOne({templatetype:"orgcustomerinvite"},function(err,orgcustomerginvite_emailtemplate){
								if(err){
									self.emit("failedOrgCustomerInvites",{"error":{"code":"ED001","message":"Email template"+err}});	
								}else if(!orgcustomerginvite_emailtemplate){
									self.emit("failedOrgCustomerInvites",{"error":{"message":"Email template"+err}});	
								}else{
									for(var i=0;i<orgcustomerinvites.length;i++)
									{
										if(orgcustomerinvites[i].email!=undefined){
							  			self.emit("sendinviteorgcustomer",orgcustomerginvite_emailtemplate,orgcustomerinvites[i],user,organization);
							  		}
									}
									///////////////////////////////////////////////////////////////
									_addOrganizationCustomerInviteIntoBusinessOpportunity(self,orgcustomerinvites,user);
									////////////////////////////////////////////////////////////

								}
							})//end of email template
						}
					})//end of user find
				}
			})
	}
var _addOrganizationCustomerInviteIntoBusinessOpportunity=function(self,orgcustomerinvites,user){

 var business_opportunity=[];
	for(var i=0;i<orgcustomerinvites.length;i++)
	{
		if(orgcustomerinvites[i].email!=undefined){
			business_opportunity.push({invitetype:"orgcustomer",from:user.email,to:orgcustomerinvites[i].email,fromusertype:user.usertype});
		}
	}
 	BusinessOpportunityModel.create(business_opportunity,function(err,business_opportunitydata){
	 	if(err){
	 		self.emit("failedOrgCustomerInvites",{"error":{"code":"ED001","message":"Business Opportunity"+err}});	
	 	}else{
	 		/////////////////////////////////////////////////
	 		_successfullOrgCustomerInvites(self);
	 		///////////////////////////////////////////////
	 	}
 	})
}
var _successfullOrgCustomerInvites=function (self) {
	logger.emit("log","_successfullOrgCustomerInvites");
	self.emit("successfulOrgCustomerInvites",{"success":{"message":"Organization customer invitation sent Successfully"}});
}
	
	