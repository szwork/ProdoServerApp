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
var app=require("../../../prodonus-app");
auth = function (req, res, next) {
  if (req.isAuthenticated()) { 
  	return next(); }
  //app.set("userid","");
 // req.session.destroy();
  res.send({"error":{"message":"please login to continue this operation"}});
}
module.exports= auth;