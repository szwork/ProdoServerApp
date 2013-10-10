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

//default emiltemplate record saved

//Create login session
exports.loginSession = function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { 
      return next(err); 
    } 
    if (!user) {
     // req.session.messages =  [info.message];
      return res.send({"err":[info.message]});
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
    userModel.findOne({ email: email}, function(err, user) 
    {
      if (err)
      { 
        return done(err); 
      }

      if (!user) 
      {
        console.log("unkown user");
        return done(null, false, { message: 'Unknown user ' + email }); 
      };
      console.log("user data in login action"+user.verified);
      if(user.verified==false)
      {
        console.log("verfication is not done please verify");
        return done(null,false,{message:"please verfiy or resend verfication email"});
      }
    
      user.comparePassword(password, function(err, isMatch)
      {
          if ( err )
          {
              return done(err);
          }
          if( isMatch ) 
          {
            return done(null, user);
          }
          else
          {
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
/*
emailtemplate 
*/
exports.verifyUser = function (req, res, next) {
  var token = req.params.token;
  verify(token, function (dberr,err,user)
  {
    if (dberr)
    { 
      console.log("error in verify token "+err);
      //return res.redirect("verification-failure");
      res.send({"error":"error in userverification token model"});
      /*here we call req.logIn passport for under session 
        res.send("/");
        */
    } 
    if(err)
    {
      console.log("token is expired or invalid token");
      //return res.redirect("verification-failure");
      res.send({"exception":"token is expired or invalid token"});
      
    }
    else 
    {
        //var url = "http://"+ host+"/verify/"+token;
          EmailTemplateModel.find({"templatetype":"welcome"},function(err,emailtemplate)
          {
              console.log("emailtemplate"+emailtemplate);
              var html=emailtemplate[0].description;
              html=S(html);
              html=html.replaceAll("<fullname>",user.fullname);
             // html=html.replaceAll("<url>",url);
              var message = 
              {
                from: "Prodonus  <noreply@prodonus.com>", // sender address
                to: user.email, // list of receivers
                subject:emailtemplate[0].subject, // Subject line
                html: html+"" // html body
              };
              console.log("email"+user.email)
             // console.log("message data"+message+" token data"+token);
             // console.log("requestd host"+ host);
              //calling to sendmail method
              commonapi.sendMail(message, function (result)
              {
                if (result == "failure") 
                {
                 // not much point in attempting to send again, so we give up
                 // will need to give the user a mechanism to resend verification
                 // callback(result);
                 res.send({"message":"unverified","info":"error in verifying user"});
                }
                else 
                {
                  res.send({"message":"verified","info":"Successfully verified user"});
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
    if (err)
    {
     return done(err);
     console.log("error in verification token");
    }
    console.log("verification token data"+userverificationtoken);
    if(userverificationtoken!=null)
    {  
        userModel.findOne({_id: userverificationtoken._userId}, function (err, user) {
        if (err) {
          return done(err);
        }
        user["verified"] = true;
        user.save(function(err,user) {
               
        });
        userverificationtoken["status"]="deactive";
        userverificationtoken.save(function(err,user)
        {
          console.log("userverificationtoken token set deactive");
        });
       // done(user);

        done(null,null,user);
        
       // done(user);
      });
    }
    else
    {
      console.log("token is expird or invalid token");
     // res.send({"error":"token is expired or invalid token"});
      done(null,"error");
    } 
  });
};
//add an individual user

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
        var verificationToken = new VerificationTokenModel({_userId: user._id,tokentype:"password"});
        verificationToken.createVerificationToken(function (err, token) 
        {
            if (err) return console.log("Couldn't create verification token for forget password", err);
            var url="http://"+ req.get('host')+"/forgotpassword/"+token;
            //var url = "http://"+ host+"/verify/"+token;
          EmailTemplateModel.find({"templatetype":"password"},function(err,emailtemplate)
          {
              console.log("emailtemplate"+emailtemplate);
              var html=emailtemplate[0].description;
              html=S(html);
             // html=html.replaceAll("<email>",user.email);
              html=html.replaceAll("<url>",url);
              var message = 
              {
                from: "Prodonus  <noreply@prodonus.com>", // sender address
                to: user.email, // list of receivers
                subject:emailtemplate[0].subject, // Subject line
                html: html+"" // html body
              };
             // console.log("email"+user.email)
              console.log("message data"+message+" token data"+token);
              //console.log("requestd host"+ host);
              //calling to sendmail method
              commonapi.sendMail(message, function (result)
              {
                if (result == "failure") 
                {
                 // not much point in attempting to send again, so we give up
                 // will need to give the user a mechanism to resend verification
                 // callback(result);
                 res.send({"message":"forget password","info":"Problem in sending password setting"});
                }
                else 
                {
                  res.send({"message":"forget password","info":"password settings sent to your mail"})
                  //callback(result);
                }
              });
          })
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
    verifyPasswordToken(token, function(dberr,err,user)
     {
        if (dberr) 
        {
          res.send({"dberror":"erro in forgetpasswordtoken collection"});
        }
        if(err)
        {
          console.log("tokne is expired or invalid token");
          res.send({"exception":"token is expired or invalid token"});
        }
        else
        {
              req.logIn(user, function(err)
               {
                 if (err)
                  { 
                    res.send({"error":"error in creating session for user"});
                    console.log(err+"errro in creating session for particular userid");
                  }
                  else{
                    res.send({"success":"create session and send it to resetpassword page"});
                  }
                
               });
        }
    });
};
verifyPasswordToken = function(token, done)
 {
    VerificationTokenModel.findOne({token: token,status:"active",tokentype:"password"}, function (err, forgetpasswordtoken)
    {
        if ( err )
        { 
          return done(err);
        }
        if(forgetpasswordtoken!=null)
        {
          userModel.findOne({_id: forgetpasswordtoken._userId}, function (err, user) 
          {
              if (err) return done(err);
              console.log("user data"+user);
              forgetpasswordtoken["status"] = "deactive";
              forgetpasswordtoken.save(function(err,docs)
              {
                if(err)
                { 
                    console.error(err);
                    done(err);
                }

                if(docs)
                {
                    console.log("forget passwordtoken model  change status");
                     done(null,null,user);
                }
              });
                 
          })
        }
        else
        {
          done(null,"err1");
        }
    })
}
//adding email template
/*var description="Hey, we want to verify that you are indeed <email> If that/s the case, please follow the link below:";
    description+= "<br><url><br><br> If you're not <email> didn't request verification you can ignore this email."
var template=
{ 
  templatetype:"verfiy",
  subject:"Prodonus verifcation Link",
  description:description
            
}
var emailtemplate=new EmailTemplateModel(template);
emailtemplate.save(function(err,template)
{
  if(err)
  {
    console.log("error in saving template");
  }
  console.log(template);
})

*/
exports.addInviteUser=function(user,host,callback)
{
  console.log("user email"+user["email"]);
  userModel.find({email:user["email"]},function(err,userdata)
  {
    if(err)
    {
      console.log("error in checking in databae email alerady exist or not for invites");
    }
    console.log("userdata.length"+userdata.length);
    if(userdata.length!=0)
    {
       callback("ignore");
       console.log("calling to callback ignore");  
    }
    else
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
    }
  })
}

exports.addUser=function(user,host,callback)
{
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
    console.log("calling to adduser function");
    console.log("email"+user["email"])
   
        user.save(function(err,user)
        {
          if(err) 
          {
            console.log(err);
          }  
          else 
          {
        /* calling to create verfication token*/
        //User.find({username:})
            var templatetype;
            if(user["orgid"] && !user["password"])
            {
                templatetype="invite";
            }
            else
            {
              templatetype="verify"
            }
            var verificationToken = new VerificationTokenModel({_userId: user._id,tokentype:"user"});
            verificationToken.createVerificationToken(function (err, token) 
            {
              if (err)
              {  
                return console.log("Couldn't create verification token", err);
              }
              var url = "http://"+ host+"/verify/"+token;
              EmailTemplateModel.find({"templatetype":templatetype},function(err,emailtemplate)
              {
                console.log("emailtemplate"+emailtemplate);
                var html=emailtemplate[0].description;
                html=S(html);
                html=html.replaceAll("<email>",user.email);
                html=html.replaceAll("<url>",url);
                var message = 
                  {
                    from: "Prodonus  <noreply@prodonus.com>", // sender address
                    to: user.email, // list of receivers
                    subject:emailtemplate[0].subject, // Subject line
                    html: html+"" // html body
                  };
                console.log("email"+user.email)
                console.log("message data"+message+" token data"+token);
                console.log("requestd host"+ host);
                //calling to sendmail method
                commonapi.sendMail(message, function (result)
                {
                  if (result == "failure") 
                  {
                 // not much point in attempting to send again, so we give up
                 // will need to give the user a mechanism to resend verification
                  callback(result);
                  }
                  else 
                  {
                    callback(result);
                  }
                });
              })
           });
          }
       })
}
      


exports.signup = function(req,res) {
   // var username=req.body.username;
    //var fullname = req.body.fullname;
    //var email = req.body.email;
    //var password = req.body.password;
    var  userdata=req.body.user;
    var user = new userModel(userdata);
     console.log("userdata"+userdata)
    //calling to adduser function
    userModel.find({email:user["email"]},function(err,userdata)
    {
      if(err)
      {
        console.log("error in checking in databae email alerady exist for individual user");
      }
      console.log("userdata"+userdata);
      if(userdata.length==0)
      {
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
     }
     else
     {
      console.log("email already exists");
      res.send({"exception":"email aleready exists"});
     }
      
    })
  }
    
