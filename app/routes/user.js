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
var api = require("../app/api/api.js");
var auth=require('../app/common/js/security');
// User - REST apis
exports.init = function (app) {
  app.get('/verify/:token',api.userapi.verifyUser);
  app.post('/login', api.userapi.loginSession);
  app.post('/signup', api.userapi.signup);
  app.post('/forgotpassword',api.userapi.forgotpassword);
  app.get("/forgotpassword/:token",api.userapi.forgotpasswordurlaction);
  app.post("/resetpassword", auth,api.userapi.resetpassword);


}