var api = require("../api/api.js");
var auth=require('../common/js/security');
// Blog - REST apis
exports.init = function (app) {
  app.get("/api/inboxmessage/:userid",auth,api.inboxapi.getMyLatestInbox)
  app.get("/api/loadmoreinboxmessage/:userid/:messageid",auth,api.inboxapi.loadMoreInboxMessages)
  app.put('/api/inboxaction/:messageid',auth,api.inboxapi.inboxAction);
  app.post('/api/replytomessage/:userid/:messageid',auth,api.inboxapi.replyToInboxMessage);
  app.get('/api/messagetypwisecount/:userid',auth,api.inboxapi.getMessagetypewisecount)
   
}
