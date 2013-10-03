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
var api = require("./app/api/api.js");

// REST api for invites
function init(app) {
  app.post('/organization', api.organizationapi.addOrganization);
  app.put('/organization/:orgid',organizationapi.updateOrganization);
  app.delete('/organization/:orgid',organizationapi.deleteOrganization);
  //Access to ONLY prodonus Admin 
  app.get('/organization',organizationapi.getAllOrganization); 
  app.get('/organization/:orgid',organizationapi.getorganizationbyid);
}