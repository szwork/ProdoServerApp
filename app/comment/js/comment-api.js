var Comment=require("./comment");
var logger=require("../../common/js/logger");

var redisClient = require("redis").createClient();

exports.deleteComment = function(req, res) {
  var commentid=req.params.commentid;
  var sessionuserid=req.user.userid;
  var comment=new Comment();
  comment.removeAllListeners("failedCommentDeletion");
  comment.on("failedCommentDeletion",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    res.send(err);
  });
     comment.removeAllListeners("successfulCommentDeletion");
    comment.on("successfulCommentDeletion",function(result){
      logger.emit("info", result.success.message);
      
      res.send(result);
    });
  comment.deleteComment(sessionuserid,commentid);
    
}

exports.deleteCampaignComment = function(req, res) {
  var commentid=req.params.commentid;
  var sessionuserid=req.user.userid;
  var comment=new Comment();
  comment.removeAllListeners("failedCampaignCommentDeletion");
  comment.on("failedCampaignCommentDeletion",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    res.send(err);
  });
     comment.removeAllListeners("successfulCampaignCommentDeletion");
    comment.on("successfulCampaignCommentDeletion",function(result){
      logger.emit("info", result.success.message);
      
      res.send(result);
    });
  comment.deleteCampaignComment(sessionuserid,commentid);    
}

exports.deleteBlogComment = function(req, res) {
  var commentid=req.params.commentid;
  var sessionuserid=req.user.userid;
  var comment=new Comment();
  comment.removeAllListeners("failedBlogCommentDeletion");
  comment.on("failedBlogCommentDeletion",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    res.send(err);
  });
     comment.removeAllListeners("successfulBlogCommentDeletion");
    comment.on("successfulBlogCommentDeletion",function(result){
      logger.emit("info", result.success.message);
      
      res.send(result);
    });
  comment.deleteBlogComment(sessionuserid,commentid);    
}

exports.loadMoreComment=function(req,res){
  var commentid=req.params.commentid;
  var sessionuserid=req.user.userid;
  var comment=new Comment();
  comment.removeAllListeners("failedLoadMoreComment");
  comment.on("failedLoadMoreComment",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    res.send(err);
  });
    comment.removeAllListeners("successfulLoadMoreComment");
    comment.on("successfulLoadMoreComment",function(result){
      logger.emit("info", result.success.message);
      
      res.send(result);
    });
  comment.loadMoreComment(sessionuserid,commentid);
}

exports.loadMoreCampaignComment=function(req,res){
  var commentid=req.params.commentid;
  var sessionuserid=req.user.userid;
  var comment=new Comment();
  comment.removeAllListeners("failedLoadMoreCampaignComment");
  comment.on("failedLoadMoreCampaignComment",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    res.send(err);
  });
  comment.removeAllListeners("successfulLoadMoreCampaignComment");
  comment.on("successfulLoadMoreCampaignComment",function(result){
    logger.emit("info", result.success.message);
      
    res.send(result);
  });
  comment.loadMoreCampaignComment(sessionuserid,commentid);
}

exports.loadMoreBlogComment=function(req,res){
  var commentid=req.params.commentid;
  var sessionuserid=req.user.userid;
  var comment=new Comment();
  comment.removeAllListeners("failedLoadMoreBlogComment");
  comment.on("failedLoadMoreBlogComment",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    res.send(err);
  });
  comment.removeAllListeners("successfulLoadMoreBlogComment");
  comment.on("successfulLoadMoreBlogComment",function(result){
    logger.emit("info", result.success.message);
      
    res.send(result);
  });
  comment.loadMoreBlogComment(sessionuserid,commentid);
}

exports.comment=function(io,__dirname){
  io.of('/api/prodoapp').on('connection', function(socket) {
    var sessionuserid=socket.handshake.user.userid;
    socket.on('addComment', function(prodle,commentdata) {
      var comment = new Comment(commentdata);
      logger.emit("log",prodle+""+JSON.stringify(commentdata));
      comment.removeAllListeners("failedAddComment");
      comment.on("failedAddComment",function(err){
        logger.emit("error", err.error.message,sessionuserid);
        socket.emit("addcommentResponse",err);
      });
      comment.removeAllListeners("successfulAddComment");
      comment.on("successfulAddComment",function(result){
        logger.emit("info", result.success.message,sessionuserid);
        socket.emit("addcommentResponse",null,result);
        if(result.success.product_comment.type=="product"){
          socket.broadcast.emit("productcommentResponse"+prodle,null,result);
        }else{
          socket.broadcast.emit("warrantycommentResponse"+prodle,null,result);
        }
      });
      redisClient.get("sess:"+socket.handshake.sessionID, function(err, reply) {
        if(err){
          logger.emit("log","Errrr in get sessionid client");
        }else if(reply==null){
          socket.emit("addcommentResponse",{"error":{"code":"AL001","message":"User Session Expired"}});
        }else if(JSON.parse(reply).passport.user==undefined){
          socket.emit("addcommentResponse",{"error":{"code":"AL001","message":"User Session Expired"}});
        }else{
          comment.addComment(sessionuserid,prodle,__dirname);   
        }      
      });
    })

    socket.on('addCampaignComment', function(prodle,campaign_id,commentdata) {
      var comment = new Comment(commentdata);      
      logger.emit("log",campaign_id+""+JSON.stringify(commentdata));
      comment.removeAllListeners("failedAddCampaignComment");
      comment.on("failedAddCampaignComment",function(err){
        logger.emit("error", err.error.message,sessionuserid);
        socket.emit("addCampaignCommentResponse",err);
      });
      comment.removeAllListeners("successfulAddCampaignComment");
      comment.on("successfulAddCampaignComment",function(result){
        logger.emit("info", result.success.message,sessionuserid);
        socket.emit("addCampaignCommentResponse",null,result);
        if(result.success.campaign_comment.type=="campaign"){
          socket.broadcast.emit("campaigncommentResponse"+campaign_id,null,result);
        }else{
          socket.broadcast.emit("warrantycommentResponse"+campaign_id,null,result);
        }
      });
      redisClient.get("sess:"+socket.handshake.sessionID, function(err, reply) {
        if(err){
          logger.emit("log","Errrr in get sessionid client");
        }else if(reply==null){
          socket.emit("addCampaignCommentResponse",{"error":{"code":"AL001","message":"User Session Expired"}});
        }else if(JSON.parse(reply).passport.user==undefined){
          socket.emit("addCampaignCommentResponse",{"error":{"code":"AL001","message":"User Session Expired"}});
        }else{
          comment.addCampaignComment(sessionuserid,prodle,campaign_id,__dirname);   
        }      
      });
    })
    
    socket.on('addBlogComment', function(prodle,blogid,commentdata) {
      var comment = new Comment(commentdata);      
      logger.emit("log","blogid : "+blogid+" commentdata : "+JSON.stringify(commentdata));
      comment.removeAllListeners("failedAddBlogComment");
      comment.on("failedAddBlogComment",function(err){
        logger.emit("error", err.error.message,sessionuserid);
        socket.emit("addBlogCommentResponse",err);
      });
      comment.removeAllListeners("successfulAddBlogComment");
      comment.on("successfulAddBlogComment",function(result){
        logger.emit("info", result.success.message,sessionuserid);
        socket.emit("addBlogCommentResponse",null,result);
        if(result.success.blog_comment.type=="blog"){
          socket.broadcast.emit("blogCommentResponse"+blogid,null,result);
        }else{
          socket.broadcast.emit("warrantycommentResponse"+blogid,null,result);
        }
      });
      redisClient.get("sess:"+socket.handshake.sessionID, function(err, reply) {
        if(err){
          logger.emit("log","Errrr in get sessionid client");
        }else if(reply==null){
          socket.emit("addBlogCommentResponse",{"error":{"code":"AL001","message":"User Session Expired"}});
        }else if(JSON.parse(reply).passport.user==undefined){
          socket.emit("addBlogCommentResponse",{"error":{"code":"AL001","message":"User Session Expired"}});
        }else{
          comment.addBlogComment(sessionuserid,prodle,blogid,__dirname);   
        }      
      });
    })

  })
}

exports.agreeDisagreeComment=function(req,res){
  var commentid=req.params.commentid;
  var sessionuserid=req.user.userid;
  var action=req.query.action;
  var comment=new Comment();
  comment.removeAllListeners("failedAgreeDisagreeComment");
  comment.on("failedAgreeDisagreeComment",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    res.send(err);
  });
    comment.removeAllListeners("successfulAgreeDisagreeComment");
    comment.on("successfulAgreeDisagreeComment",function(result){
      logger.emit("info", result.success.message);
      
      res.send(result);
    })
    comment.agreeDisagreeComment(sessionuserid,commentid,action);
  }

exports.getUserInfoCommentedOnProduct = function(req,res){
  var prodle = req.params.prodle;
  var sessionuserid=req.user.userid;
  var comment=new Comment();
  comment.removeAllListeners("failedGetUserInfoCommentedOnProduct");
  comment.on("failedGetUserInfoCommentedOnProduct",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    res.send(err);
  });
    comment.removeAllListeners("successfulGetUserInfoCommentedOnProduct");
    comment.on("successfulGetUserInfoCommentedOnProduct",function(result){
      logger.emit("info", result.success.message);
      
      res.send(result);
      
    });
  if(req.user.org.isAdmin == true) {
    comment.getUserInfoCommentedOnProduct(sessionuserid,prodle);
  }else{
    comment.emit("failedGetUserInfoCommentedOnProduct",{"error":{"code":"EA001","message":"You have not authorize to done this action"}});
  }
}
exports.replyToComment = function(req,res){
  // var prodle = req.params.prodle;
  var sessionuserid=req.user.userid;
  var commentid=req.params.commentid;
  var replydata=req.body.replydata;
  var comment=new Comment();
  comment.removeAllListeners("failedReplyToComment");
  comment.on("failedReplyToComment",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    res.send(err);
  });
    comment.removeAllListeners("successfulReplyToComment");
    comment.on("successfulReplyToComment",function(result){
      logger.emit("info", result.success.message);
      
      res.send(result);
      
    });
  if(req.user.org.isAdmin == true) {
    comment.replyToComment(req.user,commentid,replydata);
  }else{
    comment.emit("failedReplyToComment",{"error":{"code":"EA001","message":"You have not authorize to done this action"}});
  }
}
  

  
  


