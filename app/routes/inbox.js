var api = require("../api/api.js");
var auth=require('../common/js/security');
// Blog - REST apis
exports.init = function (app) {
  app.get("/api/inboxmessage/:userid",auth,api.inboxapi.getMyLatestInbox)
  app.get("/api/loadmoreinboxmessage/:userid/:inboxid",auth,api.inboxapi.loadMoreInboxMessages)
  app.put('/api/inboxaction/:inboxid',auth,api.inboxapi.inboxAction);
  
   
}