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
var app=require("../../../prodonus-app");
//require libraary
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var S=require('string');
var logger=require("../../common/js/logger");
var CONFIG = require('config').Prodonus;
var User=require("./user");
var orgModel=require("../../org/js/org-model");
//default emiltemplate record saved


//NEW
//=====================================================
var isAuthorizedUser=function(userid,sessionuserid){
  var isAdmin=true;//to be done later user is admin
  
  if( userid==sessionuserid || isAdmin){
    return true;
  }else{
    return false;
  }
}
exports.addUser = function(req,res){
   var  userdata = req.body.user;
   var user = new User(userdata);
   user.removeAllListeners("failedUserRegistration");
    user.on("failedUserRegistration",function(err){
      console.log("failedUserRegistration"+err)
      logger.emit("error", err.error.message);
      // //user.removeAllListeners();
      res.send(err);
    });
 user.removeAllListeners("successfulUserRegistration");
    user.on("successfulUserRegistration",function(result){
      logger.emit("info", result.success.message);
      // //user.removeAllListeners();
      res.send(result);
    });
user.registerUser(req.get("host"));
}



exports.activateAccount = function(req, res) {
  logger.emit("log","calling to activate Account");
  var user = new User();
  var html=S("<html><body><h1><font color=blue><a href='http://"+req.get("host")+"'>Prodonus</a></font></h1><br><message></body></html>");
   user.removeAllListeners("failedUserActivation");
  user.on("failedUserActivation",function(err){
    console.log("failedUserActivation" + err)
    logger.emit("error", err.error.message);
    html=html.replaceAll("<message>",err.error.message).s;
   // user.removeListener('failedUserActivation', function (stream) {
   //   logger.emit("log","failedUserActivation event removed");
   // });
   // //user.removeAllListeners();
    res.send(html);
  });
 user.removeAllListeners("successfullUserActivation");
  user.on("successfullUserActivation",function(result){
    logger.emit("info", result.success.message);
   // this.removeListener('successfullUserActivation', function (stream) {
   //   logger.emit("log","successfullUserActivation event removed");
   // });
  // //user.removeAllListeners();
    res.send(result);
  });
 user.removeAllListeners("tokenredirect");
  user.on("tokenredirect",function(redirecturl){
    logger.emit("log","calling to tokenredirect"+redirecturl);
 
  // commonapi.removeListner(user,function(result){
  //     logger.log("log","All user listner removed");
  //   })
  //commonapi.removeListner(user);
    var redirect_data="<html><body><script>";
     redirect_data+="setTimeout(function(){ window.location.assign('http://"+req.get("host")+"/"+redirecturl+"')},3000);";
     redirect_data+="</script>Please wsait page redirect to Prodonus </body></html>"
   //  res.writeHead(200, {'Content-Length': redirect_data.length,'Content-Type': 'text/html' });
    // //user.removeAllListeners();

    res.send(redirect_data);

   // user.removeListner("tokenredirect",function(stream){
   //   console.log("lsitner removed");
   // })

  
  });

  var token = req.params.token;
   user.activateAccount(token);
};
exports.signin = function(req, res) {
   if (req.isAuthenticated()){
     // res.send({status:true,sessionid:req.sessionID,userid:req.user.userid});
     req.logout();
    }
   
  logger.emit("log","///////calling to signin//////////");
  var  userdata = req.body;
  //req.body=req.body;
  logger.emit("log","req body"+userdata);
  var user = new User(userdata);
  //console.log("myvar"+myvar);
  user.removeAllListeners("failedUserSignin");
  user.on("failedUserSignin",function(err){
    logger.emit("log","///////End of signin//////////");
  
    if(err.error.user!=undefined){
      logger.emit("log","login success"+err.error.message);
      err.error.user.sessionid=req.sessionID;
    }else{
      logger.emit("log","failed signin"+err.error.message);
    }
    logger.emit("error", err.error.message,req.body.email);
    
    // //user.removeAllListeners("failedUserSignin",function(stream){
    //   logger.emit("log"," failedUserSignin emitter removed");
    // });
    res.send(err);
  });
  //
  user.removeAllListeners("successfulUserSignin");
  user.on("successfulUserSignin",function(result)
  {
    logger.emit("log","Succesfull Signin")
    logger.emit("info", result.success.message);
    //user.removeAllListeners();
    // result=JSON.parse(result);
    result.success.user.sessionid=req.sessionID;

    // //user.removeAllListeners("successfulUserSigninsuccessfulUserSignin",function(stream){
    //   logger.emit("log"," successfulUserSignin emitter removed");
    // });
    res.send(result);
  });
   user.removeAllListeners("passportauthenticate");
  user.on("passportauthenticate",function(userdata){
    var passportrequest={};
    passportrequest.body=userdata;
    passport.authenticate('local', function(err, userdata, info) {
      if (err) { 

        user.emit("failedUserSignin",{"error":{"code":"AP002","message":"Error in passport to authenticate"}});
      } else if (info) {
        user.emit("failedUserSignin",{"error":{"code":info.code,"message":info.message}});
       }else {//valid user
        // var user_sessiondata={_id:userdata._id,userid:userdata.userid,isAdmin:userdata.isAdmin};

        //  if(userdata.orgid!=undefined){
        //      user_sessiondata.orgid=userdata.orgid;
        //  }
        console.log("userdata"+userdata);
        req.logIn(userdata,function(err){
          if(err){
            // req.sesion.userid=req.user.userid;
            logger.emit("log","passport sesion problem"+err);
            user.emit("failedUserSignin",{"error":{"code":"AP001","message":"Error in creating session"}});
          }else{
           // userid=userdata.userid;
            ///////////////////////////
            user.signinSession(userdata);
            ///////////////////////////
          }
        });
      }
    })(passportrequest,res);//end of passport authenticate

  });
  //first calling sigin
  user.signin();
 
}
passport.use( new LocalStrategy({ usernameField: 'email', passwordField: 'password'},
  function(email, password, done) {
    userModel.findOne({ email: email,status:"active"}, function(err, user) {
      if (err){ 
       return done(err); 
      }
      if (!user) {//to check user is exist or not
        return done(null, false, {code:"AU001", message: 'User does not exists' }); 
      } else if(user.verified==false){
        return done(null,false,{code:"AU003",message:"please verfiy or resend verfication email"});
      }else{
      user.comparePassword(password, function(err, isMatch){
        if ( err ){
          return done(err);
        } else if( isMatch ) {
          
          return done(null, user);
        }else{
          logger.emit("error","Invalid password",user.userid);
          return done(null, false, {code:"AU002", message: 'Invalid password' });
        }
      });
    }
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
//update the user details
exports.updateUser = function(req, res) {
  var userid=req.params.userid;
  var userdata=req.body.user;

  var user = new User(userdata);
  var sessionuserid=req.user.userid;
   user.removeAllListeners("failedUserUpdation");
    user.on("failedUserUpdation",function(err){
      logger.emit("log","failedUserRegistration"+JSON.stringify(err));
      logger.emit("error", err.error.message);
      // //user.removeAllListeners();
      res.send(err);
    });
    user.removeAllListeners("successfulUserUpdation");
    user.on("successfulUserUpdation",function(result){
      logger.emit("info", result.success.message);
      // //user.removeAllListeners();
      res.send(result);
    });
    
    
    
    if(isAuthorizedUser(userid,sessionuserid)){
      user.updateUser(userid);
    }else{
     user.emit("failedUserUpdation",{"error":{"code":"EA001","message":"You have not authorize to done this action"}})
    }
    
}
//delete user set status-deactive
exports.deleteUser = function(req, res) {
  var userid=req.params.userid;
  var sessionuserid=req.user.userid;
  var user=new User();
  user.removeAllListeners("failedUserDeletion");
  user.on("failedUserDeletion",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    // //user.removeAllListeners();
    res.send(err);
  });
  user.removeAllListeners("successfulUserDeletion");
  user.on("successfulUserDeletion",function(result){
    logger.emit("info", result.success.message);
    // //user.removeAllListeners();
    res.send(result);
  });

  if(isAuthorizedUser(userid,sessionuserid)){
     user.deleteUser(userid);
  }else{
    user.emit("failedUserDeletion",{"error":{"code":"EA001","message":"You have not authorize to done this action"}})
}
}
//get user details
exports.getUser = function(req, res) {
  var userid=req.params.userid;
  var sessionuserid=req.user.userid;
  var user=new User();
  user.removeAllListeners("failedUserGet");
  user.on("failedUserGet",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    //user.removeAllListeners();
    res.send(err);
  });
  user.removeAllListeners("successfulUserGet");
  user.on("successfulUserGet",function(result){
    logger.emit("info", result.success.message,req.user.userid);
    //user.removeAllListeners();
    res.send(result);
  });
  user.getUser(userid);

};

//get all user details
exports.getAllUser = function(req, res) {
  
  var sessionuserid=req.user.userid;
  var user=new User();
  user.removeAllListeners("failedUserGetAll");
  user.on("failedUserGetAll",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    //user.removeAllListeners();
    res.send(err);
  });
  user.removeAllListeners("successfulUserGetAll");
  user.on("successfulUserGetAll",function(result){
    logger.emit("info", result.success.message,req.user.userid);
    //user.removeAllListeners();
    res.send(result);
  });
  ///////////////////
  user.getAllUsers();
  /////////////////////
}
exports.forgotPassword = function(req, res) {
  var userdata=req.body.user
  var user=new User(userdata);
  user.removeAllListeners("failedSendPasswordSetting");
  user.on("failedSendPasswordSetting",function(err){
    logger.emit("error", err.error.message);
      //user.removeAllListeners();
    res.send(err);
  });
  user.removeAllListeners("successfulForgotPassword");
  user.on("successfulForgotPassword",function(result){
    logger.emit("info", result.success.message);
    //user.removeAllListeners();
    res.send(result);
  });
  user.sendPasswordSetting();

}

exports.recaptcha = function(req, res) {
  var user=new User();
  var recaptcha=req.body.recaptcha;
  var clientip = req.header('x-forwarded-for') || req.connection.remoteAddress;
  user.removeAllListeners("failedRecaptcha");
  user.on("failedRecaptcha",function(err){
    logger.emit("error", err.error.message);
    //user.removeAllListeners();
    res.send(err);
  });
  user.removeAllListeners("successfulRecaptcha");
  user.on("successfulRecaptcha",function(result){
    logger.emit("info", result.success.message);
    //user.removeAllListeners();
    res.send(result);
  });
  user.reCaptcha(recaptcha,clientip);

}

exports.regenerateVerificationUrl = function(req, res) {
  var user=new User();
  var email=req.body.email;
   user.removeAllListeners("failedRegenerateVerificationUrl");
  user.on("failedRegenerateVerificationUrl",function(err){
      logger.emit("error", err.error.message);
      //user.removeAllListeners();
      res.send(err);
    });
  user.removeAllListeners("successfulregenerateVerificationUrl");
  user.on("successfulregenerateVerificationUrl",function(result){
      logger.emit("info", result.success.message);
      //user.removeAllListeners();
      res.send(result);
    });

  user.regenerateVerificationUrl(email,req.get("host"));
}

exports.resetPassword=function(req,res){

  var userdata=req.body.user;
  var user=new User(userdata);
  var userid=req.params.userid;
  var sessionuserid=req.user.userid;
   user.removeAllListeners("failedUserResetPassword");
  user.on("failedUserResetPassword",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    //user.removeAllListeners();
    res.send(err);
  });
  user.removeAllListeners("successfulUserResetPassword");
  user.on("successfulUserResetPassword",function(result){
    logger.emit("info", result.success.message,req.user.userid);
    //user.removeAllListeners();
    res.send(result);
  });
  if(isAuthorizedUser(userid,sessionuserid)){
    user.resetPassword(userid);
  }else{
   user.emit("failedResetPassword",{"error":{"code":"EA001","message":"You have not authorize to done this action"}})
  }
}
exports.signOutSessions=function(req,res){
    req.logout();
    //req.session.destroy();
    res.send({"success":{"message":"You have successfully signed out"}});
}
//old data
exports.isLoggedIn=function(req,res){

    var user=new User();
    user.removeAllListeners("failedIsLoggedIn");
    user.on("failedIsLoggedIn",function(err){
      
      // //user.removeAllListeners("failedIsLoggedIn",function(stream){
      //   logger.emit("log","failedIsLoggedIn event removed");
      // });
      res.send(err);
    });
    user.removeAllListeners("successfulIsLoggedIn");
    user.on("successfulIsLoggedIn",function(result){
      logger.emit("info", result.success.message,result.success.user.userid);
      //user.removeAllListeners();
      result.success.user.sessionid=req.sessionID;
      res.send(result);
    });
    if(req.isAuthenticated()){
      user.isloggedin(req.user);
    }else{
       user.emit("failedIsLoggedIn",{"error":{"code":"AL001","message":"User Session expired"}});
    }
}
exports.makePayment=function(req,res){
    var user=new User();
    var sessionuserid=req.user.userid;
    var paymentdata=req.body.payment;
    logger.emit("log","req payment data"+JSON.stringify(req.body));
    user.removeAllListeners("failedMakePayment");
    user.on("failedMakePayment",function(err){
      
      // //user.removeAllListeners("failedIsLoggedIn",function(stream){
      //   logger.emit("log","failedIsLoggedIn event removed");
      // });
      res.send(err);
    });
    user.removeAllListeners("successfulMakePayment");
    user.on("successfulMakePayment",function(result){
      // logger.emit("info", );
      //user.removeAllListeners();
      // result.success.user.sessionid=req.sessionID;
      res.send(result);
    });
    user.makePayment(req.user,paymentdata);   
}


exports.followunfollowproduct=function(req,res){
  // var userdata=req.body.user;
  var user=new User();

  var sessionuserid=req.user.userid;
  var prodle=req.params.prodle;
  // var orgid=req.params.orgid;
  logger.emit("log","prodle"+prodle+"\no\nsessionid:"+sessionuserid);
  // var product= new Product();
  user.removeAllListeners("failedFollowUnFollowProduct");
  user.on("failedFollowUnFollowProduct",function(err){
    logger.emit("error", err.error.message,req.user.email);
    res.send(err);
  });
  user.removeAllListeners("successfulFollowUnFollowProduct");
  user.on("successfulFollowUnFollowProduct",function(result){
    logger.emit("info", result.success.message,req.user.email);
    // callback(null,result);
    res.send(result);
  });
    
 user.followunfollowproduct(prodle,sessionuserid);

}
exports.checkUsernameExists=function(req,res){
  // var userdata=req.body.user;
  var user=new User();

 
  var username=req.params.username;
  // var orgid=req.params.orgid;
  
  // var product= new Product();
  user.removeAllListeners("failedCheckUsernameExists");
  user.on("failedCheckUsernameExists",function(err){
    logger.emit("error", err.error.message);
    res.send(err);
  });
  user.removeAllListeners("successfulCheckUsernameExists");
  user.on("successfulCheckUsernameExists",function(result){
    logger.emit("info", result.success.message);
    // callback(null,result);
    res.send(result);
  });
  user.checkUsernameExists(username);

}
exports.userInvites=function(req,res){
  // var userdata=req.body.user;
  var user=new User();
  var sessionuserid=req.user.userid;
  var userinvitedata=req.body.userinvites;
  user.removeAllListeners("failedUserInvites");
  user.on("failedUserInvites",function(err){
    logger.emit("error", err.error.message);
    res.send(err);
  });
  user.removeAllListeners("successfulUserInvites");
  user.on("successfulUserInvites",function(result){
    logger.emit("info", result.success.message);
    // callback(null,result);
    res.send(result);
  });
  user.removeAllListeners("senduserinvite");
  user.on("senduserinvite",function(userinvite_template,inivtedata,user){
    var subject=S(userinvite_template.subject);
    var template=S(userinvite_template.description);
    template=template.replaceAll("<email>",user.email);
    template=template.replaceAll("<username>",user.username);
    var message = {
        from: "Prodonus  <noreply@prodonus.com>", // sender address
        to: inivtedata.email, // list of receivers
        subject:subject.s, // Subject line
        html: template.s // html body
      };
    commonapi.sendMail(message,CONFIG.smtp_general, function (result){
      if(result=="failure"){
        logger.emit("error","User inivte not sent to "+message.to+" by"+user.email);
      }else{
        logger.emit("log","User Invite Sent Successfully to"+message.to+" by"+user.email);
      }
    });
  });
  user.sendUserInvites(userinvitedata,sessionuserid);
}
//get profile details
exports.getProfileInfo = function(req, res) {
  var userid = req.params.userid;
  // console.log("getProfileInfo..");
  
  var user = new User();
  user.removeAllListeners("failedUserGetUserProfile");
  user.on("failedUserGetUserProfile",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    //user.removeAllListeners();
    res.send(err);
  });
  user.removeAllListeners("successfulUserProfile");
  user.on("successfulUserProfile",function(result){
    logger.emit("info", result.success.message,req.user.userid);
    //user.removeAllListeners();
    res.send(result);
  });
  user.getProfileInfo(userid);
};