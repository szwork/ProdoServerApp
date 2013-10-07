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

var verificationTokenModel = require('../../../common/js/verification-token-model');
var ForgotPasswordTokenModel=require('../../../common/js/forget-password-token-model')
var userModel = require('./user-model');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var commonapi = require('../../../common/js/common-api');

//Create login session
exports.loginSession = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { 
      return next(err); 
    } 
    if (!user) {
     // req.session.messages =  [info.message];
      return res.send("username and password is wrong")
    }
    req.logIn(user, function(err) {
      if (err) { 
        return next(err); 
      }
      return res.send(user);
    });
  })(req, res, next);
};

//passport method
passport.use( new LocalStrategy({ usernameField: 'email', passwordField: 'password'},
  function(email, password, done) {
    console.log("email" + email +" password"+password);
    userModel.findOne({ email: email}, function(err, user) {
    if (err) { 
      return done(err); 
    }
    if (!user) {
      console.log("unkown user");
      return done(null, false, { message: 'Unknown user ' + email }); 
    }
    
    user.comparePassword(password, function(err, isMatch) {
      if (err){
        return done(err);
      }
      if(isMatch) {
        return done(null, user);
      } else {
        console.log("unknown password");
        return done(null, false, { message: 'Invalid password' });
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

exports.verifyUser = function (req, res, next) {
  var token = req.params.token;
  verify(token, function (err,user) {
    if (err) { 
      console.log("error in verify token "+err);
      return res.redirect("verification-failure");
      /*here we call req.logIn passport for under session 
        res.send("/");
        */
      } else {
        var html="Welocme "+user.fullname+" in Prodonus";
           var message = 
             {
                from: "Prodonus <sunil@giantleapsystems.com>", // sender address
                to: user.email, // list of receivers
                subject:"Welocme To Prodonus", // Subject line
                html: html
 
             }
           commonapi.sendMail(message, function (result)
            {
                if (result=="failure")
                 {
                    // not much point in attempting to send again, so we give up
                    // will need to give the user a mechanism to resend verification
                    console.error("Unable to send via postmark: " + error.message);
                    res.send("unable to send welocme email to user");
                 }
                 else
                 {
                    console.log("success send forget password verification email");
                  res.send("succesfully verified user and welocme email sent to your emailid");  
                 }

            });
      }
  });
};

verify = function(token, done) {
  verificationTokenModel.findOne({token: token}, function (err, doc){
    if (err) {
     return done(err);
    }
    userModel.findOne({_id: doc._userId}, function (err, user) {
      if (err) {
        return done(err);
      }
      user["verified"] = true;
      user.save(function(err,user) {
             
      });
     // done(user);
      done(null,user);
      
     // done(user);
    });
  });
};
exports.addUser=function(user,host,callback)
{

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
};
exports.forgotpassword=function(req,res)
{
  var email=req.body.email;
  userModel.findOne({email:email},function(err,user)
  {
    if(err)
    {
      console.log(err);
    }
    if(user)
    {
      //send forget password token to mail
      //User.find({username:})
        var verificationToken = new ForgotPasswordTokenModel({_userId: user._id});
        verificationToken.createforgotPasswordToken(function (err, token) 
        {
            if (err) return console.log("Couldn't create verification token for forget password", err);
            var url="http://"+ req.get('host')+"/forgotpassword/"+token;
            var html="Please click this link to change your password on Prodonus:<br>"+url+"<br>Regards,<br>Prodonus"
            var message = 
             {
                from: "Prodonus <sunil@giantleapsystems.com>", // sender address
                to: user.email, // list of receivers
                subject:"Password reset reque​st for Prodonus", // Subject line
                html: html
 
             }
            console.log("email"+user.email)
            console.log("message data"+message+" token data"+token);
            console.log("requestd host"+ req.get('host'));
            commonapi.sendMail(message, function (result)
            {
                if (result=="failure")
                 {
                    // not much point in attempting to send again, so we give up
                    // will need to give the user a mechanism to resend verification
                    console.error("Unable to send via postmark: " + error.message);
                    res.send("unable to send forget password verification link");
                 }
                 else
                 {
                    console.log("success send forget password verification email");
                  res.send("success send forget password verification email");  
                 }

            });
        });
    }
    else
    {
        res.send("email is not registered with prodonus");
    }
  })
};
exports.resetpassword=function(req,res)
{
  var newpassword=req.body.newpassword;
  console.log("requested user"+req.user);
  console.log("email"+req.user.email);
  commonapi.getbcrypstring(newpassword,function(hash)
  {
    console.log("hash data"+hash);
          userModel.update({email:req.user.email},{$set:{password:hash}},function(err,status)
          {

            if(err)
            {
              res.send("error in reseting password");
            }
            if(status==1)
            {
              res.send("password successfully updated");
            }
          })
  })

};
exports.forgotpasswordurlaction=function (req, res) {
    var token = req.params.token;
    verifyPasswordToken(token, function(err,user)
     {
        if (err) 
        {
          res.send("verification-failure");
        }
        else
          {
              req.logIn(user, function(err)
               {
                 if (err)
                  { 
                    res.send("error in creating session for user");s
                     console.log(err+"errro in creating session for particular userid");
                  }
                  else{
                    res.send('create session and send it to resetpassword page');
                  }
                
               });
          }
    });
};
verifyPasswordToken = function(token, done) {
    ForgotPasswordTokenModel.findOne({token: token,status:"active"}, function (err, forgetpasswordtoken){
        if (err) return done(err);
        userModel.findOne({_id: forgetpasswordtoken._userId}, function (err, user) {
            if (err) return done(err);
            console.log("user data"+user);
            forgetpasswordtoken["status"] = "deactive";
            forgetpasswordtoken.save(function(err,docs) {
                if(err)
                { 
                    console.error(err);
                  done(err);
                }

                if(docs)
                {
                    console.log("forget passwordtoken model  change status");
                     done(user);
                }
            });
               
              
        })
    })
}

adduser = function (user, host, callback) {
    console.log("calling to adduser function");
    user.save(function(err,user){
      if(err) {
        console.log(err);
      } 
      else {
        /* calling to create verfication token*/
        //User.find({username:})
        var verificationToken = new verificationTokenModel({_userId: user._id});
        verificationToken.createVerificationToken(function (err, token) {
        if (err) { 
          return console.log("Couldn't create verification token", err);
        }
        var url = "http://"+ host+"/verify/"+token;
        var html="Hey, we want to verify that you are indeed “"+user.email+". If that's the case, please follow the link below:<br><br>"+url+"<br><br>";
            html+="If you're not "+user.email+"or didn't request verification you can ignore this email."
        var message = {
          from: "Prodonus  <sunilmore690@gmail.com>", // sender address
          to: user.email, // list of receivers
          subject:"Prodonus verification link", // Subject line
          text: "http://localhost:3000/verify/"+token, // plaintext body
          html: html // html body
        };
        console.log("email"+user.email)
        console.log("message data"+message+" token data"+token);
        console.log("requestd host"+ host);

        commonapi.sendMail(message, function (result){
          if (result == "failure") {
            // not much point in attempting to send again, so we give up
            // will need to give the user a mechanism to resend verification
            callback(result);
          }
          else {
            callback(result);
          }
        });
      });
    }
  })
};

exports.signup = function(req,res) {
   // var username=req.body.username;
    var fullname = req.body.fullname;
    var email = req.body.email;
    var password = req.body.password;
    var user = new userModel({ fullname: fullname, email: email, password: password});

    //calling to adduser function
    adduser(user, req.get('host'),function(result) {
      if(result == "success") {
        console.log("success: U100, V001"); //access the code from dictionary/basecamp
        res.send("success: U100, V001");          
      } 
      else {
        console.log("error: C101");
        res.send("error: C101");               
      }
    });
};
