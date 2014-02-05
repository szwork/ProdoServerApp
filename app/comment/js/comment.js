

var CommentModel=require("./comment-model");
var ProductModel=require("../../product/js/product-model");
var FeatureAnalyticsModel = require("../../featureanalytics/js/feature-analytics-model");
var events = require("events");
var shortId = require('shortid');
var logger=require("../../common/js/logger");
var generateId = require('time-uuid');
var AWS = require('aws-sdk');
var fs=require("fs");
var path=require("path");
var exec = require('child_process').exec;
AWS.config.update({accessKeyId:'AKIAJOGXRBMWHVXPSC7Q', secretAccessKey:'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'});
AWS.config.update({region:'ap-southeast-1'});
var s3bucket = new AWS.S3();
var updateLatestProductComment=function(prodle){
	CommentModel.find({type:"product",status:"active",prodle:prodle},{prodle:0}).sort({datecreated:-1}).limit(5).lean().exec(function(err,comment){
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
Comment.prototype.addComment=function(sessionuserid,prodle,__dirname){
	var self=this;
      ////////////////////////////////////
	_validateCommentData(self,sessionuserid,prodle,__dirname);
	//////////////////////////////////////
	
}
var _validateCommentData=function(self,sessionuserid,prodle,__dirname) {
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
	}else if(commentdata.type==undefined){
		self.emit("failedAddComment",{"error":{"code":"AV001","message":"Please pass comment type"}});			
	}else if(commentdata.analytics==undefined){
		self.emit("failedAddComment",{"error":{"code":"AV001","message":"Please pass analytics"}});			
	}else if(commentdata.analytics.featureid==undefined){
		self.emit("failedAddComment",{"error":{"code":"AV001","message":"Please pass featureid in analytics"}});			
	}else{
		///////////////////////////////////////////////////////
		_isSessionUserToComment(self,sessionuserid,prodle,commentdata,__dirname);
		///////////////////////////////////////////////////////
	}
}
var _isSessionUserToComment=function(self,sessionuserid,prodle,commentdata,__dirname){
	if(sessionuserid!=commentdata.user.userid){
		self.emit("failedAddComment",{"error":{"code":"EA001","message":"Provided userid is not match with sessionuserid"}})
	}else{

		//////////////////////////////////////////////
		_checkProdleIsValid(self,sessionuserid,prodle,commentdata,__dirname);
		/////////////////////////////////////////////
		
	}
}
var _checkProdleIsValid=function(self,sessionuserid,prodle,commentdata,__dirname){
	ProductModel.findOne({prodle:prodle},function(err,productdata){
		if(err){
			self.emit("failedAddComment",{"error":{"code":"ED001","message":" function:_checkProdleIsValid \nError ind db to find product err message: "+err}})
		}else if(!productdata){
			self.emit("failedAddComment",{"error":{"code":"AP001","message":" Wrong prodle"}})
		}else{
		///////////////////////////////////////////
		__checkCommentImageExists(self,prodle,commentdata,productdata,__dirname);
		///////////////////////////////////////////
		}
	})
}
var __checkCommentImageExists=function(self,prodle,commentdata,product,__dirname){
	// commentdata.commentid=generateId();
	commentdata.status="active";
	commentdata.datecreated=new Date();
	commentdata.prodle=prodle;

	if(commentdata.comment_image==undefined || commentdata.comment_image==""){
		//////////////////////////////
        _addComment(self,prodle,commentdata,product);
		///////////////////////////////
	}else{
		///////////////////////////////////
        _readCommentImage(self,prodle,commentdata,product,__dirname);
		//////////////////////////////////
	}

}
var _readCommentImage=function(self,prodle,commentdata,product,dirname){
	 var file_name=commentdata.comment_image.filename;
  	var file_buffer=commentdata.comment_image.filebuffer;
   // var file_length=commentdata.comment_image.filelength;  
  	var file_type=commentdata.comment_image.filetype;
//////////////////////

/*
var commentdata={type:"product",comment_image:{filetype:filedata.type,filename:filedata.name,filebuffer:buffer},user:{userid:"ulksGOKEoS",fullname:"Sunil More",orgname:"Giant Leap Systems",grpname:"admin"},commenttext:"sssssssssssssssssssssssss"};

*/////////////////////
	var ext = path.extname(fileName||'').split('.');
	ext=ext[ext.length - 1];
  if(file_name==undefined){
  	self.emit("failedAddComment",{"error":{"message":"Please provide comment image file_name"}});
  }else if(file_buffer==undefined){
  	self.emit("failedAddComment",{"error":{"message":"Please provide comment image file_buffer"}});
	}else if(file_type==undefined){
		self.emit("failedAddComment",{"error":{"message":"Please provide comment image file_type"}});
	}else if(ext=="jpeg" || ext=="jpg" || ext=="png" || ext=="gif"){
				self.emit("failedAddComment",{"error":{"message":"You can add only image of type jpeg,jpg,gif,png"}});
	}else{
			var fileName = dirname + '/tmp/uploads/' + file_name;
			fs.open(fileName, 'a', 0755, function(err, fd) {
	    if (err) {
	      self.emit("failedAddComment",{"error":{"message":" function:_readCommentImage \nError in open image "+err}})
	    }else{
	      
	      console.log("buffer size"+file_buffer.size);
	      console.log("file extension"+ext);
	      fs.write(fd, file_buffer, null, 'Binary', function(err, written, writebuffer) {
	        if(err){
	       		self.emit("failedAddComment",{"error":{"message":" function:_readCommentImage \nError in write image "+err}})   
	        }else{
						var s3filekey=Math.floor((Math.random()*1000)+1)+"."+ext;
				    var bucketFolder;
				    var params;
				    bucketFolder="prodonus/org/"+product.orgid+"/product"+product.prodle+"/comment";
		      	 params = {
		             Bucket: bucketFolder,
		             Key: product.orgid+product.prodle+s3filekey,
		             Body: writebuffer,
		             //ACL: 'public-read-write',
		             ContentType: file_type
		          };

		          ////////////////////////////////////////
		          _commentImageUpload(self,commentdata,product,params);
		          //////////////////////////////////////
	     		}
	     	})
	    }
	  })
	}
}
var _commentImageUpload=function(self,commentdata,product,awsparams){
	s3bucket.putObject(awsparams, function(err, data) {
    if (err) {
    	self.emit("failedAddComment",{"error":{"message":" function:_commentImageUpload \nError in s3buctke put object "+err}})     
    } else {
      logger.emit("log","filecomment  saved");
      var params1 = {Bucket: awsparams.Bucket, Key: awsparams.Key,Expires: 60*60*24*365};
      s3bucket.getSignedUrl('getObject',params1, function (err, url) {
        if(err){
         self.emit("failedAddComment",{"error":{"message":" function:_commentImageUpload \nError in s3aws getSignedUrl "+err}})     
        }else{
        	commentdata.comment_image=[{imageid:generateId(),image:url}];
          /////////////////////////////////////
          _addComment(self,product.prodle,commentdata,product);
          //////////////////////////////////
          
        }
      });
    }
  }) 
}
var _addComment=function(self,prodle,commentdata,product){
	var comment_data=new CommentModel(commentdata);
	comment_data.save(function(err,product_commentdata){
		if(err){
			self.emit("failedAddComment",{"error":{"code":"ED001","message":"Error in db to save new comment"}});
		}else{
      
      if(product_commentdata.type=="product"){
      	updateLatestProductComment(product_commentdata.prodle);
      }else{
      	//updateLatestWarrantyComment(product_commentdata.prodle);
      }
  		// product_commentdata.status=undefined;
    	// 	product_commentdata.prodle=undefined;
		// ///////////////////////////////////
		_addFeatureAnalytics(self,prodle,commentdata,product);
		_successfulAddComment(self,product_commentdata);
		/////////////////////////////////
				
		}
	})
}
var _addFeatureAnalytics = function(self,prodle,commentdata,product){
	FeatureAnalyticsModel.findOne({featureid:commentdata.analytics.featureid},function(err,analyticsdata){
		if(err){
			// logger.emit("failedAddComment",{"error":{"code":"ED001","message":" Error in db to find feature id err message: "+err}})
		}else if(!analyticsdata){
			// calling to add new analytics with prodle and featureid
			_addNewFeatureAnalytics(self,prodle,commentdata,product);
		}else{
			// calling to update analytics
			_updateFeatureAnalytics(self,prodle,commentdata,product);
		}
	})
}
var _addNewFeatureAnalytics = function(self,prodle,commentdata,product){
	var analytics_data = new FeatureAnalyticsModel(commentdata.analytics);
	commentdata.analytics.count = 1;
	analytics_data.save(function(err,analyticsdata){
		if(err){
			// logger.emit("failedAddComment",{"error":{"code":"ED001","message":"Error in db to save new comment"}});
		}else{      
			///////////////////////////////////
			_successfulAddComment(self,analyticsdata);
			/////////////////////////////////				
		}
	})
}

var _updateFeatureAnalytics = function(self,prodle,commentdata,product){
	//cheacking tagid and tagname exist
	String query = {$and:[{analytics.tagid:commentdata.analytics.tagid},{analytics.tagname:commentdata.analytics.tagname}]};
	FeatureAnalyticsModel.findOne(query,function(err,analyticsdata){
		if(err){
			// logger.emit("failedAddComment",{"error":{"code":"ED001","message":" Error in db to find feature id err message: "+err}})
		}else if(!analyticsdata){			
		}else{
			//increment count
			FeatureAnalyticsModel.update(query,{$inc:{analytics.count:1}},function(err,analyticsdata){
				if(err){
					// logger.emit("failedAddComment",{"error":{"code":"ED001","message":" Error in db to find feature id err message: "+err}})
				}else if(!analyticsdata){
				}else{
					_successfulAddComment(self,analyticsdata);
				}
			})
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
  		 	//////////////////////////////
        	_deleteComment(self,commentid);
		    /////////////////////////////
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
Comment.prototype.loadMoreComment = function(sessionuserid,commentid) {
	var self=this;

    ///////////////////////////////////////
    _loadMoreComment(self,sessionuserid,commentid);
};
var _loadMoreComment=function(self,sessionuserid,commentid){
	CommentModel.findOne({commentid:commentid,status:"active"},{prodle:1,commentid:1,datecreated:1},function(err,comment){
		if(err){
			self.emit("failedLoadMoreComment",{"error":{"code":"ED001","message":"_loadMoreComment:Error in db to get comment"+err}});
		}else if(!comment){
			self.emit("failedLoadMoreComment",{"error":{"code":"AC001","message":"Wrong commentid"}});
		}else{
			logger.emit("log",comment);
			var query=CommentModel.find({prodle:comment.prodle,status:"active",datecreated:{$lt:comment.datecreated}},{_id:0,status:0}).sort({datecreated:-1}).limit(10);
			query.exec(function(err,nextcomments){
				if(err){
					self.emit("failedLoadMoreComment",{"error":{"code":"ED001","message":"_loadMoreComment: Error in db to delete comment"+err}});
				}else if(nextcomments.length==0){
					self.emit("failedLoadMoreComment",{"error":{"code":"AC002","message":"There is no more next comment"}});
				}else{
					///////////////////////////////////
					_successfullLoadMoreComments(self,nextcomments);
					//////////////////////////////////
				}
			})
		}
	})
}
var _successfullLoadMoreComments=function(self,nextcomments){
	logger.emit("log","_successfullLoadMoreComments");
	self.emit("successfulLoadMoreComment", {"success":{"message":"Next comments","comment":nextcomments}});
}