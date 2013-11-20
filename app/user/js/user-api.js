/*
* Overview: User api
* Dated:
* Author: Sunil More
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* 27-3-2013 | xyx | Add a new property
* 03-10-2013|sunil|add forgot password method
*/

//require schema model
var VerificationTokenModel=require('../../common/js/verification-token-model')
var userModel = require('./user-model');
var EmailTemplateModel=require('../../common/js/email-template-model');

//require cusome api
var commonapi = require('../../common/js/common-api');

//require libraary
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var S=require('string');
var logger=require("../../common/js/logger");
var CONFIG = require('config').Prodonus;
var User=require("./user");
var orgModel=require("../../org/registration/js/org-model");
//default emiltemplate record saved


//NEW
//=====================================================
exports.addUser = function(req,res){
   var  userdata = req.body.user;
   var user = new User(userdata);
    user.on("failedUserRegistration",function(err){
      console.log("failedUserRegistration"+err)
      logger.emit("error", err.error.message);
      res.send(err);
    });

    user.on("successfulUserRegistration",function(result){
      logger.emit("info", result.success.message);
      res.send(result);
    });

  
     user.registerUser();
}



exports.activateAccount = function(req, res) {
  var user = new User();
  var html=S("<html><body><h1><font color=blue><a href='http://"+req.get("host")+"'>Prodonus</a></font></h1><br><message></body></html>");
  user.on("failedUserActivation",function(err){
    console.log("failedUserActivation" + err)
    logger.emit("error", err.error.message);
    html=html.replaceAll("<message>",err.error.message).s;
    res.send(html);
  });

  user.on("successfullUserActivation",function(result){
    logger.emit("info", result.success.message);
    res.send(result);
  });
  user.on("tokenredirect",function(redirecturl){
    
    res.redirect(redirecturl);
  });

  var token = req.params.token;
   user.activateAccount(token);
};
exports.signin = function(req, res) {
  var  userdata = req.body;
  var user = new User(userdata);
  user.on("failedUserSignin",function(err){
    console.log("failedUserRegistration"+err)
    logger.emit("error", err.error.message);
    res.send(err);
  });
  //
  user.on("successfulUserSignin",function(result){
    logger.emit("info", result.success.message);
    res.send(result);
  });

  user.on("passportauthenticate",function(){
    passport.authenticate('local', function(err, userdata, info) {
      if (err) { 
        user.emit("failedUserSignin",{"error":{"code":"AP002","message":"Error in passport to authenticate"}});
      } else if (!userdata) {
        user.emit("failedUserSignin",{"error":{"code":info.code,"message":info.message}});
       }else {//valid user
        req.logIn(userdata,function(err){
          if(err){
            user.emit("failedUserSignin",{"error":{"code":"AP001","message":"Error in creating session"}});
          }else{
            ///////////////////////////
            user.signinSession(userdata);
            ///////////////////////////
          }
        });
      }
    })(req, res);//end of passport authenticate
  });
  //first calling sigin
  user.signin();
 
}
passport.use( new LocalStrategy({ usernameField: 'email', passwordField: 'password'},
  function(email, password, done) {
    console.log("email" + email +" password"+password);
    userModel.findOne({ email: email}, function(err, user) {
      if (err){ 
       return done(err); 
      }
      if (!user) {//to check user is exist or not
        return done(null, false, {code:"AU001", message: 'User does not exists' }); 
      } else if(user.verified==false){
        logger.emit("error","Unverified User",user.userid);
        return done(null,false,{code:"AU003",message:"please verfiy or resend verfication email"});
      }
      user.comparePassword(password, function(err, isMatch){
        if ( err ){
          logger.emit("error","eror in compare password method",user.userid);
            return done(err);
        } else if( isMatch ) {
          logger.emit("info","password match",user.userid);
          return done(null, user);
        }else{
          logger.emit("error","Invalid password",user.userid);
          return done(null, false, {code:"AU002", message: 'Invalid password' });
        }
      });
    });
}));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  userModel.findById(id, function (err, user) {
    done(err, user);
  });
});
exports.updateUser = function(req, res) {
  var userid=req.params.userid;
  var userdata=req.body;
  var user = new User(userdata);
    user.on("failedUserUpdation",function(err){
      console.log("failedUserRegistration"+err)
      logger.emit("error", err.error.message);
      res.send(err);
    });

    user.on("successfulUserUpdation",function(result){
      logger.emit("info", result.success.message);
      res.send(result);
    });
    var userid=req.params.userid;
    var sessionuserid=req.user.userid;
    var  userdata = req.body.user;
     user.updateUser(userid,sessionuserid);
}

exports.deleteUser = function(req, res) {
var userid=req.params.userid;
var sessionuserid=req.user.userid;
var user=new User();
    user.on("failedUserDeletion",function(err){
      logger.emit("error", err.error.message,req.user.userid);
      res.send(err);
    });

    user.on("successfulUserDeletion",function(result){
      logger.emit("info", result.success.message);
      res.send(result);
    });
   
   
     user.deleteUser(userid,sessionuserid);
}

exports.getUser = function(req, res) {

}

exports.getAllUsers = function(req, res) {

}
exports.forgotPassword = function(req, res) {

}

exports.regenerateVerificationToken = function(req, res) {

}


//old data
