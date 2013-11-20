
var util = require("util");
var events = require("events");
var logger=require("../../common/js/logger");
var userModel=require("./user-model");
var VerificationTokenModel=require('../../common/js/verification-token-model')
var EmailTemplateModel=require('../../common/js/email-template-model');
var S=require('string');
var commonapi = require('../../common/js/common-api');
var CONFIG = require('config').Prodonus;
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var regxemail = /\S+@\S+\.\S+/;
var User = function(userdata) {
	this.user=userdata;
};
 
User.prototype = new events.EventEmitter;
module.exports = User;

//register new register
User.prototype.registerUser = function() {
	var self=this;

		///////////////////////////////////
	_validateRegisterUser(self,this.user);
	 ////////////////////////////////////
};
var _validateRegisterUser = function(self,user) {
		//check if user exist in database
		//abc(err,userdata,this)
	userModel.findOne({email:user.email},{email:1},function(err,userdata){
		if(err){
			self.emit("failedUserRegistration",{"error":{"code":"ED001","message":"Error in db to find user"}});
		}else if(userdata){
			// console.log("userData777"+userdata);
			self.emit("failedUserRegistration",{"error":{"code":"AU001","message":"Email already exist"}});
		}else{
		// validate the new user data
			

	 	  if( user.fullname==undefined){
		  	self.emit("failedUserRegistration",{"error":{"code":"AV001","message":"Please enter fullname"}});
	 	  } else if(user.email==undefined){
	 	    self.emit("failedUserRegistration",{"error":{"code":"AV001","message":"please enter emailid"}});
		  }else if(!regxemail.test(user.email)){
 	  		self.emit("failedUserRegistration",{"error":{"code":"AV001","message":"please enter valid email"}});
	 	  }else if(user.password==undefined){
		  	self.emit("failedUserRegistration",{"error":{"code":"AV001","message":"please enter passsword"}});
	 	  } else if(user.password.length<9){
	 	  	self.emit("failedUserRegistration",{"error":{"code":"AV001","message":"passsword maximum length should be 8"}});
		  // }else if(passwordformatvalidtion){//to be done later
	 	 //  	self.emit("failedUserRegistration",{"error":{"code":"AV001","message":"passsword maximum length should be 8"}});
	 	  }	else if(user.terms==false){
	 	  	self.emit("failedUserRegistration",{"error":{"code":"AV001","message":"please agree the terms and condition"}});
	 	  }else{
	 	    	logger.emit("log","_validated");

	 	    	/////////////////////
	 			  _addUser(self,user);
	 			  /////////////////////
	 	  }
		}
	})
};
   var _addUser = function(self,userdata) {
		//adding user
		var user=userModel(userdata);
	    user.save(function(err,user){
	    	console.log("after save"+user);
	    	console.log("errr"+err);
	      	if(err){
	        	self.emit("failedUserRegistration",{"error":{"code":"ED001","message":"Error in db to add user"}});
	      	}else if(user){  
		        var userid = user.userid;
				logger.emit("log","addeduser");
				console.log("addedUser");

				///////////////////////////////////
				_createVerificationToken(self,user);		        
				///////////////////////////////////
	      	}
	    })
	};

	var _createVerificationToken = function(self,user){
		var verificationToken = new VerificationTokenModel({_userId: user.userid,tokentype:"user"});
        verificationToken.createVerificationToken(function (err, token) {
        	console.log("addedUser1");
          if (err){  
            self.emit("failedUserRegistration",{"error":{"code":"AT001","message":"Error in db to create verificationToken"}});
          }else{
          	console.log("addedUser2");
          	logger.emit("log","createdtoken");

          	//////////////////////////////////////
          _sendVerificationEmail(self,token,user);
           //////////////////////////////////////
          }
		})
	};
	var _sendVerificationEmail = function(self,token, user) {
		//send verification email to activate the user account
		console.log("addedUser3");
		EmailTemplateModel.findOne({"templatetype":"verify"},function(err,emailtemplate){
			console.log("addedUser4");
			if(err){
				console.log("addedUser5");
				self.emit("failedUserRegistration",{"error":{"code":"ED001","message":"Error in db to find verify emailtemplate"}});
			}else if(emailtemplate){
				console.log("addedUser6");
				var url = "http://"+CONFIG.serverName+"/api/verify/"+token;
				var html=emailtemplate.description;
	            html=S(html);
	            html=html.replaceAll("<name>",user.fullname);
	            html=html.replaceAll("<url>",url);
	          	var message = {
	                from: "Prodonus  <noreply@prodonus.com>", // sender address
	                to: user.email, // list of receivers
	                subject:emailtemplate.subject, // Subject line
	                html: html.s // html body
	              };
	            
	            //calling to sendmail method
	            commonapi.sendMail(message, function (result){
	            	if(result=="failure"){
	            		self.emit("failedUserRegistration",{"error":{"code":"AT001","message":"Error to send verification email"}});
	            	}else{
	            		logger.emit("info","User added successfully");
	            		/////////////////////////////////
	            		_successfulUserRegistration(self)
	            		////////////////////////////////
	            	}
	            });
	        }else{
	        	self.emit("failedUserRegistration",{"error":{"code":"ED002","message":"Server setup template issue"}});
			}
	    })
	}
	var _successfulUserRegistration = function(self) {
		//validate the user data
		logger.emit("info","successfuluserRegistration");
		self.emit("successfulUserRegistration", {"success":{"message":"User Added Successfully"}});
	};



//verify user
User.prototype.activateAccount = function(token) {
	var self=this;
	////////////////////////
	_verifyToken(self,token);
	///////////////////////

};
var _verifyToken = function(self,token) {
	console.log("calling to verify token");
	// self.emit("failedUserActivation",{"error":{"code":"ED001","message":"Error in Db to find verification token"}});
  VerificationTokenModel.findAndModify({token: token,status:"active",tokentype:"user"},[],
                {$set: {status:"deactive"}},{new:false} ,function (err, userVerificationToken){
    if (err){

    	self.emit("failedUserActivation",{"error":{"code":"ED001","message":"Error in Db to find verification token"}});
    } else if (!userVerificationToken){
       self.emit("tokenredirect","#/regeneratetoken")
    }else{
    	userModel.findAndModify({ userid: userVerificationToken._userId},[],
                {$set: {verified:true}},{new:false}, function(err,user){
          if(err){
    			self.emit("failedUserActivation",{"error":{"code":"ED001","message":"Error in Db to find verification token"}});
          }else if(!user){
          		self.emit("failedUserActivation",{"error":{"code":"AV001","message":"Error in verifying user"}});
        	}else{

        		///////////////////////////
        	 _sendWelcomeEmail(self,user);	
        	 ////////////////////////////
        	}
        })
    }
  })
};
var _sendWelcomeEmail = function (self,user) {
 	
   EmailTemplateModel.findOne({"templatetype":"welcome"},function(err,emailtemplate){
	   	if(err){
	   		self.emit("failedUserRegistration",{"error":{"code":"ED001","message":"Error in db to find welcome emailtemplate"}});
	   	}else if(emailtemplate){
	   		var html=emailtemplate.description;
    	    html=S(html);
      		html=html.replaceAll("<fullname>",user.fullname);
      		var message = {
		        from: "Prodonus  <noreply@prodonus.com>", // sender address
		        to: user.email, // list of receivers
		        subject:emailtemplate.subject, // Subject line
		        html: html+"" // html body
      		};
      		commonapi.sendMail(message, function (result){
		        if (result == "failure") {
		        	self.emit("failedUserActivation",{"error":{"code":"AT002","message":"Error in to send welcome mail"}});
		        } else {
		        	//successfull user activation
		        	////////////////////////////////
		           _successfulUserActivation(self);
		           ///////////////////////////////
		        }
     		});
	   	}else{
	   		self.emit("failedUserActivation",{"error":{"code":"ED002","message":"Server setup template issue"}});

	   	}
	 })
     
 };
 var _successfulUserActivation = function(self) {
		//validate the user data
		logger.emit("info","successfulUserActivation");
		self.emit("tokenredirect","#/signin");
	}

//signin
User.prototype.signin = function() {
	 var self=this;
	 var userdata=self.user;

	 /////////////////////////////
	_validateSignin(self,userdata);
	/////////////////////////////
	}
var _validateSignin=function(self,userdata){
	console.log("signin1");
	console.log("userdata"+userdata.email+userdata.password);
	if(userdata.email==undefined){
		self.emit("failedUserSignin",{"error":{"code":"AV001","message":"please enter emailid"}});
	}else if(!regxemail.test(userdata.email)){
		self.emit("failedUserSigin",{"error":{"code":"AV001","message":"please enter valid email"}});
	}else if(userdata.password==undefined){
		self.emit("failedUserSignin",{"error":{"code":"AV001","message":"please enter password"}});
	}else{
		console.log("signin2");
		///////////////////////
		self.emit("passportauthenticate");
		///////////////////////
	}
}


User.prototype.signinSession=function(user){
var self=this;
_isSubscribed(self,user);
}
var _isSubscribed=function(self,user){
 	var isubscribed=true;
	// if(user.subscription.planid==undefined){

	// }else{

	// }
	if(!isubscribed){
		 self.emit("failedUserSignin",{"error":{"code":"AS001","message":"User is not subscribed to any plan","user":user}}); 
	}else{
		/////////////////////////////////
		_isSubscriptionExpired(self,user);
		/////////////////////////////////
	}
}
var _isSubscriptionExpired=function(self,user){
	var isubscriptionexpired=true;
	if(isubscriptionexpired){
		self.emit("failedUserSignin",{"error":{"code":"AS002","message":"User subscription has expired","user":user}}); 
	}else{
		//to check user has made payment or not

		//////////////////////////
		_hasDonePayment(self,user);
		//////////////////////////
	}
}
var _hasDonePayment=function(self,user){

  //user is invited by organization admin 
  /*user.orgid exist and not admin then the user has invited by user
  if(user.organization.orgid!=undefined)
  { 
    if(user.organization.isAdmin==true){//admin of organization

    }else{
      there is no need to make payment
    }
  
  }else{//idividual user
      
  }
  //user.orgid exist
  //user is admin for particular user to check in admingroup userid
*/
  var donepayment=true;
  if(!donepayment){
  	self.emit("failedUserSignin",{"error":{"code":"AP001","message":"User has not made payment","user":user}}); 
  }else{
  	///////////////////////////////
  	_successfulUserSigin(self,user);
  	///////////////////////////////
  }
}
var _successfulUserSigin = function(self,user) {
		//validate the user data
		logger.emit("log","successfulUserSignin");
		self.emit("successfulUserSignin",{"success":{"message":"Login Successful","user":user}});
	}

var isAuthorizedUser=function(userid,sessionuserid){
	var isAdmin=true;//to be done later user is admin
	
	if(userid!=sessionuserid&& isAdmin){
		return false;
	}else{
		return true;
	}
}
User.prototype.updateUser = function(userid,sessionuserid) {
	var self=this;
	console.log("userid"+userid);
	console.log("sessionuserid"+sessionuserid);
	var userdata=this.user;
	if(!isAuthorizedUser(userid,sessionuserid)){
		self.emit("failedUserUpdation",{"error":{"code":"EA001","message":"You have not authorize to done this action"}})
	}else{
		_updateUser(self,userid,userdata);
	}
	
};

var _updateUser=function(self,userid,userdata){
	
	logger.emit("log","_updateUser");
	userModel.update({userid:userid},{$set:userdata},function(err,userupdatestatus){
		if(err){
			self.emit("failedUserUpdation",{"error":{"code":"ED001","message":"Error in db to update user data"}});
		}else if(userupdatestatus!=1){

			self.emit("failedUserUpdation",{"error":{"code":"AU002","message":"Provided userid is wrong"}});
		}else{
			_successfulUserUpdation(self);
		}
	})
}
var _successfulUserUpdation = function(self) {
		//validate the user data
		logger.emit("log","_successfulUserUpdation");
		logger.emit("log","successfulUserUpdation");
		self.emit("successfulUserUpdation", {"success":{"message":"User Updated Successfully"}});
	}
User.prototype.deleteUser = function(userid,sessionuserid) {
	var self=this;
	if(!isAuthorizedUser(userid,sessionuserid)){
		self.emit("failedUserDeletion",{"error":{"code":"EA001","message":"You have not authorize to done this action"}})
	}else{
		_deleteUser(self,userid);
	}
};
var _deleteUser=function(self,userid){
	userModel.update({userid:userid},{$set:{status:"deactive"}},function(err,userupdatestatus){
		if(err){
			self.emit("failedUserDeletion",{"error":{"code":"ED001","message":"Error in db to update user data"}});
		}else if(userupdatestatus!=1){
			self.emit("failedUserDeletion",{"error":{"code":"AU002","message":"Provided userid is wrong"}});
		}else{
			_successfulUserDeletion(self);
		}
	})
}
var _successfulUserDeletion = function(self) {
		//validate the user data
		logger.emit("log","_successfulUserDeletion");
	
		self.emit("successfulUserDeletion", {"success":{"message":"User Deleted Successfully"}});
	}
User.prototype.getUser = function() {
};
User.prototype.getAllUsers = function() {
};

