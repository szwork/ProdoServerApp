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

// User - REST apis
function init(app) {
  app.get('/verify/:token', api.userapi.verifyuser);
  app.post('/login', api.userapi.loginSession);
  app.post('/signup', api.userapi.signup);
}