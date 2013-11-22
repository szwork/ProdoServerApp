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

//Prodonus Routesar

// var auth = require('../app/common/js/security');
var api = require("../api/api.js");
var auth=require('../common/js/security');
// Organization - REST api
exports.init = function (app) {

  app.post('/api/organization', auth,api.orgapi.addOrganization);//create
  app.put('/api/organization/:orgid',auth, api.orgapi.updateOrganization);//update
   app.get('/api/organization',auth,api.orgapi.getAllOrganization); //read
  app.get('/api/organization/:orgid',auth, api.orgapi.getOrganization);//read
 
  app.delete('/api/organization/:orgid',auth, api.orgapi.deleteOrganization);//delete

  //Access to ONLY prodonus Admin //set up admin  role
 
  app.post('/api/invites/:orgid', auth,api.orgapi.invites);
}