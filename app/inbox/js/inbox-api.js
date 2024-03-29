var Inbox=require("./inbox");
var logger=require("../../common/js/logger");

exports.inboxAction = function(req, res) {
  var messageid=req.params.messageid;
  var action=req.query.action;
  var sessionuserid=req.user.userid;
  var inbox=new Inbox();
  inbox.removeAllListeners("failedInboxAction");
  inbox.on("failedInboxAction",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    res.send(err);
  });
  inbox.removeAllListeners("successfulInboxAction");
  inbox.on("successfulInboxAction",function(result){
    logger.emit("info", result.success.message);
    
    res.send(result);
    });
  inbox.inboxAction(sessionuserid,messageid,action);
    
}
exports.getMyLatestInbox=function(req,res){
  var userid=req.params.userid;
  var sessionuserid=req.user.userid;
  var messagetype=req.query.messagetype;
  var inbox=new Inbox();
  inbox.removeAllListeners("failedGetMyLatestInbox");
  inbox.on("failedGetMyLatestInbox",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    res.send(err);
  });
  inbox.removeAllListeners("successfulGetMyLatestInbox");
  inbox.on("successfulGetMyLatestInbox",function(result){
    logger.emit("info", result.success.message);
    
    res.send(result);
    });
  if(userid!=sessionuserid){
    inbox.emit("failedGetMyLatestInbox",{"error":{"code":"EA001","message":"You have not authorize to done this action"}})
  }else{
    inbox.getMyLatestInbox(sessionuserid,messagetype); 
  }
}
exports.loadMoreInboxMessages=function(req,res){
  var userid=req.params.userid;
  var messageid=req.params.messageid;
  var sessionuserid=req.user.userid;
  var inbox=new Inbox();
  inbox.removeAllListeners("failedLoadMoreInboxMessages");
  inbox.on("failedLoadMoreInboxMessages",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    res.send(err);
  });
  inbox.removeAllListeners("successfulLoadMoreInboxMessages");
  inbox.on("successfulLoadMoreInboxMessages",function(result){
    logger.emit("info", result.success.message);
    
    res.send(result);
    });
  if(userid!=sessionuserid){
    inbox.emit("failedLoadMoreInboxMessages",{"error":{"code":"EA001","message":"You have not authorize to done this action"}})
  }else{
    inbox.loadMoreInboxMessages(sessionuserid,messageid); 
  }
}
exports.replyToInboxMessage=function(req,res){
  var userid=req.params.userid;
  var messageid=req.params.messageid;
  var sessionuserid=req.user.userid;
  var replytext=req.body.replytext;
  var inbox=new Inbox();
  inbox.removeAllListeners("failedReplyToInboxMessage");
  inbox.on("failedReplyToInboxMessage",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    res.send(err);
  });
  inbox.removeAllListeners("successfulReplyToInboxMessage");
  inbox.on("successfulReplyToInboxMessage",function(result){
    logger.emit("info", result.success.message);
    res.send(result);
    });
  if(userid!=sessionuserid){
    user.emit("failedReplyToInboxMessage",{"error":{"code":"EA001","message":"You have not authorize to done this action"}})
  }else if(req.user.org.orgid==null){
    inbox.emit("failedReplyToInboxMessage",{"error":{"code":"EA001","message":"You have not authorize to done this action"}})
  }else{
    inbox.replyToInboxMessage(sessionuserid,messageid,replytext); 
  }
}
exports.getMessagetypewisecount=function(req,res){
  var userid=req.params.userid;
  
  var inbox=new Inbox();
  inbox.removeAllListeners("failedGetMessagetypewisecount");
  inbox.on("failedGetMessagetypewisecount",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    res.send(err);
  });
  inbox.removeAllListeners("successfulGetMessageTypewisecount");
  inbox.on("successfulGetMessageTypewisecount",function(result){
    logger.emit("info", result.success.message);
    res.send(result);
  });
  if(userid!=req.user.userid){
    self.emit("failedGetMessagetypewisecount",{code:"EA001",message:"You can see your own message"})
  }else{
    inbox.getMessagetypewisecount(userid); 
  }
}







