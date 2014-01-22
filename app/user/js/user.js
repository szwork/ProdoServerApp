	
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
var qs = require('querystring');
var request=require("request");
var orgModel=require("../../org/js/org-model");
var nodemailer=require("nodemailer");
var DiscountModel=require("../../discount/js/discount-model");
var PaymentModel=require("../../subscription/js/payment-model");
var SubscriptionModel=require("../../subscription/js/subscription-model");
var productModel=require("../../product/js/product-model");
var Product=require("../../product/js/product");
var BusinessOpportunityModel=require("../../businessopportunity/js/business-opportunity-model");
var smtpTransport = nodemailer.createTransport("SMTP", {
    host: "smtp.ipage.com", // hostname
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    auth: {
        user: "sunil@giantleapsystems.com",
        pass: "Sunil12345"
    }
});
var User = function(userdata) {
	this.user=userdata;
};

var regxemail = /\S+@\S+\.\S+/; 
User.prototype = new events.EventEmitter;
module.exports = User;

//register new register
User.prototype.registerUser = function(host) {
	var self=this;

		///////////////////////////////////
	_validateRegisterUser(self,this.user,host);
	 ////////////////////////////////////
};
//to check email validation
var isValidEmail=function(email){

	if(email==undefined){
	 	return {"error":{"code":"AV001","message":"please pass emailid"}};
	}else if(email.trim().length==0){
		return {"error":{"code":"AV001","message":"please enter emailid"}};
	}else if(!regxemail.test(email)){
		return {"error":{"code":"AV001","message":"please enter valid email"}};
 	}else{
 		return {"success":{"message":"Valid email id"}};
 	}
}
//validate user registration data
var _validateRegisterUser = function(self,userdata,host) {
		//check if user exist in database
		//abc(err,userdata,this)
	if(userdata==undefined){
		self.emit("failedUserRegistration",{"error":{"code":"AV001","message":"Please provide userdata"}});
	}else if(userdata.username==undefined){
		self.emit("failedUserRegistration",{"error":{"code":"AV001","message":"Please provide username"}});
	} else if(userdata.username.length<6 || userdata.username.length>15){
		self.emit("failedUserRegistration",{"error":{"message":"Username should greater than 6 and less than 15 chars"}});
	}else if(isValidEmail(userdata.email).error!=undefined){
	    self.emit("failedUserRegistration",isValidEmail(userdata.email));
	 }else if(userdata.password==undefined){
  		self.emit("failedUserRegistration",{"error":{"code":"AV001","message":"please enter passsword"}});
	 } else if(userdata.password.length<5){
	  	self.emit("failedUserRegistration",{"error":{"code":"AV001","message":"passsword minimum length should be 6"}});
  	 }	else if(userdata.terms==false){
	  	self.emit("failedUserRegistration",{"error":{"code":"AV001","message":"please agree the terms and condition"}});
	  }else{
	  	userModel.findOne({email:userdata.email,username:userdata.username},{email:1}).lean().exec(function(err,user){
			if(err){
				self.emit("failedUserRegistration",{"error":{"code":"ED001","message":"Error in db to find user"}});
			}else if(user){
				// console.log("userData777"+userdata);
				self.emit("failedUserRegistration",{"error":{"code":"AU001","message":"Email already exist or Username already exists"}});
			}else{
		// validate the new user data
			
	 	    	logger.emit("log","_validated");

	 	    	///////////////////////
	 			 _addUser(self,userdata,host);
	 			 ///////////////////////
	 	  }
		})
	}
};
   var _addUser = function(self,userdata,host) {
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
				_createVerificationToken(self,user,host);		        
				///////////////////////////////////
	      	}
	    })
	};
	//create verification token
	var _createVerificationToken = function(self,user,host){
		var verificationToken = new VerificationTokenModel({_userId: user.userid,tokentype:"signupuser"});
        verificationToken.createVerificationToken(function (err, token) {
        	console.log("addedUser1");
          if (err){  
            self.emit("failedUserRegistration",{"error":{"code":"AT001","message":"Error in db to create verificationToken"}});
          }else{
          	console.log("addedUser2");
          	logger.emit("log","createdtoken");

          	//////////////////////////////////////
          _sendVerificationEmail(self,token,user,host);
           //////////////////////////////////////
          }
		})
	};
	//find verify template and send verification token
	var _sendVerificationEmail = function(self,token, user,host) {
		logger.emit("log","host"+host);
		//send verification email to activate the user account
		console.log("addedUser3");
		EmailTemplateModel.findOne({"templatetype":"verify"}).lean().exec(function(err,emailtemplate){
			console.log("addedUser4");
			if(err){
				console.log("addedUser5");
				self.emit("failedUserRegistration",{"error":{"code":"ED001","message":"Error in db to find verify emailtemplate"}});
			}else if(emailtemplate){
				console.log("addedUser6");
				var url = "http://"+host+"/api/verify/"+token;
				var html=emailtemplate.description;
	            html=S(html);
	            html=html.replaceAll("<name>",user.fullname);
	            html=html.replaceAll("<url>",url);
	          	var message = {
	                from: "Prodonus <sunil@giantleapsystems.com>", // sender address
	                to: user.email, // list of receivers
	                subject:emailtemplate.subject, // Subject line
	                html: html.s // html body
	              };
	            logger.emit("log",JSON.stringify(message));
	 			 // calling to sendmail method
	            commonapi.sendMail(message,CONFIG.smtp_general,function (result){
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
//verify token to activate account
var _verifyToken = function(self,token) {
	console.log("calling to verify token");
	// self.emit("failedUserActivation",{"error":{"code":"ED001","message":"Error in Db to find verification token"}});
  VerificationTokenModel.findAndModify({token: token,status:"active",tokentype:"user"},[],
                {$set: {status:"deactive"}},{new:false} ,function (err, userVerificationToken){
    if (err){

    	self.emit("failedUserActivation",{"error":{"code":"ED001","message":"Error in Db to find verification token"}});
    } else if (userVerificationToken){
      userModel.findAndModify({ userid: userVerificationToken._userId},[],
                {$set: {verified:true}},{new:false}, function(err,user){
          if(err){
    			self.emit("failedUserActivation",{"error":{"code":"ED001","message":"Error in Db to find verification token"}});
          }else if(!user){
          		self.emit("failedUserActivation",{"error":{"code":"AV001","message":"Error in verifying user"}});
        	}else{
        		//here it will check user of type invitee user or not
        		if(user.password!=undefined && user.orgid==undefined){
        		///////////////////////////
        	 _sendWelcomeEmail(self,user);	//user
        	 ////////////////////////////	
        		}else{
        		///////////////////////////
        	 _sendWelcomeInviteEmail(self,user);	//invitee user 
        	 ////////////////////////////
        	}
        }
      })
    }else{
    	
    	self.emit("tokenredirect","#/regeneratetoken");
    }
  })
};
var _sendWelcomeInviteEmail = function (self,user) {
	
   EmailTemplateModel.findOne({"templatetype":"welcomeinvite"}).lean().exec(function(err,emailtemplate){
	   	if(err){
	   		self.emit("failedUserActivation",{"error":{"code":"ED001","message":"Error in db to find welcome emailtemplate"}});
	   	}else if(emailtemplate){
	   		var otp = Math.floor(Math.random()*100000000);
	   		commonapi.getbcrypstring(otp,function(err,hashpassword){
					if(err){
						self.emit("failedUserActivation",{"error":{"code":"AB001","message":"Error in get bcrypt passsword"}});
					}else{
						userModel.update({userid:user.userid},{$set:{password:hashpassword,isOtpPassword:true}},function(err,status){
							if(err){
								self.emit("failedUserActivation",{"error":{"code":"ED001","message":"Error in db to reset password users"}});
							}else if(status!=1){
								self.emit("failedUserActivation",{"error":{"code":"AU005","message":"User does't exists"}});
							}else{
								var html=emailtemplate.description;
			    	    html=S(html);
			      		html=html.replaceAll("<orgname>",user.orgid);
			      		html=html.replaceAll("<password>",otp);
			      		var message = {
					        from: "Prodonus  <sunil@giantleapsystems.com>", // sender address
					        to: user.email, // list of receivers
					        subject:emailtemplate.subject, // Subject line
					        html: html+"" // html body
			      		};
			      		commonapi.sendMail(message,CONFIG.smtp_general, function (result){
					        if (result == "failure") {
					        	self.emit("failedUserActivation",{"error":{"code":"AT001","message":"Error in to send welcome mail"}});
					        } else {
					        	//successfull user activation
					        	////////////////////////////////
					           _successfulUserActivation(self);
					           ///////////////////////////////
					        }
			     			});
							}
						})
					}
				})
	   		
	   	}else{
	   		self.emit("failedUserActivation",{"error":{"code":"ED002","message":"Server setup template issue"}});

	   	}
	 })
     
 };
//send welcome mail
var _sendWelcomeEmail = function (self,user) {
	
   EmailTemplateModel.findOne({"templatetype":"welcome"}).lean().exec(function(err,emailtemplate){
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
      		commonapi.sendMail(message, CONFIG.smtp_general,function (result){
		        if (result == "failure") {
		        	self.emit("failedUserActivation",{"error":{"code":"AT001","message":"Error in to send welcome mail"}});
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
 //after successuser activation
 var _successfulUserActivation = function(self) {
		//validate the user data
		logger.emit("info","successfulUserActivation");
		self.emit("tokenredirect","#/activateaccount");
	}

//signinfi
User.prototype.signin = function() {
	 var self=this;
	 var userdata=self.user;

	 /////////////////////////////
	_validateSignin(self,userdata);
	/////////////////////////////
	}
var _validateSignin=function(self,userdata){
	console.log("signin1");
	if(userdata==undefined){
		self.emit("failedUserSignin",{"error":{"code":"AV001","message":"please provide userdata"}});
	}else if(isValidEmail(userdata.email).error!=undefined){
	 	self.emit("failedUserSignin",isValidEmail(userdata.email));
	}else if(userdata.password==undefined){
		self.emit("failedUserSignin",{"error":{"code":"AV001","message":"please enter password"}});
	}else{
		console.log("signin2");
		///////////////////////
		//_passportauthenticate(self,userdata);
		self.emit("passportauthenticate",userdata);
		///////////////////////
	}
}


User.prototype.signinSession=function(user){
var self=this;
///////////////////////////
_isOTPUser(self,user);
/////////////////////
};
var _isOrganizationUser=function(user,callback){
	if(user.org!=undefined){
		//console.log("organization user");
		orgModel.findOne({orgid:user.org.orgid},{name:1,usergrp:1,orgtype:1}).lean().exec(function(err,organization){
            if(err){

            }else if(organization){
              var grpname="";
              var usergrp=organization.usergrp;
              for(var i=0;i<usergrp.length;i++){
                var grpmember=usergrp[i].grpmembers;
                for(var j=0;j<grpmember.length;j++){
                	if(user.userid==grpmember[j]){
                		grpname=usergrp[i].grpname;
                	}

                }
              }
              //user=JSON.stringify(user);
              var userdata=JSON.stringify(user);
              userdata=JSON.parse(userdata);
              userdata.org.orgname=organization.name;
            

              userdata.org.grpname=grpname;
              console.log("user"+grpname);

              console.log("user in org"+userdata+"organization name"+organization.name+"grpname"+grpname);
              
				/////////////////////////
				callback(userdata);
				/////////////////////////
			}else{
        logger.emit("log","hi");
            }
         }); 
	}else{
		/////////////////////////
		callback(user);
	    /////////////////////////
	}
}
var getUserRequiredData=function(user,callback){
    
	var user_senddata={userid:user.userid,username:user.username,products_followed:user.products_followed,isOtpPassword:user.isOtpPassword,subscription:user.subscription};
	// user=JSON.stringify(user);
	// user=JSON.parse(user);
	console.log("log","user"+user);
  // user=JSON.stringify(user);
  console.log("org length"+Object.keys(user.org).length)
		
	if(user.org.orgid!=null && user.org.isAdmin!=null){
		user_senddata.org=user.org;
	}
	logger.emit("log","user___"+JSON.stringify(user_senddata));
	_isOrganizationUser(user_senddata,function(user_senddata){
		console.log("subscription length"+Object.keys(user.subscription).length)
				
		if(user.subscription.planid==null){
			user_senddata.isSubscribed=false;
		}else{
			user_senddata.isSubscribed=true;
			if(user.subscription.planexpirydate==null){
				user_senddata.subscriptionExpired=true;
			}else{
				if(new Date(user.subscription.planexpirydate)<new Date()){//subscription expired
					user_senddata.subscriptionExpired=true;
				}else{
					user_senddata.subscriptionExpired=false;
					// console.log("hit"+user.payment);
	        		console.log("payment length"+Object.keys(user.payment).length)
					if(user.payment.paymentid==null){
						user_senddata.hasDonePayment=false;
					}else{
						user_senddata.hasDonePayment=true;
					}
				}	
			}
		}
		callback(user_senddata);

	})
}
var _isOTPUser=function(self,user){
	logger.emit("log","_isOTPUser user"+user);
	getUserRequiredData(user,function(userdata){
			if(userdata.isOtpPassword==true){
				self.emit("failedUserSignin",{"error":{"code":"AU006","message":"OTP RESET Password","user":user}}); 
			}else{

		/////////////////////////
		_isSubscribed(self,userdata);
		/////////////////////////
	}	
	
		})
	
}

var _isSubscribed=function(self,user){
 	// var isubscribed=true;
	// if(user.subscription.planid==undefined){

	// }else{

	// }
	// _checkUserIsSubscribed(user,function(user))
	if(user.isSubscribed==false){
		 self.emit("failedUserSignin",{"error":{"code":"AS001","message":"User is not subscribed to any plan","user":user}}); 
	}else{
		/////////////////////////////////
		_isSubscriptionExpired(self,user);
		/////////////////////////////////
	}
}
var _isSubscriptionExpired=function(self,user){
	// var isubscriptionexpired=true;
	if(user.subscriptionExpired==true){
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
  //var donepayment=true;
  if(user.hasDonePayment==false){
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


User.prototype.updateUser = function(userid) {
	var self=this;
	var userdata=this.user;
	if(userdata==undefined){
		self.emit("failedUserUpdation",{"error":{"code":"AV001","message":"Please provide userdata"}});	
	}else{
			/////////////////////////////////
	_updateUser(self,userid,userdata);
	////////////////////////////////
	}
	// /////////////////////////////////
	// _updateUser(self,userid,userdata);
	// ////////////////////////////////
};

var _updateUser=function(self,userid,userdata){
	userdata.updatedate=new Date();
	logger.emit("log","_updateUser");
	userModel.update({userid:userid},{$set:userdata},function(err,userupdatestatus){
		if(err){
			self.emit("failedUserUpdation",{"error":{"code":"ED001","message":"Error in db to update user data"}});
		}else if(userupdatestatus!=1){

			self.emit("failedUserUpdation",{"error":{"code":"AU005","message":"Provided userid is wrong"}});
		}else{
			/////////////////////////////
			_successfulUserUpdation(self);
			/////////////////////////////
		}
	})
}
var _successfulUserUpdation = function(self) {
		//validate the user data
		logger.emit("log","_successfulUserUpdation");
		logger.emit("log","successfulUserUpdation");
		self.emit("successfulUserUpdation", {"success":{"message":"User Updated Successfully"}});
	}
User.prototype.deleteUser = function(userid) {
	var self=this;
	////////////////////////
	_deleteUser(self,userid);
	///////////////////////
	
};
var _deleteUser=function(self,userid)
{
	// var userdata={removedate:new Date(),status:"deactive"}
	// userdata.removedate=new Date();
	userModel.update({userid:userid},{$set:{removedate:new Date(),status:'deactive'}},function(err,userupdatestatus){
		if(err){
			self.emit("failedUserDeletion",{"error":{"code":"ED001","message":"Error in db to update user data"}});
		}else if(userupdatestatus!=1){
			self.emit("failedUserDeletion",{"error":{"code":"AU005","message":"Provided userid is wrong"}});
		}else{
			/////////////////////////////
			_successfulUserDeletion(self);
			////////////////////////////
		}
	})
}
var _successfulUserDeletion = function(self) {
		//validate the user data
		logger.emit("log","_successfulUserDeletion");
	
		self.emit("successfulUserDeletion", {"success":{"message":"User Deleted Successfully"}});
	}


User.prototype.getUser = function(userid) {
	var self=this;
	_getUser(self,userid);
};
var _getUser=function(self,userid){
	userModel.findOne({userid:userid}).lean().exec(function(err,user){
		if(err){
			self.emit("failedUserGet",{"error":{"code":"ED001","message":"Error in db to find user"}});
		}else if(user){
	         ////////////////////////////////
			_successfulUserGet(self,user);
			//////////////////////////////////
		}else{
		    self.emit("failedUserGet",{"error":{"code":"AU005","message":"Provided userid is wrong"}});
		}
	})
}
var _successfulUserGet=function(self,user){
	logger.emit("log","_successfulUserGet");
	self.emit("successfulUserGet", {"success":{"message":"Getting User details Successfully","user":user}});
}
User.prototype.getAllUsers = function() {
	var self=this;
	//////////////////
	_getAllUsers(self);
	///////////////////
};
var _getAllUsers=function(self){
	userModel.find({}).lean().exec(function(err,user){
		if(err){
			self.emit("failedUserGetAll",{"error":{"code":"ED001","message":"Error in db to find all users"}});
		}else if(user.length==0){
			self.emit("failedUserGetAll",{"error":{"code":"AU003","message":"No user exists"}});
		}else{
			////////////////////////////////
			_successfulUserGetAll(self,user);
			//////////////////////////////////
		}
	})
};

var _successfulUserGetAll=function(self,user){
	logger.emit("log","_successfulUserGetAll");
	self.emit("successfulUserGetAll", {"success":{"message":"Getting User details Successfully","user":user}});
}

User.prototype.sendPasswordSetting = function() {
	var self=this;
	////////////////////////////////////////
	_validateSendPasswordSetting(self);
	/////////////////////////////////////
};

var _validateSendPasswordSetting=function(self){
	logger.emit("log","_validateSendPasswordSetting");
	var user=self.user;
	if(user==undefined){
	    self.emit("failedSendPasswordSetting",{"error":{"code":"AV001","message":"please send user data"}});
	}else if(user.email==undefined){
		   logger.emit("log","_isProdonusRegisteredEmailId");
	 	    self.emit("failedSendPasswordSetting",{"error":{"code":"AV001","message":"please enter emailid"}});
	}else if(!regxemail.test(user.email)){
	//	logger.emit("log","_isProdonusRegisteredEmailId");
 	  self.emit("failedSendPasswordSetting",{"error":{"code":"AV001","message":"please enter valid email"}});
 	}else{
 		logger.emit("log","_isProdonusRegisteredEmailId");
 		////////////////////////////////////////
 		_isProdonusRegisteredEmailId(self,user.email);
 		/////////////////////////////////////////
 	}  		
};
var _isProdonusRegisteredEmailId=function(self,email){
	logger.emit("log","_isProdonusRegisteredEmailId");
	userModel.findOne({email:email},{userid:1,email:1,firstname:1,lastname:1,fullname:1}).lean().exec(function(err,user){
		if(err){
			self.emit("failedSendPasswordSetting",{"error":{"code":"ED001","message":"Error in db to find users"}});
		}else if(user){
			////////////////////////////////////
			_createOTPPasswordSetting(self,user);
			///////////////////////////////////
		}else{
			self.emit("failedSendPasswordSetting",{"error":{"code":"AU004","message":"Please give prodonus registered email id"}});
			
		}
	})
};
var _createOTPPasswordSetting=function(self,user){
	logger.emit("log","_createOTPPasswordSetting");
	var otp = Math.floor(Math.random()*100000000);

	commonapi.getbcrypstring(otp,function(err,hashpassword){
		if(err){
			self.emit("failedSendPasswordSetting",{"error":{"code":"AB001","message":"Error in get bcrypt passsword"}});
		}else{
			userModel.update({userid:user.userid},{$set:{password:hashpassword,isOtpPassword:true}},function(err,status){
				if(err){
					self.emit("failedSendPasswordSetting",{"error":{"code":"ED001","message":"Error in db to reset password users"}});
				}else if(status!=1){
					self.emit("failedSendPasswordSetting",{"error":{"code":"AU005","message":"User does't exists"}});
				}else{
					////////////////////////////////
					_sendPasswordSetting(self,user,otp);
					////////////////////////////////
				}
			})
		}
	})
};

var _sendPasswordSetting=function(self,user,otp){
logger.emit("log","_sendPasswordSetting");
  EmailTemplateModel.findOne({"templatetype":"password"}).lean().exec(function(err,emailtemplate){
  	if(err){
			self.emit("failedSendPasswordSetting",{"error":{"code":"ED001","message":"Error in db to find password emailtemplate"}});
  	}else if(emailtemplate){
  			var description=S(emailtemplate.description);
  			description=description.replaceAll("<password>",otp);
  			description=description.replaceAll("<fullname>",user.fullname);
  			var message = {
                from: "Prodonus  <noreply@prodonus.com>", // sender address
                to: user.email, // list of receivers
                subject:emailtemplate.subject, // Subject line
                html: description.s // html body
              };
        commonapi.sendMail(message,CONFIG.smtp_general, function (result){
          if (result == "failure") {
                self.emit("failedSendPasswordSetting",{"error":{"code":"AT001","message":"Error to send password reset setting"}});
          } else {
          			/////////////////////////////
              _successfulForgotPassword(self);   
               //////////////////////////////
          }
        });
  	}else{
  		self.emit("failedSendPasswordSetting",{"error":{"code":"ED002","message":"Server setup template issue"}});
  	}
  })
};
var _successfulForgotPassword=function(self){
	logger.emit("log","successfulForgotPassword");
	self.emit("successfulForgotPassword", {"success":{"message":"Password Settings Successfully sent"}});
}

User.prototype.reCaptcha = function(reCaptcha,clientip) {
	var self=this;
	////////////////////////////////////////
	_validateReCaptcha(self,reCaptcha,clientip);
	/////////////////////////////////////
};
var _validateReCaptcha=function(self,reCaptcha,clientip){
	if(reCaptcha.challenge==undefined || reCaptcha.response==undefined){
		self.emit("failedRecaptcha",{"error":{"code":"AV001","message":"Please send challenge or response for captcha"}});
	}else if(clientip==undefined){
		self.emit("failedRecaptcha",{"error":{"code":"AV001","message":"Please send clientip through header"}});
	}else{
		////////////////////////////////////////////////
		_requestRecaptchaService(self,reCaptcha,clientip);
		///////////////////////////////////////////////
	}
}
var _requestRecaptchaService=function(self,reCaptcha,clientip){
	logger.emit("log","privatekey="+CONFIG.recaptchaPrivateKey+"recaptchaUrl="+CONFIG.recaptchaUrl+"clientip="+ clientip);
	var reCaptchaData={privatekey:CONFIG.recaptchaPrivateKey,remoteip:clientip,challenge:reCaptcha.challenge,response:reCaptcha.response};
	// logger.emit("log",reCaptchaData);
	request.post(CONFIG.recaptchaUrl,{form:reCaptchaData} ,function (error, response,body) {
  		if(error){
  			self.emit("failedRecaptcha",{"error":{"message":errmessage}});
  		}else if(!response){
  			self.emit("failedRecaptcha",{"error":{"message":"please check your internet connection"}});
  		}else if (response.statusCode != 200) {
  			self.emit("failedRecaptcha",{"error":{"code":"AR001","message":"Google reCaptcha server issue"}});
  		}
  		var responsedata=S(body);
  		if(responsedata.contains("true")){
  			self.emit("successfulRecaptcha",{"success":{"message":"Recaptcha Successfully"}});
  			//successfulRecaptcha
  		}else{
  			var errmessage=responsedata.replaceAll("false","").s;
				self.emit("failedRecaptcha",{"error":{"message":errmessage}});
  		}
  });
};

User.prototype.regenerateVerificationUrl = function(email,host){
	var self=this;
	if(isValidEmail(email).error!=undefined){
	 	self.emit("failedRegenerateVerificationUrl",isValidEmail(email));
	}else{
	////////////////////////////////////////
	_isValidUserToRegenerateToken(self,email,host);
	/////////////////////////////////////
	}
};
var _isValidUserToRegenerateToken=function(self,email,host){
	userModel.findOne({email:email,verified:false},function(err,user){
		if(err){
			self.emit("failedRegenerateVerificationUrl",{"error":{"code":"ED001","message":"Error in db to find user"}});
		}else if(user){
				////////////////////////////////////////
		       _regenerateVerificationToken(self,user,host);
		     	/////////////////////////////////////
		}else{
			self.emit("failedRegenerateVerificationUrl",{"error":{"code":"AU005","message":"User does't exists or It is already verified mail"}});
		}
	})
}
var _regenerateVerificationToken=function(self,user,host){
	var verificationToken = new VerificationTokenModel({_userId: user.userid,tokentype:"user"});
        verificationToken.createVerificationToken(function (err, token) {
         if (err){  
            self.emit("failedRegenerateVerificationUrl",{"error":{"code":"AT001","message":"Error in db to create verificationToken"}});
          }else{
          	
          	logger.emit("log","createdtoken");

          	//////////////////////////////////////
          _sendRegenerateTokenMail(self,token,user,host);
           //////////////////////////////////////
          }
		})
};
var  _sendRegenerateTokenMail=function(self,token,user,host){
	EmailTemplateModel.findOne({"templatetype":"verify"},function(err,emailtemplate){
			
			if(err){
				
				self.emit("failedRegenerateVerificationUrl",{"error":{"code":"ED001","message":"Error in db to find verify emailtemplate"}});
			}else if(emailtemplate){
				console.log("addedUser6");
				var url = "http://"+host+"/api/verify/"+token;
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
	            commonapi.sendMail(message,CONFIG.smtp_general, function (result){
	            	if(result=="failure"){
	            		self.emit("failedRegenerateVerificationUrl",{"error":{"code":"AT001","message":"Error to send verification email"}});
	            	}else{
	            		logger.emit("info","User added successfully");
	            		/////////////////////////////////
	            		_successfulRegenerateToken(self)
	            		////////////////////////////////
	            	}
	            });
	        }else{
	        	self.emit("failedRegenerateVerificationUrl",{"error":{"code":"ED002","message":"Server setup template issue"}});
			}
	    })
};
var _successfulRegenerateToken=function(self){
	//validate the user data
		logger.emit("log","_successfulUserDeletion");
	
		self.emit("successfulregenerateVerificationUrl", {"success":{"message":"Regenarte token send successfully"}});
}

		
User.prototype.resetPassword = function(userid) {
	var self=this;
	var userdata=this.user;


	////////////////////////////////
	_validateResetPassword(self,userid);
	/////////////////////////////
	
};
var _validateResetPassword=function(self,userid){
	var userdata=self.user;
	if(userdata==undefined){
		self.emit("failedUserResetPassword",{"error":{"code":"EV001","message":"Please Provide Userdata"}});
	}else if(userdata.currentpassword==undefined){
		self.emit("failedUserResetPassword",{"error":{"code":"EV001","message":"Please send currentpassword"}});
	}else if(userdata.currentpassword.trim().length<0){
		self.emit("failedUserResetPassword",{"error":{"code":"EV001","message":"please enter currentpassword"}});
	}else if(userdata.newpassword==undefined){
		self.emit("failedUserResetPassword",{"error":{"code":"EV001","message":"Please send newpassword"}});
	}else if(userdata.newpassword.trim().length<0){
		self.emit("failedUserResetPassword",{"error":{"code":"EV001","message":"please enter newpassword"}});
	}else{
		/////////////////////////////
		_resetPassword(self,userid,userdata);
		////////////////////////////
	}

}
var _resetPassword=function(self,userid,userdata){
	var currentpassword=userdata.currentpassword;
	var newpassword=userdata.newpassword;
	logger.emit("log","_resetPassword");
	userModel.findOne({userid:userid},{userid:1,password:1},function(err,user){
		if(err){
			self.emit("failedUserResetPassword",{"error":{"code":"ED001","message":"Error in db to update user data"}});
		}else if(user){
			user.comparePassword(currentpassword, function(err, isMatch){
      			if ( err ){
          			self.emit("failedUserResetPassword",{"error":{"code":"AU006","message":"Error in comparing password"}});
        		 } else if( !isMatch ) {
          			self.emit("failedUserResetPassword",{"error":{"code":"AU002","message":"Your current password is wrong"}});
    			}else{
          			user.password=newpassword;
          			user.isOtpPassword=false;
          			user.save(function(err,user_data){
          				if(err){
          					self.emit("failedUserResetPassword",{"error":{"code":"ED001","message":"Error in db to change the password"}});
          				}else{
          					/////////////////////////////
						   _successfulUserResetPassword(self);
							/////////////////////////////
          				}
          			})
       		   }
      		});
		}else{
			self.emit("failedUserResetPassword",{"error":{"code":"AU005","message":"Provided userid is wrong"}});
		}
	})
}
var _successfulUserResetPassword = function(self) {
		//validate the user data
		logger.emit("log","_successfulUserResetPassword");
		logger.emit("log","_successfulUserResetPassword");
		self.emit("successfulUserResetPassword", {"success":{"message":"User password changed successfully"}});
	}
   
User.prototype.isloggedin = function(user) {
	var self=this;
	_isLoogedIn(self,user);
};
var _isLoogedIn=function(self,user){
	getUserRequiredData(user,function(userdata){
		//////////////////////////
         _successfulIsLoggedIn(self,userdata)
		////////////////////////////
	})
	
}
var _successfulIsLoggedIn=function(self,user){
	logger.emit("log","_successfulIsLoggedIn");
	self.emit("successfulIsLoggedIn", {success:{message:"Getting User details Successfully",user:user}});

} 
User.prototype.makePayment = function(user,paymentdata) {
	var self=this;
	_validatePaymentData(self,user,paymentdata);
};
var _validatePaymentData=function(self,user,paymentdata){
	if(paymentdata==undefined){
		self.emit("failedMakePayment",{"error":{"code":"AV001","message":"Please Provide paymentdata"}});
	}else if(paymentdata.usertype==undefined){
		self.emit("failedMakePayment",{"error":{"code":"EV001","message":"Please Provide usertype"}});
	}else if(paymentdata.planid==undefined){
		self.emit("failedMakePayment",{"error":{"code":"EV001","message":"Please Provide planid"}});
	}else if(paymentdata.discountcode==undefined){ 
		self.emit("failedMakePayment",{"error":{"code":"EV001","message":"Please Provide discount "}});
	}else{
		///////////////////////
		_checkDiscountCodeValid(self,user,paymentdata);
		/////////////////////////
	}
}
var _checkDiscountCodeValid=function(self,user,paymentdata){
	if(paymentdata.discountcode.trim().length==0){
		logger.emit("log","User has no discount code");
		///////////////////////////////////////////////
		_applyPlanToUser(self,user,paymentdata);
		//////////////////////////////////////////////
	}else{
		DiscountModel.findOne({discountcode:paymentdata.discountcode},function(err,discount){
			if(err){
				self.emit("failedMakePayment",{"error":{"code":"ED001","message":"Error in db to find discountcode"}});
			}else if(!discount){
				self.emit("failedMakePayment",{"error":{"code":"AD001","message":"Provided discount code is wrong"}});	
			}else{
				/////////////////////////////////////////////
				_checkPlanIsValid(self,user,paymentdata,discount);
				///////////////////////////////////////////
				
			}
		})
	}
}
var _checkPlanIsValid=function(self,user,paymentdata,discount){
	SubscriptionModel.findOne({planid:paymentdata.planid},function(err,subscription){
		if(err){
			self.emit("failedMakePayment",{"error":{"code":"ED001","message":"Error in db to find subscription plan"}});
		}else if(!subscription){
			self.emit("failedMakePayment",{"error":{"code":"AD001","message":"Provided subscription planid   is wrong"}});	
		}else{
			//////////////////////////////////
			_applyDiscountCodeToPlan(self,user,paymentdata,discount,subscription);
			///////////////////////////////

		}
	})
}
var _applyDiscountCodeToPlan=function(self,user,paymentdata,discount,subscription){
	if(paymentdata.usertype=="individual"){
		///////////////////////////
		_applyIndividualPlanToUser(self,user,paymentdata,discount,subscription);
		///////////////////////////
	}else if(paymentdata.usertype=="company" || paymentdata.usertype=="manufacturer"){
		/////////////////////////////////////////
		_applyOrganizatioPlanToUser(self,user,paymentdata,discount,subscription);
		///////////////////////////////////////
	}else{
		self.emit("failedMakePayment",{"error":{"message":"Provided usertype does'nt exists"}});		
	}

}
var _applyIndividualPlanToUser=function(self,user,paymentdata,discount,subscription){
	if(subscription.plantype!=paymentdata.usertype){
		self.emit("failedMakePayment",{"error":{"message":"Your plantype doesn't match with usertype"}});			
	}else{
		logger.emit("log","discount imapct:"+discount.impact)
		var currentdate=new Date();
		var expirydate=new Date(currentdate.setDate(currentdate.getDate()+discount.impact.timeperiod));
		var subscription_set={planid:subscription.planid,planstartdate:currentdate,planexpirydate:expirydate,discountcode:discount.discountcode};
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
						/////////////////////////////////////
                         _successfullMakePayment(self);
						///////////////////////////
					}
				})
			}
		})
	}

}
var _applyOrganizatioPlanToUser=function(self,user,paymentdata,discount,subscription){
	if(subscription.plantype!=paymentdata.usertype){
		self.emit("failedMakePayment",{"error":{"message":"Your plantype doesn't match with usertype"}});			
	}else{
		if(user.org.isAdmin==false){
			self.emit("failedMakePayment",{"error":{"message":"Only Admin can make payment"}});			
		}else{
			logger.emit("log","discount imapct:"+discount.impact)
		var currentdate=new Date();
		var expirydate=new Date(currentdate.setDate(currentdate.getDate()+discount.impact.timeperiod));
		var subscription_set={planid:subscription.planid,planstartdate:currentdate,planexpirydate:expirydate,discountcode:discount.discountcode};
		var payment_data=new PaymentModel({userid:user.userid,price:0});

		payment_data.save(function(err,payment){
			if(err){
				self.emit("failedMakePayment",{"error":{"message":"Error in db to save new payment"}});				
			}else{
				console.log("payment data"+payment.paymentid);
  				var user_updatedata={subscription:subscription_set,payment:{paymentid:payment.paymentid}};
  			 var 	org_updatedata=user_updatedata;
  				
			    orgModel.update({orgid:user.org.orgid},{$set:org_updatedata},function(err,orgpaymentupdate){
			    	if(err){
			    		self.emit("failedMakePayment",{"error":{"message":"Error in db to update org payment details"+err}});				
			    	}else if(orgpaymentupdate==0){
			    		self.emit("failedMakePayment",{"error":{"code":"AO002","message":"Orgid is worng"}});					
			    	}else{
                //set payment to user organization
				    	userModel.update({"org.orgid":user.org.orgid},{$set:user_updatedata},{multi:true},function(err,userpaymentupdate){
							if(err){
								self.emit("failedMakePayment",{"error":{"message":"Error in db to update user payment details"+err}});				
							}else if(userpaymentupdate==0){
								self.emit("failedMakePayment",{"error":{"message":"Userid is wrong"}});					
							}else{
								/////////////////////////////////////
		            _successfullMakePayment(self);
								///////////////////////////
							}
						})	
					}
				})
			}
		})	
		}
		
	}
}
var _successfullMakePayment=function(self){
	logger.emit("log","_successfullMakePayment");
	self.emit("successfulMakePayment",{"success":{"message":"You have successfully made an payment"}})
}
    
       
              
User.prototype.followunfollowproduct=function(prodle,sessionuserid){
	var self=this;
	_checkprodle(self,prodle,sessionuserid);
	// _followunfollowproduct(self,prodle,sessionuserid);
}
var _checkprodle=function(self,prodle,sessionuserid){
	productModel.findOne({prodle:prodle},function(err,checkprodlestatus){
		if(err){
			logger.emit("log","failed to connect to database");
			self.emit("failedFollowUnFollowProduct",{"error":{"code":"ED001","message":"Error in db to update user data"}});
		}else if(checkprodlestatus){
			_followunfollowproduct(self,prodle,sessionuserid);			
		}else{
			logger.emit("log","Incorrect prodle");
			self.emit("failedFollowUnFollowProduct",{"error":{"message":"Incorrect prodle","prodle":prodle}});
		}
	})
}

var _followunfollowproduct=function(self,prodle,sessionuserid){

	userModel.findOne({userid:sessionuserid,products_followed:prodle},function(err,userdata){
		if(err){
			logger.emit("log","failed to connect to database");
			self.emit("failedFollowUnFollowProduct",{"error":{"code":"ED001","message":"Error in db to update user data"}});
		}else if(!userdata){
			_followproduct(self,prodle,sessionuserid);				
		}else{
			_unfollowproduct(self,prodle,sessionuserid);
		}
	})
}

var _followproduct=function(self,prodle,sessionuserid){
	userModel.update({userid:sessionuserid},{$push:{products_followed:prodle}},function(err,followprodstatus){
			// userModel.push({"products_followed":prodle},function(err,followprodstatus){
		if(err){
			logger.emit("log","failed to connect to database");
			self.emit("failedFollowUnFollowProduct",{"error":{"code":"ED001","message":"Error in db to update user data"}});
		}else if(followprodstatus){
			logger.emit("log","successfulFollowProduct");
			self.emit("successfulFollowUnFollowProduct",{"success":{"message":"Following product"}});
		}
		else{
			logger.emit("log","Failure in following the product");
			self.emit("failedFollowUnFollowProduct",{"error":{"code":"F001","message":"Failed to follow the product"}});
		}
	});
}
var _unfollowproduct=function(self,prodle,sessionuserid){
	userModel.update({userid:sessionuserid},{$pull:{"products_followed":prodle}},function(err,unfollowprodstatus){
		if(err){
			logger.emit("log","failed to connect to database");
			self.emit("failedFollowUnFollowProduct",{"error":{"code":"ED001","message":"Error in db to update user data"}});
		}else if(unfollowprodstatus){
			logger.emit("log","successfully unfollowed");
			self.emit("successfulFollowUnFollowProduct",{"success":{"message":"Unfollowing product"}});
		}else{
			logger.emit("log","Failure in unfollowing the product");
			self.emit("failedFollowUnFollowProduct",{"error":{"code":"AF001","message":"Failed to Unfollow the product"}});
		}
	})
}
              
User.prototype.checkUsernameExists=function(username){
	var self=this;
	/////////////////////////////////////
	_validateCheckUsernameExists(self,username);
	//////////////////////////////////////
	// _followunfollowproduct(self,prodle,sessionuserid);
}
var _validateCheckUsernameExists=function(self,username){
	if(username==undefined){
		self.emit("failedCheckUsernameExists",{"error":{"code":"AV001","message":"please provide username"}});
	}else if(username.trim().length<6 || username.length>15 ){
		self.emit("failedCheckUsernameExists",{"error":{"code":"AV001","message":"username length should be greater than 6 and less than 15"}});
	}else{
		username=username.trim();
		///////////////////////////////////////////////////////
		_checkUsernameExist(self,username)
		////////////////////////////////////////////////////
	}
}
var _checkUsernameExist=function(self,username){
	userModel.findOne({username:username},{username:1},function(err,usernamedata){
		if(err){
		 self.emit("failedCheckUsernameExists",{"error":{"code":"ED001","message":"function:_successfullValidateCheckUsernameExists\n "}});
		}else if(usernamedata){
			self.emit("failedCheckUsernameExists",{"error":{"message":" Username Already exists"}});
		}else{
			self.emit("successfulCheckUsernameExists",{"success":{"message":" Username Available"}});
		}
	})
}
User.prototype.sendUserInvites=function(userinvitedata,sessionuserid){
	var self=this;
	/////////////////////////////
	_validateUserInviteData(self,userinvitedata,sessionuserid);
	/////////////////////////////
}
var _validateUserInviteData=function(self,userinvitedata,sessionuserid){
	if(userinvitedata==undefined){
		self.emit("failedUserInvites",{"error":{"code":"AV001","message":"Please provide userinvite data"}});
	}else if(userinvitedata.length==0){
		self.emit("failedUserInvites",{"error":{"code":"AV001","message":"Please pass at least invite details"}});
	}else{
		////////////////////////////////////
		_sendUserInvitaion(self,userinvitedata,sessionuserid);
		//////////////////////////
	}
}
var _sendUserInvitaion=function(self,userinvitedata,sessionuserid){
	userModel.findOne({userid:sessionuserid},function(err,user){
		if(err){
			self.emit("failedUserInvites",{"error":{"code":"ED001","message":"_sendUserInvitaion DbError"+err}});
		}else if(!user){
			self.emit("failedUserInvites",{"error":{"code":"AU003","message":"Userid is Wrong"}});	
		}else{
			EmailTemplateModel.findOne({templatetype:"userinvite"},function(err,userinvite_emailtemplate){
				if(err){
					self.emit("failedUserInvites",{"error":{"code":"ED001","message":"Email template"+err}});	
				}else if(!userinvite_emailtemplate){
					self.emit("failedUserInvites",{"error":{"message":"Email template"+err}});	
				}else{
					for(var i=0;i<userinvitedata.length;i++)
					{
			  		self.emit("senduserinvite",userinvite_emailtemplate,userinvitedata[i],user);
					}
					///////////////////////////////////////////////////////////////
					_addUserInviteIntoBusinessOpportunity(self,userinvitedata,user);
					////////////////////////////////////////////////////////////

				}
			})
		}
	})
}
var _addUserInviteIntoBusinessOpportunity=function(self,userinvitedata,user){

 var business_opportunity=[];
	for(var i=0;i<userinvitedata.length;i++)
	{
		business_opportunity.push({invitetype:"user",from:user.email,to:userinvitedata[i].email,fromusertype:user.usertype});
	}
 
	 BusinessOpportunityModel.create(business_opportunity,function(err,business_opportunitydata){
	 	if(err){
	 		self.emit("failedUserInvites",{"error":{"code":"ED001","message":"Business Opportunity"+err}});	
	 	}else{
	 		/////////////////////////////////////////////////
	 		_successfullUserInvites(self);
	 		///////////////////////////////////////////////
	 	}
 	})
}
var _successfullUserInvites=function (self) {
	logger.emit("log","_successfullUserInvites");
	self.emit("successfulUserInvites",{"success":{"message":"User Inivite Send Successfully"}});
}

