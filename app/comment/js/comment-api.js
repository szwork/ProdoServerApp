var Comment=require("./comment");
var logger=require("../../common/js/logger");
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
exports.comment=function(io){ 
io.sockets.on('connection', function(socket) {
    var sessionuserid=socket.handshake.user.userid;
    // console.log("passport sessiond"+socket.handshake.sessionID);
    // console.log("sessionuserid"+sessionuserid)
    socket.on('addComment', function(prodle,commentdata) {
      var comment = new Comment(commentdata);
      comment.on("failedAddComment",function(err){
        logger.emit("error", err.error.message);
          // comment.removeAllListeners(); 
        socket.emit("addcommentResponse",err);
        comment.removeAllListeners("failedAddComment",function(stream){ 

        })
         // callback(err);
      });
      comment.on("successfulAddComment",function(result){
        logger.emit("info", result.success.message);
        comment.removeAllListeners("successfulAddComment",function(stream){ 

        })
        socket.emit("addcommentResponse",null,result);
        if(commentdata.type=="product"){
          socket.broadcast.emit("productcommentResponse",null,result);
        }else{
          socket.broadcast.emit("warrantycommentResponse",null,result);
        }
      });

      comment.addComment(sessionuserid,prodle);
    });
  // socket.on('uploadFiles', function(file,action) {
  //   ///action for user profile update
  //    //action:{user:{userid:}}
  //    //action for org images upload
  //    //action:{org:{userid:,orgid:}}
  //    //action for product images upload
  //    //action:{product:{userid:,orgid:,prodle:}}
      
  //   console.log("calling to Upload files");
  //   ///////////////
  //   api.commonapi.uploadFiles(file,__dirname,action,function(err,url){
  //     if(err){
  //       console.log("error in uploadFiles"+err);
  //     }else{
  //       socket.emit("uploadFileResponse",url);
  //     }
  //   })
  // })
})



}
