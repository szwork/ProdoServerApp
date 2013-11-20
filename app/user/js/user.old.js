var util = require("util");
var events = require("events");
var logger=require("../../../common/js/logger");
var userModel=require("./user-model");
var VerificationTokenModel=require('../../../common/js/verification-token-model')
var EmailTemplateModel=require('../../../common/js/email-template-model');
var S=require('string');
var commonapi = require('../../../common/js/common-api');
var CONFIG = require('config').Prodonus;

var User = function() {
	var self=this;
	events.EventEmitter.call(this);
	this.registerUser = function(userData) {
	 var newuser = userData;
	 this.emit("newUserRegistration", newuser);
	};
	
	var _validate = function(user) {
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
				var regxemail = /\S+@\S+\.\S+/;

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
			 	  }	else{
			 	    	logger.emit("log","_validated");
			 			self.emit("validated", user);
			 	  }
			 }
		})
  };

  var _addUser = function(userdata) {
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
				self.emit("addedUser", user);		        
	      	}
	    })
	};

	var _createVerificationToken = function(user){
		var verificationToken = new VerificationTokenModel({_userId: user.userid,tokentype:"user"});
        verificationToken.createVerificationToken(function (err, token) {
        	console.log("addedUser1");
          if (err){  
            self.emit("failedUserRegistration",{"error":{"code":"AT001","message":"Error in db to create verificationToken"}});
          }else{
          	console.log("addedUser2");
          	logger.emit("log","createdtoken");
          	self.emit("tokenCreated", token, user);
          }
		})
	};
	

	var _sendEmail = function(token, user) {
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
	            		self.emit("emailSent", user);
	            	}
	            });
	        }else{
	        	self.emit("failedUserRegistration",{"error":{"code":"ED002","message":"Server setup template issue"}});
			}
	    })
	}

	var _successfulUserRegistration = function(user) {
		//validate the user data
		logger.emit("info","successfuluserRegistration");
		self.emit("successfulUserRegistration", {"success":{"message":"User Added Successfully"}});
	}


	//workflow
	self.on("newUserRegistration", _validate);
	self.on("validated", _addUser);
	self.on("addedUser", _createVerificationToken);
	self.on("tokenCreated", _sendEmail);
	self.on("emailSent",_successfulUserRegistration);
};

util.inherits(User, events.EventEmitter);
module.exports = new User();

//Activate User
User.prototype.activateAccount = function (token) {
	var self = this;
	console.log("calling to activate User");
	// self.emit("failedUserActivation",{"error":{"code":"ED001","message":"Error in Db to find verification token"}});
	// _verifyToken(self, token);
	self.emit("activateUser", token);

	//workflow
	self.on("activateUser", _verifyToken);
	self.on("verified", _sendWelcomeEmail);
	self.on("welcomeEmailSent", _successfulUserActivation);
};

var _verifyToken = function(token) {
	console.log("calling to verify token");
	// self.emit("failedUserActivation",{"error":{"code":"ED001","message":"Error in Db to find verification token"}});
  // VerificationTokenModel.findAndModify({token: token,status:"active",tokentype:"user"},[],
  //               {$set: {status:"deactive"}},{new:false} ,function (err, userVerificationToken){
  //   if (err){

  //   	self.emit("failedUserActivation",{"error":{"code":"ED001","message":"Error in Db to find verification token"}});
  //   } else if (userVerificationToken){
  //      userModel.findAndModify({ userid: userverificationtoken._userId},[],
  //               {$set: {verified:true}},{new:false}, function(err,user){
  //         if(err){
  //   				self.emit("failedUserActivation",{"error":{"code":"ED001","message":"Error in Db to find verification token"}});
  //         }else if(user){
  //         	self.emit("verified",user.email,self)	
  //       	}else{

  //       	}
  //       })
  //   }else{

  //   }
  // })
};
 
 var _sendWelcomeEmail = function (email,self) {
 	console.log("Welcome email Sent")
		self.emit("welcomeEmailSent",self);
 };

	var _successfulUserActivation = function(self) {
		//validate the user data
		logger.emit("info","successfulUserActivation");
		self.emit("_successfulUserActivation", {"success":{"message":"User Activated Successfull"}});
	}
