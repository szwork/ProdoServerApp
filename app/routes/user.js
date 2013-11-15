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
  app.get('/api/verify/:token',api.userapi.verifyUser);
  app.post('/api/signin', api.userapi.loginSession);

  app.post('/api/user', api.userapi.addUser);//add new user
  app.get("/api/user",auth,api.userapi.getAllUser);//get all user data
  app.get("/api/user/:userid",auth,api.userapi.getUser);//get single user data
  app.put("/api/user/:userid",auth,api.userapi.updateUser);//update the user data
  app.delete("/api/user/:userid",auth,api.userapi.deleteUser);//delete user

  app.post('/api/forgotpassword',api.userapi.forgotpassword);
  app.get("/api/forgotpassword/:token",api.userapi.forgotpasswordurlaction);
  app.post("/api/resetpassword", auth,api.userapi.resetpassword);
  app.get('/api/emailtemplate',api.emailtemplateapi.getAllEmailTemplate);
  app.post('/api/loadsubscription',api.subscriptionapi.loadsubscriptiondata);
  app.get('/api/subscription',api.subscriptionapi.getAllSubscriptionPlan);
  app.post('/api/loademailtemplate',api.emailtemplateapi.loadEmailTemplate);
  app.post('/api/loadsequence',api.commonapi.loadsequences);
   
}