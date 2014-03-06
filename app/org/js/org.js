var util = require("util");
var events = require("events");
var userModel = require('../../user/js/user-model');
var orgModel=require("./org-model");
var logger=require("../../common/js/logger");
var S=require("string");
var productModel=require("../../product/js/product-model");
var EmailTemplateModel=require('../../common/js/email-template-model');
var orgHistoryModel=require("./org-history-model");
var __=require("underscore");
var SubscriptionModel=require("../../subscription/js/subscription-model");
var verificationTokenModel = require('../../common/js/verification-token-model');
var BusinessOpportunityModel=require("../../businessopportunity/js/business-opportunity-model");
var commonapi=require("../../common/js/common-api");
var CONFIG = require('config').Prodonus;
var PaymentModel=require("../../subscription/js/payment-model");
var AWS = require('aws-sdk');
AWS.config.update({accessKeyId:'AKIAJOGXRBMWHVXPSC7Q', secretAccessKey:'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'});
AWS.config.update({region:'ap-southeast-1'});
var s3bucket = new AWS.S3();
var Organization = function(organizationdata) {
	this.organization=organizationdata;
};
var MyObjectId = require('mongoose').Types.ObjectId;

//this function is used to remvoe duplication element from json array
var email_providerlist=["gmail","yahoo","live","hotmail","ymail","rediff"];
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
		  }else if(organizationdata.orgtype=="manufcaturer" && organizationdata.terms==undefined){
		  	self.emit("failedOrgAdd",{"error":{"code":"AV001","message":"please agree the terms and condition"}});
		  }else if(organizationdata.orgtype=="manufcaturer" && organizationdata.terms==false ){
		  	self.emit("failedOrgAdd",{"error":{"code":"AV001","message":"please agree the terms and condition"}});
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
					//////////////////////////////////////////////////////////////////////
					_applyDefulatOrganizationTrialPlan(self,organizationdata,sessionuserid);
					///////////////////////////////////////////////////////////////////
					
				
				}else{
					self.emit("failedOrgAdd",{"error":{"code":"AO001","message":"You can add only one organization"}});
				}
		})
	}
var _applyDefulatOrganizationTrialPlan=function(self,organizationdata,sessionuserid){
	SubscriptionModel.findOne({plantype:S(organizationdata.orgtype).toLowerCase().s,"planpaymentcommitment.amount":0},function(err,subscription){
		if(err){
			logger.emit("error","Database Issue:_applyDefulatOrganizationTrialPlan "+err);
		  self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"Database issue"}});
		}else if(!subscription){
			self.emit("failedOrgAdd",{"error":{"code":"AS001","message":"trial plan for "+organizationdata.orgtype+" does'nt exists"}});
		}else{
			var planperioddescription={quarterly:3,monthly:1,yearly:12};
			var planperiod=planperioddescription[subscription.planpaymentcommitment.commitmenttype];
			logger.emit('log',"planperiod"+planperiod);

			var currentdate=new Date();
			// var expirydate=new Date(currentdate.setDate(currentdate.getMonth()+3));
			var expirydate=new Date(new Date(currentdate).setMonth(currentdate.getMonth()+planperiod));
			var subscription_set={planid:subscription.planid,planstartdate:currentdate,planexpirydate:expirydate};
			var payment_data=new PaymentModel({userid:sessionuserid,price:subscription.planpaymentcommitment.amount});
			payment_data.save(function(err,payment){
				if(err){
					logger.emit("error","Database Issue:_applyDefulatOrganizationTrialPlan "+err);
					self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"Database Issue"}});
				}else{
					organizationdata.subscription=subscription_set;
					organizationdata.payment={paymentid:payment.paymentid}
					//////////////////////////////////////////////////////////////////////
					_addOrganization(self,organizationdata,sessionuserid);
					////////////////////////////////////////////////////////////////////
				}
			})
		}
	})
}
	var _addOrganization = function(self,organizationdata,sessionuserid,subscriptiondata) {
		//validate the org data
        // organizationdata.subscription={planid:subscriptiondata.planid};
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
    var organizationsubscription={planid:organization.subscription.planid,planstartdate:new Date(organization.subscription.planstartdate),planexpirydate:new Date(organization.subscription.planexpirydate)};
		userModel.update({userid:sessionuserid},{$set:{payment:{paymentid:organization.payment.paymentid},subscription:organizationsubscription,usertype:S(organization.orgtype).toLowerCase().s,org:{orgid:organization.orgid,isAdmin:true,orgtype:organization.orgtype}}},function(err,userupdatestatus){
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
						userdata[i]={email:newusers[i],username:newusers[i],usertype:S(organization.orgtype).toLowerCase().s,org:{orgid:organization.orgid,orgtype:organization.orgtype,isAdmin:false,orgname:organization.name},subscription:{planid:organization.subscription.planid}};
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
			//////////////////////////////
			_orgMemberRemove(self,orgid);
			/////////////////////////
			/////////////////////////////////////
			_successfulOrganizationDeletion(self);
			////////////////////////////////////
		}
	})
}
var _orgMemberRemove=function(self,orgid){
	userModel.update({"org.orgid":orgid},{$set:{status:"deactive"}},{multi:true},function(err,deleteorgmemberstatus){
		if(err){
			logger.emit("error","Database Issue _orgMemberRemove orgid:"+orgid+":"+err)
			self.emit("failedOrgDeletion",{"error":{"code":"ED001","message":"Database Issue"}});
		}else if(deleteorgmemberstatus==0){
			// logger.emit("error","Database Issue _orgMemberRemove orgid:"+orgid+":"+err)
			self.emit("failedOrgDeletion",{"error":{"message":"There is not organization member exists"}});
		}else{
			///////////////////////////////
			_sendOrgRemoveNotificationToOrgMember(self,orgid);
			////////////////////////////
			/////////////////////////////////////
			_allProductRemove(self,orgid);
			///////////////////////////////////
			
		}
	})
}
var _sendOrgRemoveNotificationToOrgMember=function(self,orgid){
	orgModel.findOne({orgid:orgid},function(err,organization){
		if(err){
			logger.error("error","Database Issue /_sendOrgRemoveNotificationToOrgMember"+err)
		}else if(!organization){
			logger.emit("error"," _sendOrgRemoveNotificationToOrgMember orgid is wrong ")
		}else{
			var orggroupmembers=[];
			var usergrp=organization.usergrp;
			for(var i=0;i<usergrp.length;i++){
				var grpmembers=usergrp[i].grpmembers;
				for(var j=0;j<grpmembers.length;j++){
					orggroupmembers.push(grpmembers[j]);
				}
			}
			userModel.find({userid:{$in:orggroupmembers}},function(err,orgusers){
				if(err){
					logger.error("error","Database Issue /_sendOrgRemoveNotificationToOrgMember"+err)
				}else if(orgusers.length==0){
					logger.emit("log","There is no organization members to send notification");
				}else{
					var orguserdata=[];
					for(var i=0;i<orgusers.length;i++){
						if(orgusers[i].firstname==undefined){
							orguserdata.push({name:orgusers[i].username,email:orgusers[i].email,orgname:orgusers[i].org.orgname});
						}else{
							orguserdata.push({name:orgusers[i].firstname,email:orgusers[i].email,orgname:orgusers[i].org.orgname});
						}
						EmailTemplateModel.findOne({templatetype:"orgdeletenotification"},function(err,emailtemplate){
							if(err){
								logger.error("error","Database Issue fun:_sendOrgRemoveNotificationToOrgMember "+err);
							}else if(!emailtemplate){
								logger.error("error","emailtemplate for orgdeletenotification doesnt exists");
							}else{
								for(var i=0;i<orguserdata.length;i++){
									self.emit("orgdeletenotification",orguserdata[i],emailtemplate);
								}
							}
						})
					}
				}
			})
		}
	})
}
var _allProductRemove=function(self,orgid){
	productModel.update({orgid:orgid},{$set:{status:"deactive"}},{multi:true},function(err,allorgproductdeletestatus){
		if(err){
			logger.emit("error","Database Issue _allProductRemove orgid:"+orgid+":"+err)
			self.emit("failedOrgDeletion",{"error":{"code":"ED001","message":"Database Issue"}});
		}else if(allorgproductdeletestatus==0){
			self.emit("failedOrgDeletion",{"error":{"message":"There is no organization product exists"}});
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

	orgModel.findOne({orgid:orgid,status:"active"},{location:0,subscription:0,payment:0,usergrp:0}).lean().exec(function(err,organization){
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
	orgModel.findAndModify({orgid:orgid,"org_images.imageid":{$in:org_imagearray}},[],{$pull:{org_images:{imageid:{$in:org_imagearray}}}},{new:false},function(err,deleteimagestatus){
		if(err){
			self.emit("failedDeleteOrgImage",{"error":{"code":"ED001","message":"function:_deleteOrgImage\nError in db to "}});
		}else if(!deleteimagestatus){
			self.emit("failedDeleteOrgImage",{"error":{"message":"orgid or given orgimageids is wrong "}});
		}else{
			var org_images=deleteimagestatus.org_images;
			// org_images=JSON.parse(org_images);
			logger.emit("log","dd"+JSON.stringify(org_images));
			var object_array=[];
			for(var i=0;i<org_images.length;i++){
				object_array.push({Key:org_images[i].key});
				console.log("test"+org_images[i]);
			}
			logger.emit("log","object_array:"+JSON.stringify(object_array));
			var delete_aws_params={
				Bucket: org_images[0].bucket, // required
  			Delete: { // required
    				Objects: object_array,
      			Quiet: true || false
      		}
      	}
      	logger.emit('log',"delete_aws_params:"+JSON.stringify(delete_aws_params));
      s3bucket.deleteObjects(delete_aws_params, function(err, data) {
			  if (err){
			  	logger.emit("error","Org images not deleted from amazon s3 orgid:"+orgid)
			  } else{
			  	logger.emit("log","Organization images deleted from amazon s3 orgid:"+orgid);
			  } 
			})
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
					      userdata[i]={email:newusers[i],org:{orgid:orgid,isAdmin:false,orgtype:organization.orgtype,orgname:organization.name},username:newusers[i]};
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
Organization.prototype.sendOtherOrgInvites=function(orgid,otherorginvites,sessionuserid){
	var self=this;
	/////////////////////
	_validateOtherOrgInvites(self,orgid,otherorginvites,sessionuserid);
}
var _validateOtherOrgInvites=function(self,orgid,otherorginvites,sessionuserid){
	if(otherorginvites==undefined){
		self.emit("failedOtherOrgInvites",{"error":{"code":"AV001","message":"Please pass other org invites data"}});
	}else if(otherorginvites.length==0){
		self.emit("failedOtherOrgInvites",{"error":{"code":"AV001","message":"Please pass atleast one organization details to send invites"}});
	}else{
		///////////////////////////////////
    _sendOtherOrganizationInvitation(self,orgid,otherorginvites,sessionuserid);
		///////////////////////////////
	}
}
var _sendOtherOrganizationInvitation=function(self,orgid,otherorginvites,sessionuserid){
	orgModel.findOne({orgid:orgid},function(err,organization){
				if(err){
					self.emit("failedOtherOrgInvites",{"error":{"code":"ED001","message":"Error in db to find org"+err}});
				}else if(!organization){
					self.emit("failedOtherOrgInvites",{"error":{"code":"AO001","message":"provided orgid is wrong"}});
				}else{
					userModel.findOne({userid:sessionuserid},function(err,user){
						if(err){
							self.emit("failedOtherOrgInvites",{"error":{"code":"ED001","message":"_sendOtherOrgInvitation DbError"+err}});
						}else if(!user){
							self.emit("failedOtherOrgInvites",{"error":{"code":"AU003","message":"Userid is Wrong"}});	
						}else{
							EmailTemplateModel.findOne({templatetype:"otherorginvite"},function(err,otherorginvite_emailtemplate){
								if(err){
									self.emit("failedOtherOrgInvites",{"error":{"code":"ED001","message":"Email template"+err}});	
								}else if(!otherorginvite_emailtemplate){
									self.emit("failedOtherOrgInvites",{"error":{"message":"Email template"+err}});	
								}else{
									for(var i=0;i<otherorginvites.length;i++)
									{
										var host=S(otherorginvites[i].email).substring(otherorginvites[i].email.indexOf("@")+1,otherorginvites[i].email.indexOf(".",otherorginvites[i].email.indexOf("@")))
										logger.emit("log",email_providerlist.indexOf(host.s));
										if(otherorginvites[i].email!=undefined && email_providerlist.indexOf(host.s)<0){
							  			self.emit("sendotherorginvite",otherorginvite_emailtemplate,otherorginvites[i],user,organization);
							  		}
									}
									///////////////////////////////////////////////////////////////
									_addOtherOrganizationInviteIntoBusinessOpportunity(self,otherorginvites,user);
									////////////////////////////////////////////////////////////

								}
							})//end of email template
						}
					})//end of user find
				}
			})
	}
var _addOtherOrganizationInviteIntoBusinessOpportunity=function(self,otherorginvites,user){

 var business_opportunity=[];

	for(var i=0;i<otherorginvites.length;i++)
	{
		var host=S(otherorginvites[i].email).substring(otherorginvites[i].email.indexOf("@")+1,otherorginvites[i].email.indexOf(".",otherorginvites[i].email.indexOf("@")))
		if(otherorginvites[i].email!=undefined && email_providerlist.indexOf(host.s)<0){
			business_opportunity.push({invitetype:"business",from:user.email,to:otherorginvites[i].email,fromusertype:user.usertype,orgname:otherorginvites[i].orgname});
		}
	}
 	BusinessOpportunityModel.create(business_opportunity,function(err,business_opportunitydata){
	 	if(err){
	 		self.emit("failedOtherOrgInvites",{"error":{"code":"ED001","message":"Business Opportunity"+err}});	
	 	}else{
	 		/////////////////////////////////////////////////
	 		_successfullOtherOrgInvites(self);
	 		///////////////////////////////////////////////
	 	}
 	})
}
var _successfullOtherOrgInvites=function (self) {
	logger.emit("log","_successfullOtherOrgInvites");
	self.emit("successfulOtherOrgInvites",{"success":{"message":"Other Organization invitation sent Successfully"}});
}
Organization.prototype.getMyGroupMembers=function(orgid){
	var self=this;
	/////////////////////
	_getMyGroupMembers(self,orgid);
}	
var _getMyGroupMembers=function(self,orgid){
	 orgModel.findOne({orgid:orgid},{usergrp:1},function(err,organization){
	 	if(err){
	 		self.emit("failedGetMyGroupMembers",{"error":{"code":"ED001","message":"Business _getMyGroupMembers"+err}});	
	 	}else if(!organization){
	 		self.emit("failedGetMyGroupMembers",{"error":{"code":"AO002","message":"wrong orgid"}});	
	 	}else{
	 		
	 		var usergrpmembers=[];
	 		var initialvalue=0;
	 		self.emit("getgroupmembers",organization.usergrp,usergrpmembers,initialvalue);
	 // 		logger.emit("log","grpmembers"+grpmembers);
	 // 		userModel.find({userid:{$in:grpmembers}},{userid:1,username:1,email:1,profile_pic:1},function(err,useroforg){
	 // 			if(err){
	 // 				self.emit("failedGetMyGroupMembers",{"error":{"code":"ED001","message":"_getMyGroupMembers _getMyGroupMembers"+err}});	
	 // 			}else if(useroforg.length==0){
	 // 				self.emit("failedGetMyGroupMembers",{"error":{"code":"ED001","message":"No Group Members exists"}});	
	 // 			}else{
	 // 				// logger.emit("log",useroforg)
	 			
	 // 				// var user=JSON.parse(user);
	 // 				var user=[]
	 // 				for(var i=0;i<useroforg.length;i++){
	 // 					user.push(useroforg[i]);
	 // 				}
	 // 				for(var i=0;i<usergrp.length;i++)
	 // 				{
	 // 					var grpname=usergrp[i].grpname;
	 // 					console.log("grpname"+grpname)
	 // 					for(var j=0;j<user.length;j++)
	 // 					{	
	 // 						logger.emit("log","Hi"+usergrp[i].grpmembers.indexOf(user[j].userid))
	 // 						if(usergrp[i].grpmembers.indexOf(user[j].userid)==0){
	 // 							logger.emit("log","Test");
	 // 							user[i].grpname=grpname;
	 // 							logger.emit("log","HI"+user[i].grpname);
	 // 						}
	 // 					}
	 // 				}
	 // 				// var user=JSON.parse(useroforg);
	 // 			  logger.emit("log","grp"+JSON.stringify(user));
	 // 			}
	 // 		})
	 	}
	 })
}
Organization.prototype.successfullGetGroupMembers=function(usergrp){
	var self=this;
	self.emit("successfulGetMyGroupMembers",{"success":{"message":"Group Members Getting Successfully","usergrp":usergrp}});
}	
Organization.prototype.removeOrgGroupMember=function(user,orgid,grpid,usermemberid){
	var self=this;
	/////////////////////
	_checkGropMemberIsExistOrNot(self,user,orgid,grpid,usermemberid);
}	
var _checkGropMemberIsExistOrNot=function(self,user,orgid,grpid,usermemberid){

	logger.emit("log","usermemberid"+usermemberid);
	orgModel.aggregate({$unwind:"$usergrp"},{$match:{"usergrp.grpmembers":usermemberid,orgid:orgid}},{$project:{name:1,usergrp:1}},function(err,usergrps){
		if(err){
			self.emit("failedRemoveOrgGroupMembers",{"error":{"code":"ED001","message":"Database Server Issue"+err}}); 
		}else if(usergrps.length==0){
			self.emit("failedRemoveOrgGroupMembers",{"error":{"code":"AU003","message":"Userid is wrong"}}); 
		}else{
			if(usergrps.length==1){
				////////////////////////////////////
				_deleteUserAndRemoveFromOrg(self,user,orgid,grpid,usermemberid,usergrps[0].usergrp.grpname,usergrps[0].name)	;
				//////////////////////////////////
			}else{
				/////////////////////////////////
				_removeFromOrganizationGroup(self,user,orgid,grpid,usermemberid)
				//////////////////////////////
			}
		}
	});
}
var _deleteUserAndRemoveFromOrg=function(self,user,orgid,grpid,usermemberid,grpname,orgname){
	userModel.update({userid:usermemberid},{$set:{status:"deactive"}},function(err,deleteorguserstatus){
		if(err){
			self.emit("failedRemoveOrgGroupMembers",{"error":{"code":"ED001","message":"Database Server Issue"+err}}); 
		}else if(!deleteorguserstatus){
			self.emit("failedRemoveOrgGroupMembers",{"error":{"code":"AU003","message":"userid is wrong"}}); 			
		}else{
			orgModel.update({orgid:orgid,"usergrp.grpmembers":usermemberid,"usergrp._id":grpid},{$pull:{"usergrp.$.grpmembers":usermemberid}},function(err,orguserremovestatus){
				if(err){
					self.emit("failedRemoveOrgGroupMembers",{"error":{"code":"ED001","message":"Database Server Issue"+err}}); 
				}else if(orguserremovestatus==0){
					self.emit("failedRemoveOrgGroupMembers",{"error":{"message":"orgid is wrong"}}); 
				}else{
					/////////////////////////////////////////////////////////
						_sendMailToOrgMemberUserDelete(self,user,orgid,usermemberid,"removememberfromorganduser",orgname,grpname);
					///////////////////////////////////////////////////////
					////////////////////////////////////////////////////
					_succesfullOrgMemberDelete(self);
					//////////////////////////////////////////////////
				}
			});
		}
	})
}
var _removeFromOrganizationGroup=function(self,user,orgid,grpid,usermemberid){
	logger.emit("log","grpid"+grpid);
	var query=orgModel.aggregate({$unwind:"$usergrp"},{$match:{"usergrp._id":MyObjectId(grpid),orgid:orgid}},{$project:{name:1,usergrp:1}})
	logger.emit("log","query"+JSON.stringify(query));
	query.exec(function(err,orgrpdata){
		if(err){
			self.emit("failedRemoveOrgGroupMembers",{"error":{"code":"ED001","message":"Database Server Issue"+err}}); 
		}else if(orgrpdata.length==0){
			logger.emit("log",orgrpdata);
			self.emit("failedRemoveOrgGroupMembers",{"error":{"message":"org grpid is wrong"}}); 
		}else{
			orgModel.update({orgid:orgid,"usergrp.grpmembers":usermemberid,"usergrp._id":grpid},{$pull:{"usergrp.$.grpmembers":usermemberid}},function(err,orguserremovestatus){
				if(err){
					self.emit("failedRemoveOrgGroupMembers",{"error":{"code":"ED001","message":"Database Server Issue"+err}}); 
				}else if(orguserremovestatus==0){
					self.emit("failedRemoveOrgGroupMembers",{"error":{"message":"orgid is wrong"}}); 
				}else{
					////////////////////////////////////////////////////
					_succesfullOrgMemberDelete(self);
					//////////////////////////////////////////////////
						/////////////////////////////////////////////////////////
						_sendMailToOrgMemberUserDelete(self,user,orgid,usermemberid,"removememberonlyfromorg",orgrpdata[0].name,orgrpdata[0].usergrp.grpname);
					///////////////////////////////////////////////////////

				}
			});
		}
	});
}
var _succesfullOrgMemberDelete=function(self){
	logger.emit("log","_succesfullOrgMemberDelete");
	self.emit("successfulRemoveOrgGroupMembers",{"success":{"message":"Group Members removed successfully"}});
}
var _sendMailToOrgMemberUserDelete=function(self,sessionuser,orgid,usermemberid,templatename,orgname,grpname){
	EmailTemplateModel.findOne({templatetype:templatename},function(err,orguserremovetemplate){
		if(err){
			logger.emit("error",""+err)
		}else if(!orguserremovetemplate){
			logger.emit("error","template of"+templatename +"doesn't exists");
		}else{
			userModel.findOne({userid:usermemberid},function(err,orguser){
				if(err){
				 logger.emit("error","Database Error");
				}else if(!orguser){
					 logger.emit("error","orgmemberid is wrong");
				}else{
					var subject=S(orguserremovetemplate.subject);
					subject=subject.replaceAll("<orgname>",orgname);
					subject=subject.replaceAll("<grpname>",grpname);
					var template=S(orguserremovetemplate.description);
					template=template.replaceAll("<adminuser>",sessionuser.username);
					if(orguser.firstname!=undefined){
						template=template.replaceAll("<tousername>",orguser.firstname);
					}else{
						template=template.replaceAll("<tousername>",orguser.username);
					}
					
					template=template.replaceAll("<orgname>",orgname);
					template=template.replaceAll("<grpname>",grpname);

					var message = {
						from: "Prodonus  <noreply@prodonus.com>", // sender address
						to: orguser.email, // list of receivers
						subject:subject.s, // Subject line
						html: template.s // html body
					};
					commonapi.sendMail(message,CONFIG.smtp_general, function (result){
						if(result=="failure"){
							logger.emit("error","Organization Member remove message "+message.to+" by"+sessionuser.email);
						}else{
							logger.emit("log","Organization Customer invite Sent Successfully to"+message.to+" by"+sessionuser.email);
						}
					});
				}
			})
		}
	})
}
Organization.prototype.broadCastMessage=function(user,orgid,broadcastmessagedata){
	var self=this;
	/////////////////////
	_validateBroadcastMessage(self,user,orgid,broadcastmessagedata);
}
var _validateBroadcastMessage=function(self,user,orgid,broadcastmessagedata){
	if(broadcastmessagedata==undefined){
		self.emit("failedBroadcastMessage",{"error":{"code":"AV001","message":"Please pass broadcast data"}}); 
	}else if(broadcastmessagedata.message==undefined){
		self.emit("failedBroadcastMessage",{"error":{"code":"AV001","message":"Please pass message"}}); 
	}else if(broadcastmessagedata.expireindays==undefined){
		self.emit("failedBroadcastMessage",{"error":{"code":"AV001","message":"Please pass expireindays"}}); 
	}else if(!S(broadcastmessagedata.expireindays).isNumeric()){
		self.emit("failedBroadcastMessage",{"error":{"code":"AV001","message":"Please pass expireindays in numeric"}}); 
	}else{
		_broadcastOrganizationMessage(self,user,orgid,broadcastmessagedata);
	}
	
	
}
var _broadcastOrganizationMessage=function(self,user,orgid,broadcastmessagedata){
	orgModel.findOne({orgid:orgid},function(err,organization){
		if(err){
			logger.emit("logger","Database Issue:"+err,user.userid)
			self.emit("failedBroadcastMessage",{"error":{"code":"ED001","message":"Database Server Issue"}}); 
		}else if(!organization){
			self.emit("failedBroadcastMessage",{"error":{"code":"AO002","message":"Wrong orgid"}}); 
		}else{
			var expirydate = new Date();
			logger.emit("log","expirydate"+expirydate)
			expirydate.setDate(expirydate.getDate()+parseInt(broadcastmessagedata.expireindays));
			expirydate=new Date(expirydate);
			logger.emit("log","expirydate"+broadcastmessagedata.expireindays)
			broadcastmessagedata.expirydate=expirydate;
			broadcastmessagedata.datecreated=new Date();
			orgModel.update({orgid:orgid},{$push:{broadcast:broadcastmessagedata}},function(err,broadcastmessagestatus){
				if(err){
					logger.emit("logger","Database Issue:"+err,user.userid)
					self.emit("failedBroadcastMessage",{"error":{"code":"ED001","message":"Database Server Issue"}}); 
				}else if(broadcastmessagestatus==0){
					self.emit("failedBroadcastMessage",{"error":{"code":"AO002","message":"Wrong orgid"}}); 
				}else{
					/////////////////////////////////
					_successfullBroadCastMessage(self,broadcastmessagedata);
					/////////////////////////////////
				}
			})		
		}
	})
}
var _successfullBroadCastMessage=function(self,broadcastmessagedata){
	logger.emit("log","_successfullBroadCastMessage");
	broadcastmessagedata.expireindays=undefined;
	self.emit("successfulBroadastMessage",{"success":{"message":"Broadcasting message successfully","broadcast":broadcastmessagedata}});
}
 Organization.prototype.GetBroadCastMessage=function(orgid){
	var self=this;
	///////////////////////////////
	_getBroadcastMessage(self,orgid);
	//////////////////////////////
}
var _getBroadcastMessage=function(self,orgid){
	orgModel.aggregate({$match:{orgid:orgid}},{$unwind:"$broadcast"},{$match:{"broadcast.expirydate":{$gte:new Date()}}},{$project:{broadcast:1}},function(err,broadcastmessage){
		if(err){
			self.emit("failedGetBroadcastMessage",{"error":{"code":"ED001","message":"Database Server Issue"}}); 	
		}else if(broadcastmessage.length==0){
				self.emit("failedGetBroadcastMessage",{"error":{"message":"There is no message to broadcast"}}); 	
		}else{
			var broadcast=[];
			for(var i=0;i<broadcastmessage.length;i++){
				broadcast.push(broadcastmessage[i].broadcast);
			}
			/////////////////////////////////////
			_successfullGetBroadcastMessage(self,broadcast);
			///////////////////////////////////
		}
	})
}
var  _successfullGetBroadcastMessage=function(self,broadcastmessage){
	self.emit("successfulGetBroadastMessage",{"success":{"message":"Getting Broadcast Message Successfully","broadcast":broadcastmessage}});
}
