var Comment=require("./comment");
var logger=require("../../common/js/logger");
exports.addCommentBySocket=function(sessionuserid,prodle,commentdata,callback){
  
  
  // var userdata=commentdata.user;
  logger.emit("log","coming commentdata"+JSON.stringify(commentdata));
   
  var comment = new Comment(commentdata);
  comment.removeListener("failedAddComment",function(stream){  
    logger.emit("log","failedAddComment listener removed");

  });
  comment.on("failedAddComment",function(err){
      logger.emit("error", err.error.message);
      // comment.removeAllListeners(); 
      callback(err);
    });
  comment.removeListener("successfulAddComment",function(stream){
    logger.emit("log","successfulAddComment listener removed");
  });
  comment.on("successfulAddComment",function(result){
    logger.emit("info", result.success.message);
    // comment.removeAllListeners();
    callback(null,result);
  });
  comment.addComment(sessionuserid,prodle);
}