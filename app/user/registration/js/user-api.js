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
var VerificationTokenModel=require('../../../common/js/verification-token-model')
var userModel = require('./user-model');
var EmailTemplateModel=require('../../../common/js/email-template-model');

//require cusome api
var commonapi = require('../../../common/js/common-api');

//require libraary
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var S=require('string');
var logger=require("../../../common/js/logger");
//default emiltemplate record saved

//Create login session
exports.loginSession = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { 
      logger.emit("error","Error in passport authenticate",user);
      return next(err); 
    } 
    if (!user) {
     // req.session.messages =  [info.message];
     return res.send({"error":{"code":info.code,"message":info.message}});
    }else {//valid user
      var userdata={id:user.id,_id:user._id,userid:user.userid,email:user.email};
      req.logIn(user,function(err){
        if(err){
          logger.emit("error","Error in creating session",user.userid);
          res.send({"error":{"message":"Error in creating session"}})
        }
        //to check user has subscribed or not
        isSubscribed(user,function(status){
          if(status==false){//if user not subscribed to any plan
            logger.emit("error","User is not subscribed to any plan",user.userid);
            res.send({"error":{"code":"AS001","message":"User is not subscribed to any plan","user":user}})
          }else{
            isSubscriptionExpired(user,function(status){
              if(status==true){//subscription is expired
                    logger.emit("error","User subscribtion has expired",user.userid);
                    res.send({"error":{"code":"AS002","message":"User subscribtion has expired","user":user}})
              }else{
                //to check he has done payment or not
                hasDonePayment(user,function(status){
                  if(status==false){//he has not make payment
                    logger.emit("error","User has not make payment",user.userid);
                    res.send({"error":{"code":"AP001","message":"User has not make payment","user":user}})
                  }else{
                    logger.emit("info","Login Successful",user.userid);
                    res.send({"success":{"message":"Login Successful","user":user}})
                  }
                })//end of hasDonePayment
              }
            })//end of isSubscriptionExpired
          }
        })//end of isSubscribed
      })//end of req.logIn
    }
  })(req, res, next);//end of passport authenticate
};
//method to use user has subscribed to any plan or not
isSubscribed=function(user,callback){
 var isubscribed=true;
 callback(isubscribed);
}
isSubscriptionExpired=function(user,callback){
  var isubscribtionexpired=false;
 callback(isubscribtionexpired);
}
hasDonePayment=function(user,callback){
  var donepayment=false;
  callback(donepayment);
}
//passport method
passport.use( new LocalStrategy({ usernameField: 'email', passwordField: 'password'},
  function(email, password, done) {
    console.log("email" + email +" password"+password);
    userModel.findOne({ email: email}, function(err, user) {
      if (err){ 
        logger.emit("error","dberr-Error in db to find user");
        return done(err); 
      }
      if (!user) {//to check user is exist or not
        
        logger.emit("error","Unknown user",email);
        return done(null, false, {code:"AU001", message: 'Unknown user ' + email }); 
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
//end of passport method
/*
emailtemplate 
*/
exports.verifyUser = function (req, res, next) {
  var token = req.params.token;
  verify(token, function (dberr,err,user){
    if (dberr){ 
      logger.error("error in verify token "+err);
      //return res.redirect("verification-failure");
      res.send({"error":"error in userverification token model"});
      /*here we call req.logIn passport for under session 
        res.send("/");
        */
    } 
    if(err){
      logger.error("token is expired or invalid token");
      //return res.redirect("verification-failure");
     // res.send({"exception":"token is expired or invalid token"});
     res.redirect("#/regeneratetoken");
      
    } else {
        //var url = "http://"+ host+"/verify/"+token;
          EmailTemplateModel.find({"templatetype":"welcome"},function(err,emailtemplate){
              console.log("emailtemplate"+emailtemplate);
              var html=emailtemplate[0].description;
              html=S(html);
              html=html.replaceAll("<fullname>",user.fullname);
             // html=html.replaceAll("<url>",url);
              var message = {
                from: "Prodonus  <noreply@prodonus.com>", // sender address
                to: user.email, // list of receivers
                subject:emailtemplate[0].subject, // Subject line
                html: html+"" // html body
              };
              console.log("email"+user.email)
             // console.log("message data"+message+" token data"+token);
             // console.log("requestd host"+ host);
              //calling to sendmail method
              commonapi.sendMail(message, function (result){
                if (result == "failure") {
                 logger.error("Error in sending Welcome mail");
                 res.send({"success":{"message":"Verified but not send welcome mail"}});
                } else {
                   logger.info("Verified Successfully");
                   res.redirect("#/signin");
                }
              });
          })
      }
  });
};
/*
This function call from verfiyuser
it pass token as parameter and get user as callback
*/ 
verify = function(token, done) {
  VerificationTokenModel.findOne({token: token,status:"active",tokentype:"user"}, function (err, userverificationtoken){
    if (err){
     return done(err);
     console.log("error in verification token");
    }
    console.log("verification token data"+userverificationtoken);
    if(userverificationtoken){  
       userModel.findAndModify(
                { userid: userverificationtoken._userId},
                [],
                {$set: {verified:true}},{new:false},
            function(err,user){
        
        if (err) {
          return done(err);
        }else if(user){
       
        userverificationtoken["status"]="deactive";
        userverificationtoken.save(function(err,user){
          console.log("userverificationtoken token set deactive");
        });
       // done(user);

        done(null,null,user);
        }else{
          logger.error("token is expird or invalid token");   
   // res.send({"error":"token is expired or invalid token"});
          done(null,"error");
        }
       // done(user);
      });
    } else{
      logger.error("token is expird or invalid token");
     // res.send({"error":"token is expired or invalid token"});
      done(null,"error");
    } 
  });
};
//add an individual user

exports.forgotpassword=function(req,res){
  var email=req.body.email;
  userModel.findOne({email:email},function(err,user){
    if(err){
      logger.error(err);
    }
    if(user){
      //send forget password token to mail
      //User.find({username:})
        var verificationToken = new VerificationTokenModel({_userId: user.userid,tokentype:"password"});
        verificationToken.createVerificationToken(function (err, token) {
            if (err) return logger.error("Couldn't create verification token for forget password", err);
            var url="http://"+ req.get('host')+"/forgotpassword/"+token;
            //var url = "http://"+ host+"/verify/"+token;
          EmailTemplateModel.find({"templatetype":"password"},function(err,emailtemplate){
              console.log("emailtemplate"+emailtemplate);
              var html=emailtemplate[0].description;
              html=S(html);
             // html=html.replaceAll("<email>",user.email);
              html=html.replaceAll("<url>",url);
              var message = {
                from: "Prodonus  <noreply@prodonus.com>", // sender address
                to: user.email, // list of receivers
                subject:emailtemplate[0].subject, // Subject line
                html: html+"" // html body
              };
             // console.log("email"+user.email)
              console.log("message data"+message+" token data"+token);
              //console.log("requestd host"+ host);
              //calling to sendmail method
              commonapi.sendMail(message, function (result){
                if (result == "failure") {
                 // not much point in attempting to send again, so we give up
                 // will need to give the user a mechanism to resend verification
                 // callback(result);
                 logger.error("Problem in sending password setting");
                 res.send({"message":"forget password","info":"Problem in sending password setting"});
                } else {
                  logger.info("password settings sent to your mail");
                  res.send({"message":"forget password","info":"password settings sent to your mail"})
                  //callback(result);
                }
              });
          })
        });
    } else{
        logger.error("email is not registered with prodonus ");
        res.send("email is not registered with prodonus");
    }
  })
};
exports.resetpassword=function(req,res){
  var newpassword=req.body.newpassword;
  console.log("requested user"+req.user);
  console.log("email"+req.user.email);
  //calling to getbrcyrpt string
  commonapi.getbcrypstring(newpassword,function(hash){
    console.log("hash data"+hash);
          userModel.update({email:req.user.email},{$set:{password:hash}},function(err,status){

            if(err){
              logger.error("error in reseting password "+err);
              res.send("error in reseting password");
            }
            if(status==1){
              logger.info("password successfully updated")
              res.send("password successfully updated");
            }
          })
  })

};
/*
forgepassswordurlaction
this function call when user click forgot password link from their respective email account
-it will check token if it is valid then
it will show resetpassword page 
*/
exports.forgotpasswordurlaction=function (req, res) {
    var token = req.params.token;
    /*
      err -for db error
      err1-for geting null or undefined value

    */
    verifyPasswordToken(token, function(dberr,err,user){
        if (dberr) {
          logger.error(dberr);
          res.send({"dberror":"erro in forgetpasswordtoken collection"});
        }
        if(err){
          logger.error("tokne is expired or invalid token");
          res.send({"exception":"token is expired or invalid token"});
        } else{
              req.logIn(user, function(err){
                 if (err){ 
                    res.send({"error":"error in creating session for user"});
                    logger.error(err+"errro in creating session for particular userid");
                  } else{
                    logger.info("create session and send it to resetpassword page");
                    res.send({"success":"create session and send it to resetpassword page"});
                  }
                
                });
              }
      });
};
verifyPasswordToken = function(token, done) {
    VerificationTokenModel.findOne({token: token,status:"active",tokentype:"password"}, function (err, forgetpasswordtoken){
        if ( err ){ 
          logger.error(err);
          return done(err);
        }
        if(forgetpasswordtoken!=null){
          userModel.findOne({userid: forgetpasswordtoken._userId}, function (err, user) {
              if (err) {
                logger.error(err);
                return done(err);
              }
              console.log("user data"+user);
              forgetpasswordtoken["status"] = "deactive";
              forgetpasswordtoken.save(function(err,docs){
                if(err){ 
                    logger.error(err);
                    done(err);
                }
                if(docs){
                    console.log("forget passwordtoken model  change status");
                    done(null,null,user);
                }
              });
                 
          })
        } else{
          done(null,"err1");
        }
    })
}
exports.addInviteUser=function(user,host,callback){
  console.log("user email"+user["email"]);
  userModel.find({email:user["email"]},function(err,userdata){
    if(err){
      logger.error("error in checking in databae email alerady exist or not for invites"+err);
    }
    console.log("userdata.length"+userdata.length);
    if(userdata.length!=0){
       callback("ignore");
       console.log("calling to callback ignore");  
    } else{
      adduser(user, host,function(result) {
      if(result == "success") {
        console.log("success: U100, V001"); 
        callback(result);
        //access the code from dictionary/basecamp
        //res.send("success: U100, V001");          
      } 
      else {
        console.log("error: C101");
        //res.send("error: C101");
        callback(result);               
      }
    });
    }
  })
}

exports.addUser=function(user,host,callback){
   console.log("calling to addUser for admin organization");
      adduser(user, host,function(result) {
      if(result == "success") {
        console.log("success: U100, V001"); 
        callback(result);
        //access the code from dictionary/basecamp
        //res.send("success: U100, V001");          
      } 
      else {
        console.log("error: C101");
        //res.send("error: C101");
        callback(result);               
      }
    });
   
}
adduser = function (user, host, callback) 
{
    logger.emit("log","calling to adduser function");
    console.log("email"+user["email"])
   
        user.save(function(err,user){
          if(err) {
            logger.error(err);
          } else {
        /* calling to create verfication token*/
        //User.find({username:})
            var templatetype;
            if(user["orgid"] && !user["password"]){
                templatetype="invite";
            } else{
              templatetype="verify"
            }
            var verificationToken = new VerificationTokenModel({_userId: user.userid,tokentype:"user"});
            verificationToken.createVerificationToken(function (err, token) {
              if (err){  
                return logger.error("Couldn't create verification token", err);
              }
              var url = "http://"+ host+"/api/verify/"+token;
              EmailTemplateModel.find({"templatetype":templatetype},function(err,emailtemplate){
                
                console.log("emailtemplate"+emailtemplate);
                var htmldata="<center><table width=500><tr bgcolor='black'><td><h2><font color='white'>Please confirm Your email address</font></h2></td></tr><tr><td><html><td></tr><tr bgcolor='black'><td height=30></td></tr></table></center>";
                htmldata=S(htmldata);
                var html=emailtemplate[0].description;
                html=S(html);
                html=html.replaceAll("<name>",user.fullname);
                html=html.replaceAll("<url>",url);
                htmldata=htmldata.replaceAll("<html>",html.s);
                var message = {
                    from: "Prodonus  <noreply@prodonus.com>", // sender address
                    to: user.email, // list of receivers
                    subject:emailtemplate[0].subject, // Subject line
                    html: htmldata.s // html body
                  };
                console.log("email"+user.email)
                console.log("message data"+message+" token data"+token);
                console.log("requestd host"+ host);
                //calling to sendmail method
                commonapi.sendMail(message, function (result){
                 callback(result);
                });
              })
           });
          }
       })
}
      


exports.signup = function(req,res) {
    var  userdata=req.body;
    var user = new userModel(userdata);
    if(userdata.email!=undefined && userdata.password!=undefined&&userdata.fullname!=undefined){
        userModel.find({email:userdata.email},function(err,userdata){
        if(err){
          logger.on("error","error in checking in databae email alerady exist for individual user",userdata.email);
          res.send({"error":{"message":err}});
        }
       // console.log("userdata"+userdata);
       // logger.data("userdata");
        if(userdata.length==0){
          adduser(user, req.get('host'),function(result) {
            if(result == "success") {
              logger.emit("info","User Added Successfully",user); //access the code from dictionary/basecamp
              res.send({"success":{"message":"User Added Successfully"}});          
            } else {
              logger.error("Problem in adding new User");
              res.send({"error":{"message":"Error in adding user"}});               
            }
          });
       } else {
       //   logger.error("email already exists");
          logger.emit("error","email already exists",user["email"]);
          res.send({"error":{"message":"email already exists"}});
        }
  })}else{
    logger.error("Please send required data for registration");
    res.send({"error":{"message":"Please send required data for registration"}});

  }
  
}
    
