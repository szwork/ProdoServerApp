

var CommentModel=require("./comment-model");
var ProductModel=require("../../product/js/product-model");
var events = require("events");
var shortId = require('shortid');
var logger=require("../../common/js/logger");



var updateLatestProductComment=function(prodle){
	CommentModel.find({type:"product",status:"active"},{prodle:0}).sort({datecreated:-1}).limit(5).lean().exec(function(err,comment){
		if(err){
			logger.emit("log","Error in updation latest 5 product comment");
		}else if(comment.length!=0){
			ProductModel.update({prodle:prodle},{$set:{product_comments:comment}},function(err,latestupatestatus){
				if(err){
					logger.emit("error","Error in updation latest 5 product comment");
				}else if(latestupatestatus==1){
					logger.emit("log","Latest 5 product comments updated");			
				}else{
					logger.emit("error","Given product id is wrong to update latest 5 comments");
				}
			})
		}else{
			logger.emit("error","No comment of product type");
		}
	})
}
var Comment = function(commentdata) {
	this.comment = commentdata;
};


Comment.prototype = new events.EventEmitter;
module.exports = Comment;
Comment.prototype.addComment=function(sessionuserid,prodle){
	var self=this;
      ////////////////////////////////////
	_validateCommentData(self,sessionuserid,prodle);
	//////////////////////////////////////
	
}
var _validateCommentData=function(self,sessionuserid,prodle) {
	var commentdata=self.comment;
	if(commentdata==undefined){
	   self.emit("failedAddComment",{"error":{"code":"AV001","message":"Please provide commentdata"}});	
	}else if(commentdata.user==undefined){
		self.emit("failedAddComment",{"error":{"code":"AV001","message":"Please provide user to commentdata"}});		
	}else if(commentdata.user.userid==undefined){
		self.emit("failedAddComment",{"error":{"code":"AV001","message":"Please provide userid with user object"}});		
	} else if(commentdata.commenttext==undefined){
		self.emit("failedAddComment",{"error":{"code":"AV001","message":"Please pass commenttext"}});			
	}else if(commentdata.commenttext.trim().length==0){
		self.emit("failedAddComment",{"error":{"code":"AV001","message":"Please enter commenttext"}});			
	}else{
		///////////////////////////////////////////////////////
		_isSessionUserToComment(self,sessionuserid,prodle,commentdata);
		///////////////////////////////////////////////////////
	}
}
var _isSessionUserToComment=function(self,sessionuserid,prodle,commentdata){
	if(sessionuserid!=commentdata.user.userid){
		self.emit("failedAddComment",{"error":{"code":"EA001","message":"Provided userid is not match with sessionuserid"}})
	}else{
		///////////////////////////////////////////
		__addComment(self,prodle,commentdata);
		///////////////////////////////////////////
	}
}
var __addComment=function(self,prodle,commentdata){
	commentdata.commentid="prc"+shortId.generate();
	commentdata.status="active";
	commentdata.datecreated=new Date();
	commentdata.prodle=prodle;
	var comment_data=new CommentModel(commentdata);
	comment_data.save(function(err,product_commentdata){
		if(err){
			self.emit("failedAddComment",{"error":{"code":"ED001","message":"Error in db to save new comment"}});
		}else{
      
      if(product_commentdata.type=="product"){
      	updateLatestProductComment(product_commentdata.prodle);
      }else{

      }
		///////////////////////////////////
		_successfulAddComment(self,product_commentdata);
		/////////////////////////////////
				
		}
	})
}
var _successfulAddComment=function(self,newcomment){
	logger.emit("log","successfulAddComment");
	self.emit("successfulAddComment",{"success":{"message":"Gave comment to product sucessfully","product_comment":newcomment}})
}
Comment.prototype.deleteComment = function(sessionuserid,commentid) {
	var self=this;

    /////////////////////////////////////////////////////////////
	_isAuhorizedUserToDeleteComment(self,sessionuserid,commentid);
	/////////////////////////////////////////////////////////////
	
};
var _isAuhorizedUserToDeleteComment=function(self,sessionuserid,commentid){
  CommentModel.findOne({commentid:commentid},{user:1},function(err,comment){
  	if(err){
  		self.emit("failedCommentDeletion",{"error":{"code":"ED001","message":"Error in db to find Comment"}});
  	}else if(comment){

  		 if(comment.user.userid!=sessionuserid){
  		 		self.emit("failedCommentDeletion",{"error":{"code":"EA001","message":"You are not authorize to delete this comment"}});	
  		 }else{
  		 	 //////////////////////////
        _deleteComment(self,commentid);
				/////////////////////////
			}
		}else{
  		self.emit("failedCommentDeletion",{"error":{"code":"AC001","message":"comment id is wrong"}});
  	}
  })

}
var _deleteComment=function(self,commentid){
	var commentdata={status:"deactive",dateremoved:new Date()};
	
  CommentModel.findAndModify({commentid:commentid},[],{$set:commentdata},{new:false},function(err,comment){
		if(err){
			self.emit("failedCommentDeletion",{"error":{"code":"ED001","message":"Error in db to delete comment"}});
		}else if(!comment){
			self.emit("failedCommentDeletion",{"error":{"code":"AC001","message":"Provided commentid is wrong"}});
		}else{
  
			if(comment.type="product"){
       updateLatestProductComment(comment.prodle);
			}else{
       //updateLatestWarrantyComment
			}
			/////////////////////////////
			_successfulCommentDeletion(self);
			////////////////////////////
		}
	})
}
var _successfulCommentDeletion = function(self) {
		//validate the user data
		logger.emit("log","_successfulCommentDeletion");
  	self.emit("successfulCommentDeletion", {"success":{"message":"Comment Deleted Successfully"}});
	}
