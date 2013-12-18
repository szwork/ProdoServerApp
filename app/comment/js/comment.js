

var CommentModel=require("./comment-model");
var ProductModel=require("../../product/js/product-model");
var events = require("events");
var shortId = require('shortid');
var logger=require("../../common/js/logger");
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
			var q = CommentModel.find({prodle:prodle,type:"product"},{_id:0,prodle:0}).sort({datecreated:-1}).limit(5);
			q.lean().exec(function(err, CommentModels) {
				if(err){
					self.emit("failedAddComment",{"error":{"code":"ED001","message":"Error in db to find Product Comment"}});
				}else if(CommentModels.length!=0){//there is no comment of product type
					ProductModel.update({prodle:prodle},{$set:{product_comments:CommentModels}},function(err,commentstatus){
						if(err)
						{						
						 	self.emit("failedAddComment",{"error":{"code":"ED001","message":"Error in db to give comment to product"}});
						}else if(commentstatus!=1){
							self.emit("failedAddComment",{"error":{"code":"AP001","message":"prodct id is wrong"}});
						}else{
							///////////////////////////////////
							_successfulAddComment(self,product_commentdata);
							/////////////////////////////////
						}
					})
				}else{//if there is no new product update comment
					///////////////////////////////////
					_successfulAddComment(self,product_commentdata);
					/////////////////////////////////
				}
  			})
		}
	})
}
var _successfulAddComment=function(self,newcomment){
	logger.emit("log","successfulAddComment");
	self.emit("successfulAddComment",{"success":{"message":"Gave comment to product sucessfully","product_comment":newcomment}})
}