/*
* Overview: Product 
* Dated:
* Author: Ramesh Kunhiraman
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* 27-3-2013 | xyx | Add a new property
* 12-11-2013|Sunil|Add a subscription 
*/

var util = require("util");
var events = require("events");
var logger = require("../../common/js/logger");
var productModel = require("./product-model");
var commonapi = require('../../common/js/common-api');
var CONFIG = require('config').Prodonus;



var Product = function(productdata) {
	this.product = productdata;
};

var regxemail = /\S+@\S+\.\S+/; 
Product.prototype = new events.EventEmitter;
module.exports = Product;


//register new Product
Product.prototype.registerProduct = function() {
	var self = this;

	///////////////////////////////////
	_validateRegisterProduct(self,this.product);
	////////////////////////////////////
};


//validate product registration data
var _validateRegisterUser = function(self, productdata) {
	productModel.findOne({email:userdata.email},{email:1},function(err,user){
		if(err){
			self.emit("failedUserRegistration",{"error":{"code":"ED001","message":"Error in db to find user"}});
		}else if(user){
			// console.log("userData777"+userdata);
			self.emit("failedUserRegistration",{"error":{"code":"AU001","message":"Email already exist"}});
		}else{
		// validate the new user data
			

	 	  if( userdata.fullname==undefined){
		  	self.emit("failedUserRegistration",{"error":{"code":"AV001","message":"Please enter fullname"}});
	 	  } else if(isValidEmail(userdata.email).error!=undefined){
	 	    self.emit("failedUserRegistration",isValidEmail(userdata.email));
		  }else if(userdata.password==undefined){
		  	self.emit("failedUserRegistration",{"error":{"code":"AV001","message":"please enter passsword"}});
	 	  } else if(userdata.password.length<5){
	 	  	self.emit("failedUserRegistration",{"error":{"code":"AV001","message":"passsword minimum length should be 6"}});
		  // }else if(passwordformatvalidtion){//to be done later
	 	 //  	self.emit("failedUserRegistration",{"error":{"code":"AV001","message":"passsword maximum length should be 8"}});
	 	  }	else if(userdata.terms==false){
	 	  	self.emit("failedUserRegistration",{"error":{"code":"AV001","message":"please agree the terms and condition"}});
	 	  }else{
	 	    	logger.emit("log","_validated");

	 	    	///////////////////////
	 			  _addUser(self,userdata);
	 			  ///////////////////////
	 	  }
		}
	})
};


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
	if(isValidEmail(userdata.email).error!=undefined){
	 	self.emit("failedUserSignin",isValidEmail(userdata.email));
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
//////////////////////
_isOTPUser(self,user);
////////////////////

};
var _isOTPUser=function(self,user){
	if(user.isOtpPassword==true){
		self.emit("failedUserSignin",{"error":{"code":"AU006","message":"OTP RESET Password","user":user}}); 
	}else{
		/////////////////////////
		_isSubscribed(self,user);
		/////////////////////////
	}
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


User.prototype.updateUser = function(userid) {
	var self=this;
	var userdata=this.user;
	/////////////////////////////////
	_updateUser(self,userid,userdata);
	////////////////////////////////
};

var _updateUser=function(self,userid,userdata){
	
	logger.emit("log","_updateUser");
	userModel.update({userid:userid},{$set:userdata},function(err,userupdatestatus){
		if(err){
			self.emit("failedUserUpdation",{"error":{"code":"ED001","message":"Error in db to update user data"}});
		}else if(userupdatestatus!=1){

			self.emit("failedUserUpdation",{"error":{"code":"AU002","message":"Provided userid is wrong"}});
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
var _deleteUser=function(self,userid){
	userModel.update({userid:userid},{$set:{status:"deactive"}},function(err,userupdatestatus){
		if(err){
			self.emit("failedUserDeletion",{"error":{"code":"ED001","message":"Error in db to update user data"}});
		}else if(userupdatestatus!=1){
			self.emit("failedUserDeletion",{"error":{"code":"AU002","message":"Provided userid is wrong"}});
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
	userModel.findOne({userid:userid},function(err,user){
		if(err){
			self.emit("failedUserGet",{"error":{"code":"ED001","message":"Error in db to find user"}});
		}else if(!user){
			self.emit("failedUserGet",{"error":{"code":"AU002","message":"User does't exists"}});

		}else{
				////////////////////////////////
			_successfulUserGet(self,user);
			//////////////////////////////////

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
	userModel.find({},function(err,user){
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

User.prototype.sendPasswordSetting = function(email) {
	var self=this;
	////////////////////////////////////////
	_validateSendPasswordSetting(self,email);
	/////////////////////////////////////
};

var _validateSendPasswordSetting=function(self,email){
	logger.emit("log","_validateSendPasswordSetting");
	if(email==undefined){
		logger.emit("log","_isProdonusRegisteredEmailId");
	 	    self.emit("failedSendPasswordSetting",{"error":{"code":"AV001","message":"please enter emailid"}});
	}else if(!regxemail.test(email)){
	//	logger.emit("log","_isProdonusRegisteredEmailId");
 	  self.emit("failedSendPasswordSetting",{"error":{"code":"AV001","message":"please enter valid email"}});
 	}else{
 		logger.emit("log","_isProdonusRegisteredEmailId");
 		////////////////////////////////////////
 		_isProdonusRegisteredEmailId(self,email);
 		/////////////////////////////////////////
 	}  		
};
var _isProdonusRegisteredEmailId=function(self,email){
	logger.emit("log","_isProdonusRegisteredEmailId");
	userModel.findOne({email:email},{userid:1,email:1,firstname:1,lastname:1,fullname:1},function(err,user){
		if(err){
			self.emit("failedSendPasswordSetting",{"error":{"code":"ED001","message":"Error in db to find users"}});
		}else if(!user){
			self.emit("failedSendPasswordSetting",{"error":{"code":"AU004","message":"Please give prodonus registered email id"}});
		}else{
			////////////////////////////////////
			_createOTPPasswordSetting(self,user);
			///////////////////////////////////
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
					self.emit("failedSendPasswordSetting",{"error":{"code":"AU002","message":"User does't exists"}});
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
  EmailTemplateModel.findOne({"templatetype":"password"},function(err,emailtemplate){
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
        commonapi.sendMail(message, function (result){
          if (result == "failure") {
                self.emit("failedSendPasswordSetting",{"error":{"code":"AU005","message":"Error to send password reset setting"}});
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
	// console.log(reCaptchaData);
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

User.prototype.regenerateVerificationUrl = function(email) {
	var self=this;
	if(isValidEmail(email).error!=undefined){
	 	self.emit("failedRegenerateVerificationUrl",isValidEmail(email));
	}else{
	////////////////////////////////////////
	_isValidUserToRegenerateToken(self,email);
	/////////////////////////////////////
	}
};
var _isValidUserToRegenerateToken=function(self,email){
	userModel.findOne({email:email},function(err,user){
		if(err){
			self.emit("failedRegenerateVerificationUrl",{"error":{"code":"ED001","message":"Error in db to find user"}});
		}else if(!user){
			self.emit("failedRegenerateVerificationUrl",{"error":{"code":"AU002","message":"User does't exists"}});
		}else{
			////////////////////////////////////////
		_regenerateVerificationToken(self,user);
			/////////////////////////////////////
		}
	})
}
var _regenerateVerificationToken=function(self,user){
	var verificationToken = new VerificationTokenModel({_userId: user.userid,tokentype:"user"});
        verificationToken.createVerificationToken(function (err, token) {
        	console.log("addedUser1");
          if (err){  
            self.emit("failedRegenerateVerificationUrl",{"error":{"code":"AT001","message":"Error in db to create verificationToken"}});
          }else{
          	console.log("addedUser2");
          	logger.emit("log","createdtoken");

          	//////////////////////////////////////
          _sendRegenerateTokenMail(self,token,user);
           //////////////////////////////////////
          }
		})
};
var  _sendRegenerateTokenMail=function(self,token,user){
	EmailTemplateModel.findOne({"templatetype":"verify"},function(err,emailtemplate){
			console.log("addedUser4");
			if(err){
				console.log("addedUser5");
				self.emit("failedRegenerateVerificationUrl",{"error":{"code":"ED001","message":"Error in db to find verify emailtemplate"}});
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