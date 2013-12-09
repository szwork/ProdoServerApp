var util = require("util");
var events = require("events");
var userModel = require('../../user/js/user-model');
var orgModel=require("./org-model");
var logger=require("../../common/js/logger");
var S=require("string");
var EmailTemplateModel=require('../../common/js/email-template-model');
var orgHistoryModel=require("./org-history-model");
var verificationTokenModel = require('../../common/js/verification-token-model');
var Organization = function(organizationdata) {
	this.organization=organizationdata;
};
Organization.prototype = new events.EventEmitter;
module.exports = Organization;

Organization.prototype.addOrganization=function(sessionuserid){
	var self=this;
	var organizationdata=this.organization;
	_validateOganizationData(self,organizationdata,sessionuserid);
}

	var _validateOganizationData = function(self,organizationdata,sessionuserid) {
		//validate the org data
		
		  if(organizationdata.name==undefined){
		  	self.emit("failedOrgAdd",{"error":{"message":"Please type organization name"}});
		  } else if(organizationdata.orgtype==undefined){
		    self.emit("failedOrgAdd",{"error":{"message":"please select organization type"}});
		  }else if(organizationdata.location==undefined){
		  	self.emit("failedOrgAdd",{"error":{"message":"please give a location details"}});
		  }else if(organizationdata.terms==false){
		  	self.emit("failedOrgAdd",{"error":{"message":"please agree the terms and condition"}});
		  }else{
		    	logger.emit("log","_validated");
					//this.emit("validated", organizationdata);
					////////////////////////////////////////////////////////////
					_hasAlreadyOrganization(self,organizationdata,sessionuserid);
					///////////////////////////////////////////////////////////
				
		  }
   
	};
	var _hasAlreadyOrganization=function(self,organizationdata,sessionuserid){
		userModel.findOne({userid:sessionuserid,orgid:null},{userid:1},function(err,user){
			if(err){
					self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"Error in db to find user"}});
				}else if(user){
					logger.emit("log","_hasAlreadyOrganization");
					///////////////////////////////////////
					_addOrganization(self,organizationdata,sessionuserid);
					/////////////////////////////////
				}else{
					self.emit("failedOrgAdd",{"error":{"code":"AO001","message":"You can add only one organization"}});
				}
		})
	}

	var _addOrganization = function(self,organizationdata,sessionuserid) {
		//validate the org data
		var organization=new orgModel(organizationdata);
		organization.save(function(err,organization){
	     if(err){
	     	 self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"Error in db to find user"}});
	    }else{  
	    	logger.emit("log","_addOrganization");
	    	//////////////////////////////////////////////
		    _addUserToOrg(self,organization,sessionuserid);
		    /////////////////////////////////////////////      
	     }
	  })
	};

	var _addUserToOrg = function(self,organization,sessionuserid) {
		userModel.update({userid:sessionuserid},{$set:{orgid:organization.orgid,isAdmin:true}},function(err,userupdatestatus){
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
	      	for(var i=0;i<organizationdata.usergrp.length;i++){

	      		invites+=organizationdata.usergrp[0].invites;
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
		var j=0;
		console.log("usergrp"+usergrp[0].grpname);
		
		
		for(var i=0;i<usergrp.length;i++){
			var invites=S(usergrp[i].invites);
			while(invites.length>0)
			{
				if(invites.contains(',')){
		      var pos=invites.indexOf(',');
			    if(invites.substring(0,pos).trim().length!=0){
			      invitees[j]=invites.substring(0,pos).trim().s;
			      j++;
			    }
			   	invites=invites.substring(pos+1);
				} else  {
			  	if(invites.trim().length!=0){
			         invitees[j]=invites.trim().s;
			         j++;
			    }
			   	invites="";
			  }
			}
		};
		console.log("invitee"+invitees);
		logger.emit("log","invitee"+invitees);
		userModel.find({email:{$in:invitees}},{email:1},function(err,user){
	    if(err){
	    	self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"Error in db to find users"+err}});
	    }else{
	      for(var i=0;i<user.length;i++)
	      {
          for(var j=0;j<invitees.length;j++)
          {
            if(invitees[j]==user[i].email){
              invitees.splice(j,1);
            }
          }
	      }
	      var userdata=[];
	      for(var i=0;i<invitees.length;i++)
	      {
	        userdata[i]={email:invitees[i],orgid:organization.orgid}
	      }
	      if(userdata.length>0){
	        userModel.create(userdata,function(err,inviteuserdata){
	          if(err){
	            self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"Error in db to create users"+err}});
	          }else if(inviteuserdata){
	          	logger.emit("log",inviteuserdata);
	          	var inviteusers=userdata;
	          	/////////////////////////////////////////////////
	           _sendEmailToInvitees(self,organization,userdata);
	            /////////////////////////////////////////////////
	          }
	        })
	      }else{
	      	logger.emit("log","emails privided aleready exists");
	        //callback(null,userdata);
	        ////////////////////////////////
	      	_successfulOrgAdd(self);
	      	///////////////////////////////
	      }
	    }
  	})

		
	};

	var _sendEmailToInvitees = function(self,organization,userdata) {
		//validate the org data
		var initialvalue=0;
		EmailTemplateModel.findOne({templatetype:"invite"},function(err,emailtemplate){
		  	if(err){
		    	 self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"Error in db to find invite email templates"}});
		  	}else if(emailtemplate){
		  		logger.emit("log","calling to sendinvitemail");
					/////////////////////////////////////////////////////////////////////////////////
					self.emit("sendinvitemail", userdata,emailtemplate,organization.name,initialvalue);
					////////////////////////////////////////////////////////////////////////////////

					/////////////////////////////////////////
					_addInviteeGroupMembers(self,organization);
					///////////////////////////////////////
		    }else{
		  		self.emit("failedOrgAdd",{"error":{"code":"ED002","message":"Server setup template issue"}});
		  	}
		})
	}

	var _addInviteeGroupMembers = function(self,organization) {
		var organizationdata=self.organization;
		var usergrpdata=organizationdata.usergrp;
		var usergrp=[];
		var invitees=[];
		console.log("usergroup data"+JSON.stringify(self.organization));
		for(var i=0;i<usergrpdata.length;i++)
		{	
			var j=0;

			var invites=S(usergrpdata[i].invites);
			while(invites.length>0)
			{
				if(invites.contains(',')){
		      var pos=invites.indexOf(',');
			    if(invites.substring(0,pos).trim().length!=0){
			      invitees[j]=invites.substring(0,pos).trim().s;
			      j++;
			    }
			   	invites=invites.substring(pos+1);
				} else  {
			  	if(invites.trim().length!=0){
			         invitees[j]=invites.trim().s;
			         j++;
			    }
			   	invites="";
			  }

			}

			usergrp[i]={grpname:usergrpdata[i].grpname,grpinvites:invitees};
			invitees=[];
		}
		////////////////////////////////////////
		addgrpmember(self,organization,usergrp,0);
		////////////////////////////////////////
	};
	var addgrpmember=function(self,organization,usergrp,i){

		if(usergrp.length>i){ 
      
      userModel.find({ email:{ $in :usergrp[i].grpinvites }},{userid:1},function(err,user){
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
         
          orgModel.update({ orgid :organization.orgid,"usergrp.grpname":usergrp[i].grpname},{$pushAll:{"usergrp.$.grpmembers":newuser},$set:{"usergrp.$.invites":""}},function(err,status){
            if( err ){
            self.emit("failedOrgAdd",{"error":{"code":"ED001","message":"Error in db to update org to add grpmembers"}});
            }else if(status==1){
              // callback("success");
            	i+=1;
					    ////////////////////////////////////////
							addgrpmember(self,organization,usergrp,i);
							////////////////////////////////////////
            }else {
           		i+=1;
           		logger.emit("error","Provided orgid doesnt exists");
              ////////////////////////////////////////
							addgrpmember(self,organization,usergrp,i);
							////////////////////////////////////////
          }
          });//end of orgmodel update
        }
      })
    } else {
    	//////////////////////
     _successfulOrgAdd(self);
     ///////////////////////
    }
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
	orgModel.findOne({orgid:orgid},function(err,organization){
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
	orgModel.find({},function(err,organization){
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