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
console.log("init##");
  app.post('/api/organization',auth,api.orgapi.addOrganization);//create
  app.put('/api/organization/:orgid',auth, api.orgapi.updateOrganization);//update
  app.get('/api/organization',auth,api.orgapi.getAllOrganization); //read
  app.get('/api/orgnames',auth,api.orgapi.getAllOrganizationName); //read all org name
  app.get('/api/organization/:orgid',auth, api.orgapi.getOrganization);//read
  app.get('/api/orgindustrycategory',auth,api.orgapi.getOrgIndustryCategory);//get all industry category
  app.post('/api/orgdeleterequest/:orgid',auth,api.orgapi.requestToDeleteOrganization);
 
  app.delete('/api/organization/:orgid',auth, api.orgapi.deleteOrganization);//delete
  ///organization address
  app.get("/api/orgaddress/:orgid",auth,api.orgapi.getOrgAddressByCriteria);
  app.post("/api/orgaddress/:orgid",auth,api.orgapi.addOrgAddress);
  
  //Access to ONLY prodonus Admin //set up admin  role
 app.put("/api/orgaddress/:orgid/:orgaddressid",auth,api.orgapi.updateOrgAddress);
 app.delete("/api/orgaddress/:orgid/:orgaddressid",auth,api.orgapi.deleteOrgAddress);
 app.delete("/api/image/org/:orgid",auth,api.orgapi.deleteOrgImage);
 app.get("/api/orggroupmembers/:orgid",auth,api.orgapi.getMyGroupMembers)
 app.post('/api/orginvite/:orgid', auth,api.orgapi.orginvites);
 app.post("/api/otherorginvite/:orgid",auth,api.orgapi.otherOrgInvites);
 app.post("/api/orgcustomerinvite/:orgid",auth,api.orgapi.OrgCustomerInvites);
 app.delete("/api/orggroupmember/:orgid/:grpid/:userid",auth,api.orgapi.removeOrgGroupMembers);
 app.post("/api/organization/broadcast/:orgid",auth,api.orgapi.broadcastMessage);
 app.get("/api/organization/broadcast/:orgid",auth,api.orgapi.getBroadcastMessage);
 app.delete("/api/keyclient/org/:orgid",auth,api.orgapi.deleteOrgKeyClient);
 app.delete("/api/organization/broadcast/:orgid/:broadcastid",auth,api.orgapi.deleteBroadcastMessage)
 

}