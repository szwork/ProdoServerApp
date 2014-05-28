var util = require("util");
var events = require("events");
var userModel = require('../../user/js/user-model');
var orgModel=require("./org-model");
var logger=require("../../common/js/logger");
var S=require("string");
var productModel=require("../../product/js/product-model");
var TrendModel = require("../../featuretrending/js/feature-trending-model");
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
var ProductCampaignModel=require("../../productcampaign/js/product-campaign-model");
AWS.config.update({accessKeyId:'AKIAJOGXRBMWHVXPSC7Q', secretAccessKey:'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'});
AWS.config.update({region:'ap-southeast-1'});
var s3bucket = new AWS.S3();
var regxemail = /\S+@\S+\.\S+/; 
var OrgIndustryCategory=require("../../common/js/org-industry-category-model");
function isArray(what) {
    return Object.prototype.toString.call(what) === '[object Array]';
}
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

Organization.prototype.addOrganization=function(sessionuserid,subscriptiondata,sessionuser){
	var self=this;
	var organizationdata=this.organization;
	_validateOganizationData(self,organizationdata,subscriptiondata,sessionuserid,sessionuser);
}

	var _validateOganizationData = function(self,organizationdata,subscriptiondata,sessionuserid,sessionuser) {
		//validate the org data
		
		  if(organizationdata.name==undefined){
		  	self.emit("failedOrgAdd",{"error":{"code":"AV001","message":"Please type organization name"}});
		  } else if(organizationdata.orgtype==undefined){
		    self.emit("failedOrgAdd",{"error":{"code":"AV001","message":"please select organization type"}});
		  }else if(organizationdata.location==undefined){
		  	self.emit("failedOrgAdd",{"error":{"code":"AV001","message":"please give a location details"}});
		  }else if(organizationdata.orgtype=="manufacturer" && organizationdata.terms==undefined){
		  	self.emit("failedOrgAdd",{"error":{"code":"AV001","message":"please agree the terms and condition"}});
		  }else if(organizationdata.orgtype=="manufacturer" && organizationdata.terms==false ){
		  	self.emit("failedOrgAdd",{"error":{"code":"AV001","message":"please agree the terms and condition"}});
		  }else if(organizationdata.industry_category==undefined){
		  	self.emit("failedOrgAdd",{"error":{"code":"AV001","message":"please pass industry category"}});
		  }else if(["manufacturer","company"].indexOf(organizationdata.orgtype.toLowerCase())<0){
		  	self.emit("failedOrgAdd",{"error":{"code":"AV001","message":"Organization type must be Manufcaturer or Company"}});
		  }else{

					logger.emit("log","_validated");
					//this.emit("validated", organizationdata);
					_isOrganizationNameAlreadyExist(self,organizationdata,sessionuserid,subscriptiondata,sessionuser);
					
		  }
		  
   
	};
	var _isOrganizationNameAlreadyExist=function(self,organizationdata,sessionuserid,subscriptiondata,sessionuser){
		orgModel.findOne({name:organizationdata.name},function(err,organization){
			if(err){
			  self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"Error in db to find user"}});	
			}else if(organization){
				self.emit("failedOrgAdd",{"error":{"message":"Orgaization name already exist"}});
			}else{
				////////////////////////////////////////////////////////////
					_hasAlreadyOrganization(self,organizationdata,sessionuserid,subscriptiondata,sessionuser);
					///////////////////////////////////////////////////////////
			}
		})
	}
	var _hasAlreadyOrganization=function(self,organizationdata,sessionuserid,subscriptiondata,sessionuser){
		userModel.findOne({userid:sessionuserid,"org.orgid":null},{userid:1}).lean().exec(function(err,user){
			if(err){
					self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"Error in db to find user"}});
				}else if(user){
					logger.emit("log","_hasAlreadyOrganization");
					//////////////////////////////////////////////////////////////////////
					_applyDefaultOrganisationTrialPlan(self,organizationdata,sessionuserid,sessionuser);
					///////////////////////////////////////////////////////////////////				
				}else{
					self.emit("failedOrgAdd",{"error":{"code":"AO001","message":"You can add only one organization"}});
				}
		})
	}
var _applyDefaultOrganisationTrialPlan=function(self,organizationdata,sessionuserid,sessionuser){
	SubscriptionModel.findOne({plantype:S(organizationdata.orgtype).toLowerCase().s,"planpaymentcommitment.amount":0},function(err,subscription){
		if(err){
			logger.emit("error","Database Issue:_applyDefaultOrganisationTrialPlan "+err);
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
					logger.emit("error","Database Issue:_applyDefaultOrganisationTrialPlan "+err);
					self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"Database Issue"}});
				}else{
					organizationdata.subscription=subscription_set;
					organizationdata.payment={paymentid:payment.paymentid}
					//////////////////////////////////////////////////////////////////////
					_addOrganization(self,organizationdata,sessionuserid,sessionuser);
					////////////////////////////////////////////////////////////////////
				}
			})
		}
	})
}
	var _addOrganization = function(self,organizationdata,sessionuserid,subscriptiondata,sessionuser) {
		//validate the org data
        // organizationdata.subscription={planid:subscriptiondata.planid};
        var usergrp=organizationdata.usergrp;
        // organizationdata.usergrp=undefined;
        
        organizationdata.usergrp=undefined;
		var organization=new orgModel(organizationdata);
		organization.save(function(err,organization1){
	     if(err){
	     	 self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"Error in db to find user"}});
	    }else{  
	    	logger.emit("log","_addOrganization");
	    	/////////////////////////////////////////
            _addIndustryCategory(organization1);
	    	//////////////////////////////////////
	    	//////////////////////////////////////////////
		    _addOrgDetailsToUser(self,organization1,sessionuserid,sessionuser,usergrp);
		    //////////////////////////////////////1///////      
	     }
	  })
	}; 
	var _addIndustryCategory=function(organization){
		var industry_category=organization.industry_category;
		OrgIndustryCategory.update({},{$addToSet:{tagname:{$each:industry_category}}},function(err,updatelatestcategory){
			if(err){
				logger.emit("error","Database Issue _addIndustryCategory"+err)
      }else{
      	logger.emit("log","new category tags added");
			}
		})
	}
    
	var _addOrgDetailsToUser = function(self,organization,sessionuserid,sessionuser,usergrp) {
    var organizationsubscription={planid:organization.subscription.planid,planstartdate:new Date(organization.subscription.planstartdate),planexpirydate:new Date(organization.subscription.planexpirydate)};
		userModel.update({userid:sessionuserid},{$set:{payment:{paymentid:organization.payment.paymentid},subscription:organizationsubscription,usertype:S(organization.orgtype).toLowerCase().s,org:{orgid:organization.orgid,isAdmin:true,orgtype:organization.orgtype,orgname:organization.name,status:"init"}}},function(err,userupdatestatus){
	 	  if(err){
	   	 self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"Error in db to update user"+err}});
	  	}else if(userupdatestatus!=1){
	    	self.emit("failedOrgAdd",{"error":{"code":"AU002","message":"Provided userid is wrong"}});
	  	}else{
	  			logger.emit("log","_addAdminGroup");
	  		///////////////////////////////////////////////
	  		_addAdminGroup(self,organization,sessionuserid,sessionuser,usergrp);
	  		///////////////////////////////////////////////
	  	}
		})
	};

	var _addAdminGroup = function(self,organization,sessionuserid,sessionuser,usergrp) {
		//validate the org data
		orgModel.update({ orgid:organization.orgid},{$push:{usergrp:{grpname:"admin",grpmembers:sessionuserid}}},function(err,status){
	      if(err){
	       	self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"Error in db to add admin group"}});
	      } else if(status!=1){
	      	self.emit("failedOrgAdd",{"error":{"code":"AO002","message":"Provided orgid doesn't exists"}});
	      }else{
	      	// var organizationdata=self.organization;
	      	var invites="";
           // logger.emit("log","organizationdata"+JSON.stringify(organizationdata));
	      	if(usergrp!=undefined && isArray(usergrp)){
				for(var i=0;i<usergrp.length;i++){
					if(usergrp[i].invites.trim().length==0 && usergrp[i].grpname.trim().length==0){
						// invites+=organizationdata.usergrp[i].invites;	
						 usergrp.splice(i,1);
					}
					
				}
	    	}
	    	// logger.emit("log","organizationdata"+JSON.stringify();
	      	if(!isArray(usergrp) && usergrp.length==0){
		      	logger.emit("log","there is not ivtitee");
		      	////////////////////////////////
		      	_successfulOrgAdd(self);
		      	///////////////////////////////
	      	}else{
	      		logger.emit("log","_addUserInvitees");
		      	///////////////////////////////////
		      	_addUserInvitees(self,organization,sessionuser,usergrp);
		      	/////////////////////////////////////
	      	}
	      }
    })
	};

	var _addUserInvitees = function(self,organization,sessionuser,usergrp) {
		// var usergrp=self.organization.usergrp;
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
		////////////////
		
	// var companydomain=S(user.email).substring(user.email.indexOf("@")+1);
	// var notvalidemails=[];
	var invitees1=invitees
	// var invitees=[];
	// for(var i=0;i<invitees1.length;i++){
	// 	if(companydomain==S(invitees1).substring(user.email.indexOf("@")+1)){
	// 		invitees.push(invitees1[i])
	// 	}
	// }


		//////////////
		userModel.find({email:{$in:invitees}},{email:1}).lean().exec(function(err,user){
	    if(err){
	    	self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"Error in db to find users"+err}});
	    }else{
	    	var existingusers=[];
	      for(var i=0;i<user.length;i++)
	      {
	        existingusers.push(user[i].email);
	      }
	      userModel.find({email:{$in:existingusers},"org.orgid":{$ne:null},"org.orgid":{$ne:organization.orgid}},{email:1},function(err,userwithorg){
	    		if(err){
	    			self.emit("failedOrgInvites",{"error":{"code":"ED001","message":"Error in db to find users"+err}});
	    		}else{
	    			var existinguserwithorg=[];
	    			for(var i=0;i<userwithorg.length;i++){
	    				existinguserwithorg.push(userwithorg[i].email)
	    			}
	    			var newusers=__.difference(invitees,existingusers);
	    			existingusers=__.difference(existingusers,existinguserwithorg);
	   				logger.emit("log","Newusers"+newusers);
	   				logger.emit("log","ExistingUsers"+existingusers);
	   				
	   				// newusers=__.difference(newusers,existinguserwithorg);
	      	  		if(newusers.length>0){
	      	  			productModel.findOne({"name":new RegExp('^'+"Prodonus", "i")},{prodle:1,orgid:1}).lean().exec(function(err,product){
							if(err){
								self.emit("failedUserRegistration",{"error":{"code":"ED001","message":"Error in db to find product details"}});
							}else{
								
								var userdata=[];
				      			for(var i=0;i<newusers.length;i++)
     							{
				     			  if(product){
				     			  	userdata[i]={products_followed:[{prodle:product.prodle,orgid:product.orgid}],prodousertype:"business",email:newusers[i],username:newusers[i],usertype:S(organization.orgtype).toLowerCase().s,org:{orgid:organization.orgid,orgtype:organization.orgtype,isAdmin:false,orgname:organization.name},subscription:{planid:organization.subscription.planid,planexpirydate:organization.subscription.planexpirydate,planstartdate:organization.subscription.planstartdate,discountcode:null},payment:{paymentid:organization.payment.paymentid}}; 			  	
				     			  }else{
				    				userdata[i]={products_followed:[],prodousertype:"business",email:newusers[i],username:newusers[i],usertype:S(organization.orgtype).toLowerCase().s,org:{orgid:organization.orgid,orgtype:organization.orgtype,isAdmin:false,orgname:organization.name},subscription:{planid:organization.subscription.planid,planexpirydate:organization.subscription.planexpirydate,planstartdate:organization.subscription.planstartdate,discountcode:null},payment:{paymentid:organization.payment.paymentid}}; 			  	
				     			  }
			      
      	        				}
				        	userModel.create(userdata,function(err,inviteuserdata){
				          		if(err){
				            		self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"_addUserInvitees"+err}});
				          		}else if(inviteuserdata){
				          			logger.emit("log",inviteuserdata);
				          			var inviteusers=userdata;
						          	/////////////////////////////////////////////////
						           _sendEmailToInvitees(self,organization,usergrp_array,newusers,sessionuser,existingusers);
						            /////////////////////////////////////////////////
				          		}
				        	})
				        	}
						});
	      		}else{//if the provided email id is already registered with prodonus
			       /////////////////////////////////////////////////////////////
			      	_sendEmailToInvitees(self,organization,usergrp_array,newusers,sessionuser,existingusers);
			     	 ////////////////////////////////////////////////////////////
	    			}
	  			}
  			})
			};
		})
  }

	var _sendEmailToInvitees = function(self,organization,usergrp_array,newusers,sessionuser,existingusers){
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
	  		// var existingusers=[]
	          for(var i=0;i<usergrp_array.length;i++){
	          	for(var j=0;j<usergrp_array[i].invites.length;j++){
	          		if(__.contains(newusers, usergrp_array[i].invites[j])){//it is new user
	          			self.emit("sendneorguserinviteemail", usergrp_array[i].invites[j],neworgusertemplate,organization.name,usergrp_array[i].grpname);
	          		}else{//already prodonus registered user
	          			// existingusers.push(usergrp_array[i].invites[j]);
	          			if(__.contains(existingusers,usergrp_array[i].invites[j])){
	          			  self.emit("sendinvitemail", usergrp_array[i].invites[j],orgusertemplate,organization.name,usergrp_array[i].grpname);		
	          			}
	          			
	          		}	
	          	}
	          }
	          logger.emit("log","tesing"+existingusers);
	          //////////////////////////////////////////////////////////////////
         		if(existingusers.length>0){
					_associateOrganizationToUser(self,existingusers,organization,sessionuser);
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
		console.log
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
				console.log("dddddd"+usergrp);
				 usergrp={grpname:usergrp.grpname,grpmembers:newuser}
					orgModel.update({orgid:organization.orgid},{$push:{usergrp:usergrp}},function(err,status){
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
			_isOrgdataContainsName(self,orgid,orgdata,sessionuserid);
			// ////////////////////////////////////////
			// _updateOrganization(self,orgid,orgdata,sessionuserid);
			// ///////////////////////////////////////
		}
};
var _isOrgdataContainsName=function(self,orgid,orgdata,sessionuserid){
	if(orgdata.name!=undefined){
		if(orgdata.password==undefined || orgdata.password==""){
	 		self.emit("failedOrgUpdation",{"error":{"code":"AV001","message":"Please provide password to update organization name"}});	
	 	}else{
	 		/////////////////////////////////////
	 		_updateOrganizationName(self,orgid,orgdata,sessionuserid);
	 		/////////////////////////////////////
	 	}
	}else{
		///////////////////////////////////
			_updateOrganization(self,orgid,orgdata,sessionuserid);
			//////////////////////////////////
	}
}
var _updateOrganizationName=function(self,orgid,orgdata,sessionuserid){
userModel.findOne({userid:sessionuserid,status:"active"},function(err,user){
		if(err){
			self.emit("failedOrgUpdation",{"error":{"code":"ED001","message":"DB error:_updateUsername"+err}});	
		}else if(!user){
			self.emit("failedOrgUpdation",{"error":{"code":"AU005","message":"Userid wrong"}});	
		}else{
			user.comparePassword(orgdata.password, function(err, isMatch){
	      if (err){
	        self.emit("failedOrgUpdation",{"error":{"message":"Database Issue"}});	
	      } else if( !isMatch ) {
	      	self.emit("failedOrgUpdation",{"error":{"message":"Wrong password"}});	
	      }else{
	       	// delete userdata.password;
	       ///////////////////////////////////
			_updateOrganization(self,orgid,orgdata,sessionuserid);
 			//////////////////////////////////
	      }
	    });
		}
	})
}
// var 	_checkOrgNameIsExistForUpdate=function(self,orgid,orgdata,sessionuserid){
// 	orgModel.findOne({name:orgdata.name},{name:1},function(err,org){
// 		if(err){
// 			self.emit("failedOrgUpdation",{"error":{"code":"ED001","message":"DB error:failedOrgUpdation"+err}});	
// 		}else if(org){
// 			self.emit("failedOrgUpdation",{"error":{"message":"Organization name already exists "}});	
// 		}else{
// 			///////////////////////////////////
// 			_updateOrganization(self,orgid,orgdata,sessionuserid);
// 			//////////////////////////////////
// 		}
// 	})
// }
var _updateOrganization=function(self,orgid,orgdata,sessionuserid){
	
	logger.emit("log","_updateOrganization");
	orgModel.update({orgid:orgid},{$set:orgdata},function(err,organizationupdatestatus){
		if(err){
			logger.emit("error","Database Issue:_updateOrganization"+err,sessionuserid)
			self.emit("failedOrgUpdation",{"error":{"code":"ED001","message":"Database Issue"}});
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

Organization.prototype.requestToDeleteOrganization = function(orgid,sessionuserid) {
		var self=this;	
		////////////////////////////////////////
		_requestToDeleteOrganization(self,orgid,sessionuserid);
		///////////////////////////////////////		
};

var _requestToDeleteOrganization=function(self,orgid,sessionuserid){	
	logger.emit("log","_requestToDeleteOrganization");
	orgModel.findOne({orgid:orgid},function(err,organization){
		if(err){
			self.emit("failedOrgDeletRequest",{"error":{"code":"ED001","message":"Error in db to deleteuser data"}});
		}else if(organization){
			if(organization.org_delreqsend == false){
				EmailTemplateModel.findOne({templatetype:"orgdeletereqnotification"},function(err,emailtemplate){
					if(err){
						logger.error("error","Database Issue fun:_sendOrgRemoveNotificationToOrgMember "+err);
					}else if(!emailtemplate){
						logger.error("error","emailtemplate for orgdeletereqnotification doesnt exists");
					}else{
						self.emit("orgdeletereqnotification",organization,emailtemplate);
					}
				})
			}else{
				self.emit("successfulOrgDeleteRequest",{"success":{"message":"Delete request for this organization has been already sent"}});
			}			
		}else{
			self.emit("failedOrgDeletRequest",{"error":{"code":"AO002","message":"Provided orgid is wrong"}});
		}
	})
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
			_removeAllProductTrending(self,orgid);
			////////////////////////////////////
		}
	})
}

var _removeAllProductTrending = function(self,orgid){
	TrendModel.remove({orgid:orgid},function(err,allorgproductdeletestatus){
		if(err){
			logger.emit("error","Database Issue _removeAllProductTrending orgid:"+orgid+":"+err);
		}else if(allorgproductdeletestatus==0){
			logger.emit("error","Wrong orgid to delete trend data");
		}else{
			/////////////////////////////////////
			logger.emit("info","trend data delete for this organisation");
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

Organization.prototype.getOrgIndustryCategory = function() {
	console.log("getOrgIndustryCategory");
	var self=this;
	//////////////////
	_getOrgIndustryCategory(self);
	///////////////////
};

var _getOrgIndustryCategory=function(self){
	
	OrgIndustryCategory.aggregate([{$group:{_id:null,industry_category:{"$addToSet":"$categoryname"}}},{$project:{industry_category:1,_id:0}}]).exec(function(err,orgindustrycategories){
		if(err){
			self.emit("failedGetOrgIndustryCategory",{"error":{"code":"ED001","message":"Error in db to find all organizations"}});
		}else if(orgindustrycategories.length==0){
			self.emit("failedGetOrgIndustryCategory",{"error":{"code":"AO003","message":"No organization exists"}});
		}else{
			////////////////////////////////////////////////
			_successfulGetOrgIndustryCategory(self,orgindustrycategories[0].industry_category);
			///////////////////////////////////////////////
		}
	})
};

var _successfulGetOrgIndustryCategory=function(self,orgindustrycategories){
	logger.emit("log","_successfulGetOrgIndustryCategory");
	self.emit("successfulGetOrgIndustryCategory", {"success":{"message":"Getting Organization Industry Category Successfully","industry_category":orgindustrycategories}});
}

Organization.prototype.getAllOrganizationName = function() {

	var self=this;
	//////////////////
	_getAllOrganizationName(self);
	///////////////////
};

var _getAllOrganizationName=function(self){
	
	orgModel.find({status:{$ne:"deactive"}},{name:1,_id:0,orgid:1}).lean().exec(function(err,organization){
		if(err){
			self.emit("failedGetAllOrgName",{"error":{"code":"ED001","message":"Error in db to find all organizations"}});
		}else if(organization.length==0){
			self.emit("failedGetAllOrgName",{"error":{"code":"AO003","message":"No organization exists"}});
		}else{
			////////////////////////////////////////////////
			_successfulOrgNames(self,organization);
			///////////////////////////////////////////////
		}
	})
};

var _successfulOrgNames=function(self,organization){
	logger.emit("log","_successfulOrgNames");
	self.emit("successfulGetAllOrgName", {"success":{"message":"Getting Organization Names Successfully","OrgNames":organization}});
}

Organization.prototype.getLatestSignUpOrgs = function() {

	var self=this;
	//////////////////
	_getLatestSignUpOrgs(self);
	///////////////////
};

var _getLatestSignUpOrgs=function(self){
	var startDate = new Date();
	var endDate = new Date();
	console.log("startDate  : " + startDate);
	startDate.setDate(startDate.getDate()-14);
	console.log("startDate 1 : " + startDate);
	console.log("endDate  : " + endDate);

	orgModel.find({status:{$ne:"deactive"},prodo_setupdate: {$gte: startDate, $lt: endDate}},{name:1,orgid:1,description:1,org_logo:1,_id:0}).sort({prodo_setupdate:-1}).limit(5).lean().exec(function(err,organization){
		if(err){
			self.emit("failedGetLatestSignUpOrgs",{"error":{"code":"ED001","message":"Error in db to find latest signup organizations"}});
		}else if(organization.length==0){
			self.emit("failedGetLatestSignUpOrgs",{"error":{"code":"AO003","message":"No signups has been done in last two weeks"}});
		}else{
			////////////////////////////////////////////////
			_successfulGetLatestSignUpOrgs(self,organization);
			///////////////////////////////////////////////
		}
	})
};

var _successfulGetLatestSignUpOrgs=function(self,organization){
	logger.emit("log","_successfulGetLatestSignUpOrgs");
	self.emit("successfulGetLatestSignUpOrgs", {"success":{"message":"Getting Organization Details Successfully","OrgNames":organization}});
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
	// orgModel.update({orgid:orgid,"location._id":orgaddressid},{$pull:{location:{_id:orgaddressid}}},function(err,orgaddrespullstatus){
	// 	if(err){
	// 		self.emit("failedUpdateAddress",{"error":{"code":"ED001","message":"Error in db to update organization address"}});
	// 	}else if(orgaddrespullstatus!=1){
	// 		self.emit("failedUpdateAddress",{"error":{"code":"AO002","message":"Provides orgid or orgaddress id is wrong to update organization address"}});			
	// 	}else{
			orgModel.update({orgid:orgid,"location._id":orgaddressid},{$set:{"location.$.locationtype":orgaddress.locationtype,"location.$.contacts":orgaddress.contacts,"location.$.address":orgaddress.address}},function(err,orgaddrespushstatus){
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
	// 	}
	// })
}
var _successfulOrgUpdateressAdd=function(self){
	logger.emit("log","successfulUpdateAddress");
	self.emit("successfulUpdateAddress",{"success":{"message":"Organization Address Updated Successfully"}});
}
Organization.prototype.deleteOrgAddress = function(orgid,orgaddressid) {
	var self=this;
	// var orgaddress=self.orgaddress;
	//////////////////////////////////////////////////////////
	_isContainCompanyOneCompanyAddress(self,orgid,orgaddressid)
	//////////////////////////////////////////////////////////

	//////////////////////////////////////////////
	// _deleteOrgAddress(self,orgid,orgaddressid);
	//////////////////////////////////////////////
};
var _isContainCompanyOneCompanyAddress=function(self,orgid,orgaddressid){
	orgModel.aggregate({$match:{orgid:orgid}},{"$unwind":"$location"},{$match:{"location.locationtype":"Company Address"}},{$project:{location:1}},function(err,orglocations){
		if(err){
			self.emit("failedDeleteOrgAddress",{"error":{"code":"ED001","message":"Error in db to delete organization address"}});
		}else{
			console.log("orglocations"+JSON.stringify(orglocations))
			if(orglocations.length==0){
				_deleteOrgAddress(self,orgid,orgaddressid)
			}else{
				var locationids=[];
				for(var i=0;i<orglocations.length;i++){
					locationids.push(orglocations[i].location._id+"");
				}
				console.log("locationids length"+orgaddressid)
				console.log(locationids)
				console.log(locationids.indexOf(orgaddressid))
				if(orglocations.length==1){
					if(locationids.indexOf(orgaddressid)<0){
						_deleteOrgAddress(self,orgid,orgaddressid)
					
					}else{
						self.emit("failedDeleteOrgAddress",{"error":{"code":"EAO01","message":"Organization should maintain atleast one company address"}});			
					}
				}else{
					_deleteOrgAddress(self,orgid,orgaddressid)
				}
			}
		} 

		
	})
}
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
	// db.products.update({"product_images.imageid":{$in:["7pz904msymu","333"]}},{$pull:{"product_images":{imageid:{$in:["7pz904msymu","333"]}}}});
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
Organization.prototype.orgInvites=function(orgid,usergrp,user){
	var self=this;
	/////////////////////
	_validateOrgInvites(self,orgid,usergrp,user);

}
var _validateOrgInvites=function(self,orgid,usergrp,user){

	if(usergrp==undefined){
		self.emit("failedOrgInvites",{"error":{"code":"AV001","message":"Please pass usergrp data"}});
	}else if(usergrp.grpname==undefined){
		self.emit("failedOrgInvites",{"error":{"code":"AV001","message":"Please pass grpname"}});
	}else if(usergrp.invites==undefined){
		self.emit("failedOrgInvites",{"error":{"code":"AV001","message":"Please pass invites"}});
	}else if(usergrp.invites.substring(0,1)==","){
		self.emit("failedOrgInvites",{"error":{"code":"AV001","message":"Please pass valid email"}});
	}else if(usergrp.invites.trim().length==0){
		self.emit("failedOrgInvites",{"error":{"code":"AV001","message":"plese fill invites emails"}});
	}else{
		//////////////////
		_addOrgInvitees(self,orgid,usergrp,user)
		//////////////////
	}

}
var _addOrgInvitees = function(self,orgid,usergrp,sessionuser) {
	var invitees=[];
	var invitees1=[]
	var j=0;
	//to add invtiees email into array group by grpname
	var invites=S(usergrp.invites);

	if(invites.contains(",")){
		invitees1=invites.split(",");
	}else{
		invitees1.push(invites.s);
	}
	invitees=invitees1;
	if( usergrp.grpname=="admin" && invitees.indexOf(sessionuser.email)>=0){
		
		invitees.splice(invitees.indexOf(sessionuser.email),1);
		
	}
	console.log("invitees .............."+invitees);
	if(invitees.length==0){
		self.emit("failedOrgInvites",{"error":{"message":"Given Email id already belong to admin group"}})
	}else{
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
	    userModel.find({email:{$in:existingusers},"org.orgid":{$ne:null},"org.orgid":{$ne:orgid}},{email:1},function(err,userwithorg){
	    	if(err){
	    		self.emit("failedOrgInvites",{"error":{"code":"ED001","message":"Error in db to find users"+err}});
	    	}else{
	    		var existinguserwithorg=[];
	    		for(var i=0;i<userwithorg.length;i++){
	    			existinguserwithorg.push(userwithorg[i].email)
	    		}
	    		logger.emit("log","existinguserwithorg"+existinguserwithorg);
	   			var newusers=__.difference(invitees,existingusers);
	   			existingusers=__.difference(existingusers,existinguserwithorg);
	   			// loggger.emit("")
	   			// newusers=__.difference(newusers,existinguserwithorg);
		        logger.emit("log","newusers:"+newusers);
		        logger.emit("log","existingusers"+existingusers);
	      	orgModel.findOne({orgid:orgid},function(err,organization){
				if(err){
					self.emit("failedOrgInvites",{"error":{"code":"ED001","message":"Error in db to find org"+err}});
				}else if(!organization){
					self.emit("failedOrgInvites",{"error":{"code":"AO001","message":"provided orgid is wrong"}});
				}else{
		 			if(newusers.length>0){//
		 				productModel.findOne({"name":new RegExp('^'+"Prodonus", "i")},{prodle:1,orgid:1}).lean().exec(function(err,product){
							if(err){
							self.emit("failedUserRegistration",{"error":{"code":"ED001","message":"Error in db to find product details"}});
						}else{
						
						var userdata=[];
		      			for(var i=0;i<newusers.length;i++)
		     			{
		     			  var isAdmin=false;
		     			  if(usergrp.grpname.toLowerCase()=="admin"){
		     			  	isAdmin=true;
		     			  }
		     			  if(product){
		     			  	userdata[i]={products_followed:[{prodle:product.prodle,orgid:product.orgid}],prodousertype:"business",email:newusers[i],username:newusers[i],usertype:S(organization.orgtype).toLowerCase().s,org:{orgid:organization.orgid,orgtype:organization.orgtype,isAdmin:isAdmin,orgname:organization.name,status:organization.status},subscription:{planid:organization.subscription.planid,planexpirydate:organization.subscription.planexpirydate,planstartdate:organization.subscription.planstartdate,discountcode:null},payment:{paymentid:organization.payment.paymentid}}; 			  	
		     			  }else{
		    				userdata[i]={products_followed:[],prodousertype:"business",email:newusers[i],username:newusers[i],usertype:S(organization.orgtype).toLowerCase().s,org:{orgid:organization.orgid,orgtype:organization.orgtype,isAdmin:isAdmin,orgname:organization.name,status:organization.status},subscription:{planid:organization.subscription.planid,planexpirydate:organization.subscription.planexpirydate,planstartdate:organization.subscription.planstartdate,discountcode:null},payment:{paymentid:organization.payment.paymentid}}; 			  	
		     			  }
					      
		      	        }

			    			
						userModel.create(userdata,function(err,inviteuserdata){
							if(err){
							  self.emit("failedOrgInvites",{"error":{"code":"ED001","message":"Error in db to create invite users"+err}});
							}else if(inviteuserdata){
								logger.emit("log",inviteuserdata); 
								var inviteusers=userdata;
								/////////////////////////////////////////////////
							 _sendInviteEmailToOrgInvitees(self,newusers,existingusers,usergrp.grpname,organization,sessionuser);
							  /////////////////////////////////////////////////
							}
						})
							}
						})
					}else{//if provided invites already exists 
						logger.emit("log","provided invites emails already exists");
						//////////////////////////////////////////////////////////////////////////////////////
						_sendInviteEmailToOrgInvitees(self,newusers,existingusers,usergrp.grpname,organization,sessionuser);
						/////////////////////////////////////////////////////////////////////////////
					}
				}
	})
}
		  })
		};
	})
	}
	// var companydomain=S(user.email).substring(user.email.indexOf("@")+1);
	// var notvalidemails=[];
	// for(var i=0;i<invitees1.length;i++){
	// 	if(companydomain==S(invitees1).substring(user.email.indexOf("@")+1)){
	// 		invitees.push(invitees1[i])
	// 	}else{
	// 		notvalidemails.push(invitees1[i]);
	// 	}
	// }

	
}


	var _sendInviteEmailToOrgInvitees = function(self,newusers,existingusers,grpname,organization,sessionuser) {
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
			  	var useremails=__.union(existingusers,newusers);
			  	if(useremails.length>0){
			  		///////////////////////////////////////////
			  	_AddUserIntoOrgGroup(self,newusers,existingusers,organization,grpname,sessionuser);
			  	///////////////////////////////////////////
			  	//////////////////////////////////////////////////////////////////
			  }else{
			  	self.emit("failedOrgInvites",{"error":{"message":"Provided emailids is already associated with other organization"}});
			  }
			  	
           if(existingusers.length>0){
           	_associateOrganizationToUser(self,existingusers,organization,sessionuser);
			  	////////////////////////////////////////////////////////////
           }
			  	
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
var _associateOrganizationToUser=function(self,existingusers,organization,sessionuser){
	// existingusers=__.difference(existingusers,sessionuser.email);
	console.log("existingusers  _associateOrganizationToUser"+existingusers+organization.orgname);
	var org={status:organization.status,aorgid:organization.orgid,orgname:organization.name,orgtype:organization.orgtype,isAdmin:true};
	userModel.update({email:{$in:existingusers}},{$set:{org:org,prodousertype:"business",usertype:organization.orgtype}},{multi:true},function(err,updateuserorgstatus){
		if(err){
			logger.emit("error",{"error":{"message":"Database Issue"+err}});
		}else if(updateuserorgstatus==0){
			logger.emit("error","")
		}else{
			logger.emit("info","associate organization details to user");
		}
	})
}
var _AddUserIntoOrgGroup=function(self,newusers,existingusers,organization,grpname){
	var useremails=__.union(existingusers,newusers);
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
		self.emit("failedOrgCustomerInvites",{"error":{"code":"AV001","message":"Please pass other org invites data"}});
	}else if(orgcustomerinvites.to==undefined || orgcustomerinvites.to.trim()==""){
		self.emit("failedOrgCustomerInvites",{"error":{"code":"AV001","message":"Please enter to data"}});
	}else if(orgcustomerinvites.subject==undefined || orgcustomerinvites.subject.trim()==""){
		self.emit("failedOrgCustomerInvites",{"error":{"code":"AV001","message":"Please enter subject"}});
	}else if(orgcustomerinvites.body==undefined || orgcustomerinvites.body.trim()==""){
		self.emit("failedOrgCustomerInvites",{"error":{"code":"AV001","message":"Please enter body details"}});
	}else{
		//////////////////////////////////////////////////////////////////////////
    _sendOrgCustomerInvitation(self,orgid,orgcustomerinvites,sessionuserid);
		////////////////////////////////////////////////////////////////////////
	}
}
var _sendOrgCustomerInvitation=function(self,orgid,orgcustomerinvites,sessionuserid){
	var emailids=S(orgcustomerinvites.to);
  var toemailids=[];
	if(emailids.contains(",")){
		toemailids=emailids.split(",");
	}else{
		toemailids.push(emailids.s);
	}
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
			 	  //////////////////////////////////////////////////////////////////////////////////////
					_addOrganizationCustomerInviteIntoBusinessOpportunity(self,orgcustomerinvites.subject,orgcustomerinvites.body,toemailids,user,organization);
					/////////////////////////////////////////////////////////////////////////////////////
				}
			})//end of email template
		}
	})//end of user find
		}
	
var _addOrganizationCustomerInviteIntoBusinessOpportunity=function(self,subject,body,toemailids,user,organization){
  
 var otherorginvites=[];
  for(var i=0;i<toemailids.length;i++){
  	otherorginvites.push({email:toemailids[i]});
  }
 var business_opportunity=[];
    var notvalidemailids=[];
	for(var i=0;i<otherorginvites.length;i++)
	{
		var host=S(otherorginvites[i].email).substring(otherorginvites[i].email.indexOf("@")+1,otherorginvites[i].email.indexOf(".",otherorginvites[i].email.indexOf("@")))
		if(regxemail.test(otherorginvites[i].email)){
			business_opportunity.push({invitetype:"orgcustomer",from:user.email,to:otherorginvites[i].email,fromusertype:user.usertype});
		}else{
			notvalidemailids.push(otherorginvites[i].email)
		}
	}
	if(business_opportunity.length==0){
		self.emit("failedOrgCustomerInvites",{"error":{"message":"Pleae provider company emailids"}});	
	}else{
		self.emit("sendinviteorgcustomer",subject,body,toemailids,user,organization);
		BusinessOpportunityModel.create(business_opportunity,function(err,business_opportunitydata){
		 	if(err){
		 		self.emit("failedOrgCustomerInvites",{"error":{"code":"ED001","message":"Business Opportunity"+err}});	
		 	}else{
		 		/////////////////////////////////////////////////
		 		_successfullOrgCustomerInvites(self,notvalidemailids);
		 		///////////////////////////////////////////////
		 	}
 		})	
	}
}
var _successfullOrgCustomerInvites=function (self,notvalidemailids) {
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
	}else if(otherorginvites.to==undefined || otherorginvites.to.trim()==""){
		self.emit("failedOtherOrgInvites",{"error":{"code":"AV001","message":"Please enter to data"}});
	}else if(otherorginvites.subject==undefined || otherorginvites.subject.trim()==""){
		self.emit("failedOtherOrgInvites",{"error":{"code":"AV001","message":"Please enter subject"}});
	}else if(otherorginvites.body==undefined || otherorginvites.body.trim()==""){
		self.emit("failedOtherOrgInvites",{"error":{"code":"AV001","message":"Please enter body details"}});
	}else{
		//////////////////////////////////////////////////////////////////////////
    _sendOtherOrganizationInvitation(self,orgid,otherorginvites,sessionuserid);
		////////////////////////////////////////////////////////////////////////
	}
}
var _sendOtherOrganizationInvitation=function(self,orgid,otherorginvites,sessionuserid){
	var emailids=S(otherorginvites.to);
  var toemailids=[];
	if(emailids.contains(",")){
		toemailids=emailids.split(",");
	}else{
		toemailids.push(emailids.s);
	}
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
					 
					 ///////////////////////////////////////////////////////////////
						_addOtherOrganizationInviteIntoBusinessOpportunity(self,otherorginvites.subject,otherorginvites.body,toemailids,user,organization);
					 ////////////////////////////////////////////////////////////
        }
		  })
		}//end of email template
	})
}
var _addOtherOrganizationInviteIntoBusinessOpportunity=function(self,subject,body,toemailids,user,organization){
  var otherorginvites=[];
  for(var i=0;i<toemailids.length;i++){
  	otherorginvites.push({email:toemailids[i]});
  }
 var business_opportunity=[];
    var notvalidemailids=[];
	for(var i=0;i<otherorginvites.length;i++)
	{
		var host=S(otherorginvites[i].email).substring(otherorginvites[i].email.indexOf("@")+1,otherorginvites[i].email.indexOf(".",otherorginvites[i].email.indexOf("@")))
		if(regxemail.test(otherorginvites[i].email)){
			business_opportunity.push({invitetype:"business",from:user.email,to:otherorginvites[i].email,fromusertype:user.usertype,orgname:otherorginvites[i].orgname});
		}else{
			notvalidemailids.push(otherorginvites[i].email)
		}
	}
	if(business_opportunity.length==0){
		self.emit("failedOtherOrgInvites",{"error":{"message":"Please provider company emailids"}});	
	}else{
		self.emit("sendotherorginvite",subject,body,toemailids,user,organization);
		BusinessOpportunityModel.create(business_opportunity,function(err,business_opportunitydata){
		 	if(err){
		 		self.emit("failedOtherOrgInvites",{"error":{"code":"ED001","message":"Business Opportunity"+err}});	
		 	}else{
		 		/////////////////////////////////////////////////
		 		_successfullOtherOrgInvites(self,notvalidemailids);
		 		///////////////////////////////////////////////
		 	}
 		})	
	}
}
var _successfullOtherOrgInvites=function (self,notvalidemailids) {
	logger.emit("log","_successfullOtherOrgInvites");
	self.emit("successfulOtherOrgInvites",{"success":{"message":"Other Organization invitation sent Successfully","notvalidemailids":notvalidemailids}});
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
	orgModel.aggregate({$match:{orgid:orgid}},{$unwind:"$usergrp"},{$match:{"usergrp._id":grpid,"usergrp.grpmembers":usermemberid,"usergrp.grpname":"admin"}},{$project:{usergrp:1}},function(err,orgadminuser){
		if(err){
			self.emit("failedRemoveOrgGroupMembers",{"error":{"code":"ED001","message":"Database Server Issue"+err}}); 	
		}else if(orgadminuser.length>0){
			self.emit("failedRemoveOrgGroupMembers",{"error":{"message":"You can not Remove admin user"}});
		}else{
			logger.emit("log","usermemberid"+usermemberid);
			orgModel.aggregate({$unwind:"$usergrp"},{$match:{"usergrp.grpmembers":usermemberid,orgid:orgid}},{$project:{name:1,usergrp:1}},function(err,usergrps){
				if(err){
					self.emit("failedRemoveOrgGroupMembers",{"error":{"code":"ED001","message":"Database Server Issue"+err}}); 
				}else if(usergrps.length==0){
					self.emit("failedRemoveOrgGroupMembers",{"error":{"code":"AU003","message":"Userid is wrong"}}); 
				}else{
					if(usergrps.length==1){
						////////////////////////////////////
						_updateUserAndRemoveFromOrg(self,user,orgid,grpid,usermemberid,usergrps[0].usergrp.grpname,usergrps[0].name);
						//////////////////////////////////
					}else{
						/////////////////////////////////
						_removeFromOrganizationGroup(self,user,orgid,grpid,usermemberid)
						//////////////////////////////
					}
				}
			});
		}
	})
}
var _updateUserAndRemoveFromOrg=function(self,user,orgid,grpid,usermemberid,grpname,orgname){
	var org={orgid:null,orgtype:null,orgname:null,isAdmin:null};
	userModel.update({userid:usermemberid},{$set:{org:org,usertype:"individual",prodousertype:"individual"}},function(err,deleteorguserstatus){
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
					////////////////////////////////////////////////////
                     _applyDefaultIndividualTrialPlanWhenUserRemvoeFromGroup(usermemberid)
					////////////////////////////////////////////////
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
var _applyDefaultIndividualTrialPlanWhenUserRemvoeFromGroup=function(userid){
	userModel.findOne({userid:userid},function(err,user){
		if(err){
			logger.emit("error","Database Issue"+err)
		}else if(!user){
			logger.emit("error","userid is wrong _applyDefaultIndividualTrialPlanWhenUserRemvoeFromGroup")
		}else{
			SubscriptionModel.findOne({plantype:"individual","planpaymentcommitment.amount":0},function(err,subscription){
				if(err){
					logger.emit("error","Database Issue"+err)
				}else if(!subscription){
					logger.emit("There is no trial subscription plan for individual");
				}else{
					var planperioddescription={quarterly:3,monthly:1,yearly:12};
					var planperiod=planperioddescription[subscription.planpaymentcommitment.commitmenttype];
					logger.emit('log',"planperiod"+planperiod);

					var currentdate=new Date();
					// var expirydate=new Date(currentdate.setDate(currentdate.getMonth()+3));
					var expirydate=new Date(new Date(currentdate).setMonth(currentdate.getMonth()+planperiod));
					var subscription_set={planid:subscription.planid,planstartdate:currentdate,planexpirydate:expirydate};
					var payment_data=new PaymentModel({userid:user.userid,price:0});
					payment_data.save(function(err,payment){
						if(err){
							self.emit("failedMakePayment",{"error":{"message":"Error in db to save new payment"}});				
						}else{
							userModel.update({userid:user.userid},{$set:{subscription:subscription_set,payment:{paymentid:payment.paymentid}}},function(err,userpaymentupdate){
								if(err){
									self.emit("failedMakePayment",{"error":{"message":"Error in db to update user payment details"+err}});				
								}else if(userpaymentupdate==0){
									self.emit("failedMakePayment",{"error":{"message":"Userid is wrong"}});					
								}else{
									logger.emit("log"," Default individual Trail Plan applied");
								}
							})
						}
					})
				}
			})
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
	}else if(broadcastmessagedata.broadcasttype==undefined || broadcastmessagedata.broadcasttype==""){
		self.emit("failedBroadcastMessage",{"error":{"code":"AV001","message":"Please pass broadcasttype"}}); 
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
				broadcastmessage[i].broadcast.broadcastid=broadcastmessage[i].broadcast._id;
				broadcastmessage[i].broadcast._id=undefined;

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
Organization.prototype.deleteOrgKeyClient = function(orgkeyclientids,orgid) {
	var self=this;
	if(orgkeyclientids==undefined){
		self.emit("failedDeleteOrgKeyClient",{"error":{"code":"AV001","message":"Please provide orgkeyclientids "}});
	}else if(orgkeyclientids.length==0){
		self.emit("failedDeleteOrgKeyClient",{"error":{"message":"Given orgkeyclientids is empty "}});
	}else{
		///////////////////////////////////////////////////////////////////
	_deleteOrgKeyClient(self,orgkeyclientids,orgid);
	/////////////////////////////////////////////////////////////////	
	}
	
};
var _deleteOrgKeyClient=function(self,orgkeyclientids,orgid){
	 var org_key_clients_array=[];
	orgkeyclientids=S(orgkeyclientids);
	// db.products.update({"product_images.imageid":{$in:["7pz904msymu","333"]}},{$pull:{"product_images":{imageid:{$in:["7pz904msymu","333"]}}}});
   if(orgkeyclientids.contains(",")){
   		org_key_clients_array=orgkeyclientids.split(",");
   }else{
   		org_key_clients_array.push(orgkeyclientids.s);
   }
	orgModel.findAndModify({orgid:orgid,"keyclients.clientid":{$in:org_key_clients_array}},[],{$pull:{keyclients:{clientid:{$in:org_key_clients_array}}}},{new:false},function(err,deletekeyclientstatus){
		if(err){
			self.emit("failedDeleteOrgKeyClient",{"error":{"code":"ED001","message":"function:_deleteOrgImage\nError in db to "}});
		}else if(!deletekeyclientstatus){
			self.emit("failedDeleteOrgKeyClient",{"error":{"message":"orgid or given orgimageids is wrong "}});
		}else{
			var keyclients=deletekeyclientstatus.keyclients;
			// org_images=JSON.parse(org_images);
			logger.emit("log","dd"+JSON.stringify(keyclients));
			var object_array=[];
			for(var i=0;i<keyclients.length;i++){
				object_array.push({Key:keyclients[i].key});
				console.log("test"+keyclients[i]);
			}
			logger.emit("log","object_array:"+JSON.stringify(object_array));
			var delete_aws_params={
				Bucket: keyclients[0].bucket, // required
  			Delete: { // required
    				Objects: object_array,
      			Quiet: true || false
      		}
      	}
      	logger.emit('log',"delete_aws_params:"+JSON.stringify(delete_aws_params));
        s3bucket.deleteObjects(delete_aws_params, function(err, data) {
			  if (err){
			  	logger.emit("error","Key Clients not deleted from amazon s3 orgid:"+orgid)
			  } else{
			  	logger.emit("log","Key Clients deleted from amazon s3 orgid:"+orgid);
			  } 
			})
			//////////////////////////////////
			_successfulDeleteOrgKeyClient(self);
			/////////////////////////////////////
		}
	})
}
var _successfulDeleteOrgKeyClient=function(self){
	logger.emit("log","_successfulDeleteOrgKeyClient");
	self.emit("successfulDeleteOrgKeyClient",{"success":{"message":"Delete Organizations Key Clients  Successfully"}});
}
Organization.prototype.deleteBroadCastMessage = function(orgid,broadcastid) {
	var self=this;

	///////////////////////////
	           _deleteBroadcastMessage(self,orgid,broadcastid);
	           ////////////////////////
};
// var _checkBroadCastIdIsCorrect=function(self,orgid,broadcastid){
// 	orgModel.findOne({orgid:orgid,"broadcast._id":broadcastid},{broadcast:1},function(err,orgbroadcast){
// 		if(err){
// 			self.emit("failedDeleteBroadcastMessage",{"error":{"code":"ED001","message":"Database Issue"}});
// 		}else if(!orgbroadcast){
// 			self.emit("failedDeleteBroadcastMessage",{"error":{"message":"broadcastid or orgid is wrong"}});
// 		}else{
// 				///////////////////////////
// 	           _deleteBroadcastMessage(self,orgid,broadcastid);
// 	           ////////////////////////
// 		}
// 	})
// }
var _deleteBroadcastMessage=function(self,orgid,broadcastid){
	orgModel.update({orgid:orgid,"broadcast._id":broadcastid},{$pull:{broadcast:{_id:broadcastid}}},function(err,deletebraodcaststatus){
		if(err){
			self.emit("failedDeleteBroadcastMessage",{"error":{"code":"ED001","message":"Database Issue"+err}});
		}else if(deletebraodcaststatus==0){
			self.emit("failedDeleteBroadcastMessage",{"error":{"message":"broadcastid or orgid is wrong"}});
		}else{
			//////////////////////////////////
			_successfullBroadcastMessage(self)
			////////////////////////////////
		}
	})
}
var _successfullBroadcastMessage=function(self){
   logger.emit("log","_successfullBroadcastMessage");
	self.emit("successfulDeleteBroadastMessage",{"success":{"message":"Organization broadcast message Deleted Successfully"}});
}	
Organization.prototype.getAllOrgnizationAnalytics = function() {
	var self=this;
  
  	///////////////////////////
	_getAllOrgnizationAnalytics(self);
	////////////////////////	
  
	
}
var _getAllOrgnizationAnalytics=function(self){

	 	var today = new Date();

    var lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 14);
	
    var queryall=orgModel.find({status:"active",orgtype:{$regex:"manufacturer",$options:"i"}},{orgid:1,name:1,description:1,org_logo:1}).sort({prodo_setupdate:-1});
    var querylatest=orgModel.find({status:"active",prodo_setupdate:{$lte:today},prodo_setupdate:{$gte:lastWeek}, orgtype:{$regex:"manufacturer",$options:"i"}},{orgid:1,name:1,description:1,org_logo:1}).sort({prodo_setupdate:-1});
 	  queryall.exec(function(err,organalyticsall){
			if(err){
				self.emit("failedgetAllOrgnizationAnalytics",{error:{code:"ED001",message:"Database Issue"+err}})
			}else if(organalyticsall.length==0){
	      self.emit("failedgetAllOrgnizationAnalytics",{error:{message:"No Organizations"}})
			}else{
				querylatest.exec(function(err,organalyticslatest){
					if(err){
						self.emit("failedgetAllOrgnizationAnalytics",{error:{code:"ED001",message:"Database Issue"+err}})
					}else {
						var organalyticssponser=[];
			      self.emit("getOrgAnalyticsData",organalyticsall,organalyticslatest,organalyticssponser)
					}
				})
			}
	 })
}
var _successfullOrgAnalytics=function(self,result){
	self.emit("successfulgetAllOrgnizationAnalytics",result)
}
Organization.prototype.publishOrganization = function(orgid) {
	var self=this;
  ///////////////////////////////////
  _publishOrganization(self,orgid)
  ///////////////////////////////////
	
}
var _publishOrganization=function(self,orgid){
	orgModel.findOne({orgid:orgid,status:{$ne:"deactive"}},function(err,organziation){
		if(err){
			self.emit("failedPublishOrganization",{error:{code:"ED001",message:"Database Issue"}})
		}else if(!organziation){
			self.emit("failedPublishOrganization",{error:{message:"orgid is wrong"}})	
		}else{
			if(organziation.status=="active"){
				self.emit("failedPublishOrganization",{error:{message:"Organization already published"}})	
			}else{
				productModel.find({orgid:orgid},function(err,products){
					if(err){
						self.emit("failedPublishOrganization",{error:{code:"ED001",message:"Database Issue"}})
					}else if(products.length==0){
						self.emit("failedPublishOrganization",{error:{message:"Please add atleast one product to publish your organization"}})		
					}else{
						orgModel.update({orgid:orgid},{$set:{status:"active"}},function(err,orgstaus){
							if(err){
								self.emit("failedPublishOrganization",{error:{code:"ED001",message:"Database Issue"}})
							}else if(orgstaus==0){
								self.emit("failedPublishOrganization",{error:{message:"orgid is wrong"}})		
							}else{
								//////////////////////////////
								_updatePublishtUserOrgDetails(organziation)
								////////////////////////
								//////////////////////////////////
								_successfullPublishOrganization(self)
								//////////////////////////////////
							}
						})
					}
				})
				
			}
		}
	})
}
var _successfullPublishOrganization=function(self){
	self.emit("successfulPublishOrganization",{success:{message:"Organization successfully published"}})
}
var _updatePublishtUserOrgDetails=function(organziation){
	userModel.update({"org.orgid":organziation.orgid},{$set:{"org.status":organziation.status}},{multi:true},function(err,userorgstatus){
		if(err){
			logger.emit("error","Database Issue")
		}else if(userorgstatus==0){
			logger.emit("error","No organization user")
		}else{
			logger.emit("log","successfully change user org status");
		}
	})
}