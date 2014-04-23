var Comment=require("./comment");
var logger=require("../../common/js/logger");

var redisClient = require("redis").createClient();
// var io=require("../../../prodonus-app");
// exports.addCommentBySocket=function(sessionuserid,prodle,commentdata,callback){
  
  
//   // var userdata=commentdata.user;
//   logger.emit("log","coming commentdata"+JSON.stringify(commentdata));
   
//   var comment = new Comment(commentdata);
//   comment.removeListener("failedAddComment",function(stream){  
//     logger.emit("log","failedAddComment listener removed");

//   });
//   comment.on("failedAddComment",function(err){
//       logger.emit("error", err.error.message);
//       // comment.removeAllListeners(); 
//       io.socket.emit("addcommentResponse",err);
//       callback(err);
//     });
//   comment.removeListener("successfulAddComment",function(stream){
//     logger.emit("log","successfulAddComment listener removed");
//   });
//   comment.on("successfulAddComment",function(result){
//     logger.emit("info", result.success.message);
//     // comment.removeAllListeners();
//     io.socket.emit("addcommentResponse",null,result);
//     // callback(null,result);
//   });
//   comment.addComment(sessionuserid,prodle);
// }
exports.deleteComment = function(req, res) {
  var commentid=req.params.commentid;
  var sessionuserid=req.user.userid;
  var comment=new Comment();
  comment.removeAllListeners("failedCommentDeletion");
  comment.on("failedCommentDeletion",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    res.send(err);
  });

    comment.on("successfulCommentDeletion",function(result){
      logger.emit("info", result.success.message);
      
      res.send(result);
    });
  comment.deleteComment(sessionuserid,commentid);
    
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
        if(result.success.product_comment.type=="campaign"){
          socket.broadcast.emit("campaigncommentResponse"+prodle+" "+campaign_id,null,result);
        }else{
          socket.broadcast.emit("warrantycommentResponse"+prodle+" "+campaign_id,null,result);
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
  })
}
