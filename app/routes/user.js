/*
* Overview: Prodonus App
* Dated:
* Author: Sunil More
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* 27-3/2013 | xyx | Add a new property
* 
*/

//Prodonus Routes
var api = require("../api/api.js");
var auth=require('../common/js/security');
// User - REST apis
exports.init = function (app) {
  //USER CRUD


  app.post('/api/user/signin', api.userapi.signin);
  app.post('/api/user/signup', api.userapi.addUser);//add new user
  app.get("/api/user",auth,api.userapi.getAllUser);//get all user data
  app.get("/api/user/:userid",auth,api.userapi.getUser);//get single user data
  app.put("/api/user/:userid",auth,api.userapi.updateUser);//update the user data
  app.delete("/api/user/:userid",auth,api.userapi.deleteUser);//delete user
  app.post('/api/user/forgotpassword',api.userapi.forgotPassword);
  app.get('/api/logout',auth,api.userapi.signOutSessions);
  app.post('/api/recaptcha',api.userapi.recaptcha); 
  app.get('/api/verify/:token',api.userapi.verifyAccount);
  app.post('/api/regenerateverificationtoken',api.userapi.regenerateVerificationUrl);
  app.put("/api/user/resetpassword/:userid",auth,api.userapi.resetPassword);
  app.get("/api/isloggedin",api.userapi.isLoggedIn);
  // app.get("/api/sendtestmail",api.commonapi.sendTestMail);

  app.get("/api/user/follow/:prodle",auth, api.userapi.followproduct);
  app.get("/api/user/unfollow/:prodle",auth, api.userapi.unfollowproduct);
  
  app.get('/api/subscription/:plantype',api.subscriptionapi.getSubscriptionPlanbyType);
  app.post("/api/userinvites",auth,api.userapi.userInvites);
  app.get("/api/resetpassword/:token",api.userapi.passwordUrlAction);
  // function(req,res){
  //   if (req.isAuthenticated()){
  //     res.send({status:true,sessionid:req.sessionID,userid:req.user.userid});
  //   }
  //   else{
  //     res.send({status:false});
  //   }
  // })
  // app.get("/api/forgotpassword/:token",api.userapi.forgotpasswordurlaction);
  // app.post("/api/resetpassword", auth,api.userapi.resetpassword);
   app.get('/api/emailtemplate',api.emailtemplateapi.getAllEmailTemplate);
   app.get('/api/loadsubscription',auth,api.subscriptionapi.loadsubscriptiondata);
   app.get('/api/subscription',auth,api.subscriptionapi.getAllSubscriptionPlan);
   app.get("/api/loaddiscount",auth,api.discountapi.loaddiscount);
   app.get("/api/discount",auth,api.discountapi.getDiscountCode);
   app.post("/api/makepayment",auth,api.userapi.makePayment);
   app.get("/api/userunique/:username",api.userapi.checkUsernameExists);
   
   app.post('/api/loademailtemplate',auth,api.emailtemplateapi.loadEmailTemplate);
  // app.post('/api/loadsequence',api.commonapi.loadsequences);
   app.get('/api/profileinfo/:userid',auth,api.userapi.getProfileInfo);//get profile info
   app.get('/api/myproductsfollowed',auth,api.userapi.getMyProductsFollowed);//get my products followed
   app.get('/api/myrecommendproducts',auth,api.userapi.getMyRecommendProductsFollowed);//get my recommend products followed
   app.post('/api/changeemail/:userid',auth,api.userapi.changeEmail);
   app.post('/api/changepassword/:userid',auth,api.userapi.changePassword);
}