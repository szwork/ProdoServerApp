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
* 
*/

var verificationTokenModel = require('../../../common/js/verification-token-model');
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
      return res.redirect('/login')
    }
    req.logIn(user, function(err) {
      if (err) { 
        return next(err); 
      }
      return res.redirect('/');
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
      return done(null, false, { message: 'Unknown user ' + username }); 
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
  verify(token, function(err) {
    if (err) { 
      return res.redirect("verification-failure");
      /*here we call req.logIn passport for under session 
        res.send("/");
        */
      } else {
        res.send("successfully verfied the user");
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
      user.save(function(err) {
        done(err);
      });
    });
  });
};

addUser = function (user, host, callback) {
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
        var message = {
          from: "Sunil More  <sunilmore690@gmail.com>", // sender address
          to: user.email, // list of receivers
          subject:"Prodonus verification link", // Subject line
          text: "http://localhost:3000/verify/"+token, // plaintext body
          html: "<a href="+url+">Verify </b>" // html body
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
    addUser(user, req.get('host'),function(result) {
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
