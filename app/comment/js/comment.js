

var CommentModel=require("./comment-model");
var ProductModel=require("../../product/js/product-model");
var ProductCampaignModel=require("../../productcampaign/js/product-campaign-model");
var FeatureAnalyticsModel = require("../../featureanalytics/js/feature-analytics-model");
var CampaignAnalyticsModel = require("../../featureanalytics/js/campaign-analytics-model");
var TrendingModel = require("../../featuretrending/js/feature-trending-model");
var CampaignTrendModel = require("../../featuretrending/js/campaign-trending-model");
var events = require("events");
var shortId = require('shortid');
var logger=require("../../common/js/logger");
var generateId = require('time-uuid');
var AWS = require('aws-sdk');
var fs=require("fs");
var path=require("path");
var exec = require('child_process').exec;
var CONFIG = require('config').Prodonus;
var amazonbucket=CONFIG.amazonbucket;
var AgreeDisagreeComment=require("../../agreedisagreecomment/js/agreedisagree-comment-model")
var TagReferenceDictionary = require("../../tagreffdictionary/js/tagreffdictionary-model");
AWS.config.update({accessKeyId:'AKIAJOGXRBMWHVXPSC7Q', secretAccessKey:'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'});
AWS.config.update({region:'ap-southeast-1'});
var s3bucket = new AWS.S3();
var updateLatestProductComment=function(prodle){
	CommentModel.find({type:"product",status:"active",prodle:prodle},{prodle:0}).sort({datecreated:-1}).limit(5).lean().exec(function(err,comment){
		if(err){
			logger.emit("log","Error in updation latest 5 product comment");
		}else {
			var comment_array;
			if(comment.length==0){
				comment_array=[];
			}else{
				comment_array=comment;
			}
			ProductModel.update({prodle:prodle},{$set:{product_comments:comment_array}},function(err,latestupatestatus){
				if(err){
					logger.emit("error","Error in updation latest 5 product comment");
				}else if(latestupatestatus==1){
					logger.emit("log","Latest 5 product comments updated");
					// updateLatestProductCommentCount(prodle);
				}else{
					logger.emit("error","Given product id is wrong to update latest 5 comments");
				}
			})
		}
	})
}

var updateLatestCampaignComment=function(campaign_id){
	console.log("updateLatestCampaignComment");
	CommentModel.find({type:"campaign",status:"active",campaign_id:campaign_id},{campaign_id:0}).sort({datecreated:-1}).limit(5).lean().exec(function(err,comment){
		if(err){
			logger.emit("log","Error in updation latest 5 campaign comment");
		}else {
			var comment_array;
			if(comment.length==0){
				comment_array=[];
			}else{
				comment_array=comment;
			}
			ProductCampaignModel.update({campaign_id:campaign_id},{$set:{campaign_comments:comment_array}},function(err,latestupatestatus){
				if(err){
					logger.emit("error","Error in updation latest 5 campaign comment");
				}else if(latestupatestatus==1){
					logger.emit("log","Latest 5 campaign comments updated");
				}else{
					logger.emit("error","Given campaign id is wrong to update latest 5 comments");
				}
			})
		}
	})
}

var updateLatestProductCommentCount=function(prodle){
	var TrendingModel = require("../../featuretrending/js/feature-trending-model");
	TrendingModel.findOne({prodle:prodle},function(err,trenddata){
		if(err){
			logger.emit("log","Error in updation latest comment count");
		}else if(!trenddata){
			ProductModel.findOne({prodle:prodle},{prodle:1,orgid:1,name:1,_id:0}).exec(function(err,productdata){
				if(err){
					logger.emit({"error":{"code":"ED001","message":"Error in db to get product"}});
				}else if(!productdata){
					logger.emit({"error":{"message":"prodle is wrong"}});
				}else{
					var trend={prodle:prodle,commentcount:1,followedcount:0,name:productdata.name,orgid:productdata.orgid};
					var trend_data = new TrendingModel(trend);
					trend_data.save(function(err,analyticsdata){
		            	if(err){
		               	 	console.log("Error in db to save trending data" + err);
		            	}else{
		                	console.log("Trending for Latest comment added sucessfully" + analyticsdata);
		            	}
		        	})
				}
			});            
		}else{
        	TrendingModel.update({prodle:prodle},{$inc:{commentcount:1}},function(err,latestupatestatus){
				if(err){
					logger.emit("error","Error in updation latest comment count");
				}else if(latestupatestatus==1){
					logger.emit("log","Latest comment count for products updated");
				}else{
					logger.emit("error","Given product id is wrong to update latest comment count");
				}
			})
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
	// }else if(commentdata.analytics.featureid==undefined){
	// 	self.emit("failedAddComment",{"error":{"code":"AV001","message":"Please pass featureid in analytics"}});			
	}else  if(commentdata.commentcategory==undefined || commentdata.commentcategory=="") {
		self.emit("failedAddComment",{"error":{"code":"AV001","message":"Please pass comment category"}});			
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
				    bucketFolder=amazonbucket+"/org/"+product.orgid+"/product"+product.prodle+"/comment";
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

	var tags_array=[];
	var analytics_array = [];
	if(commentdata.analytics.length>0){
		for(var i=0;i<commentdata.analytics.length;i++){
			if(commentdata.analytics[i].tag!=undefined){
				tags_array.push(commentdata.analytics[i].tag);
				analytics_array.push(commentdata.analytics[i]);
			}
		}
	}

	commentdata.tags=tags_array;
	commentdata.featureanalytics=analytics_array;
	var comment_data=new CommentModel(commentdata);	

	comment_data.save(function(err,product_commentdata){
		if(err){
			self.emit("failedAddComment",{"error":{"code":"ED001","message":"Error in db to save new comment"}});
		}else{
      
      	if(product_commentdata.type=="product"){
      		// updateLatestProductComment(product_commentdata.prodle);
      	}else{
      		//updateLatestWarrantyComment(product_commentdata.prodle);
      	}
  		// product_commentdata.status=undefined;
    	// 	product_commentdata.prodle=undefined;
		// ///////////////////////////////////		
		_successfulAddComment(self,product_commentdata);
		_validateFeatureAnalytics(prodle,commentdata);		
		/////////////////////////////////
		}
	})
}

var _validateFeatureAnalytics = function(prodle,commentdata){
	    // if()
	    if(commentdata.analytics==undefined){
	    	console.log("analytics does not exists");
	    }else{
		     if(commentdata.analytics.length>0){
	             var initialvalue=0;            
	            _addFeatureAnalytics(prodle,commentdata.analytics,commentdata.user.userid,initialvalue);            
	        }else{
	            console.log("Please pass analytics data");
	        }
	    }
        console.log("_validateFeatureAnalytics");
        // var analytics = commentdata.analytics;
       
}

var _addFeatureAnalytics = function(prodle,analyticsdata,userid,initialvalue){
	var analytics=analyticsdata[initialvalue];
	if(analyticsdata.length>initialvalue){
		FeatureAnalyticsModel.findOne({prodle:prodle,featurename:analytics.featurename}).lean().exec(function(err,analyticsresult){
	        if(err){
	            logger.emit("failedAddFeatureAnalytics",{"error":{"code":"ED001","message":" Error in db to find feature id err message: "+err}})
	        }else if(!analyticsresult){
	            console.log("calling to add new analytics with prodle and featurename");
	            _addNewFeatureAnalytics(prodle,analytics,userid,initialvalue,analyticsdata);
	        }else{
	            console.log("calling to update analytics");
	            _updateFeatureAnalytics(prodle,analytics,userid,initialvalue,analyticsdata);
	        }
    	});
	}else{
       console.log("all feature analytics done");
	}
}

var _addNewFeatureAnalytics = function(prodle,analytics,userid,initialvalue,analyticsdata){
	console.log("_addNewFeatureAnalytics");
	// var feature_analytics_object={prodle:prodle,featureid:analytics.featureid};
	TagReferenceDictionary.findOne({tagname:analytics.tag},{tagid:1}).lean().exec(function(err,tagdata){
		if(err){
            console.log("Error in db to find feature id err message: " + err);
        }else if(!tagdata){
            console.log("Tag name does not exist to get tagid");
        }else{
        	analytics.prodle = prodle;
            analytics.analytics = [{tagid:tagdata.tagid,tagname:analytics.tag,userid:userid,datecreated:new Date()}];
            var analytics_data = new FeatureAnalyticsModel(analytics);
        	analytics_data.save(function(err,analyticsresult){
            	if(err){
               	 	console.log("Error in db to save feature analytics" + err);
            	}else{
                	console.log("Feature analytics added sucessfully" + analyticsresult);
            	}
            	/////////////////////////////////////////////////////////////////////////////////////////
            	_addFeatureAnalytics(prodle,analyticsdata,userid,++initialvalue);
            	/////////////////////////////////////////////////////////////////////////////////
        	})
        }
	});        
}


var _updateFeatureAnalytics = function(prodle,analytics,userid,initialvalue,analyticsdata){
    console.log("_updateFeatureAnalytics");
    //checking tagid and tagname exist
    var query = {prodle:prodle,featurename:analytics.featurename};
    TagReferenceDictionary.findOne({tagname:analytics.tag},{tagid:1,tagname:1}).lean().exec(function(err,tagdata){
		if(err){
            console.log("Error in db to find feature id err message: " + err);
        }else if(!tagdata){
            console.log("Tag name does not exist to get tagid");
        }else{		    
		    FeatureAnalyticsModel.update(query,{$push:{analytics:{tagid:tagdata.tagid,tagname:tagdata.tagname,userid:userid,datecreated:new Date()}}},function(err,analyticsupdatedata){
	            if(err){
	                console.log("Error in db to update count err message: " + err);
	            }else if(!analyticsupdatedata){
	                console.log("Feature analytics not updated");
	            }else{
	                console.log("Feature analytics updated sucessfully analytics_data : " + analyticsupdatedata);
	                // _successfulAddComment(self,analyticsdata);
	            }
	            /////////////////////////////////////////////////////////////////////////////////////////
            	_addFeatureAnalytics(prodle,analyticsdata,userid,++initialvalue);
            	/////////////////////////////////////////////////////////////////////////////////
	        });
		}
	})	
}


var _successfulAddComment=function(self,newcomment){
	updateLatestProductCommentCount(newcomment.prodle);
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
  CommentModel.findOne({commentid:commentid,status:"active"},{user:1},function(err,comment){
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
  		self.emit("failedCommentDeletion",{"error":{"code":"AC001","message":"Comment already deleted"}});
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
       			// updateLatestProductComment(comment.prodle);
			}else{
       			//updateLatestWarrantyComment
			}
			/////////////////////////////
			_successfulCommentDeletion(self,comment.prodle);
			_validateDeleteFeatureAnalytics(comment.prodle,comment);
			////////////////////////////
		}
	})
}

var _successfulCommentDeletion = function(self,prodle) {
		//validate the user data
	updateLatestProductCommentDecCount(prodle);
	logger.emit("log","_successfulCommentDeletion");
  	self.emit("successfulCommentDeletion", {"success":{"message":"Comment Deleted Successfully"}});
}

var _validateDeleteFeatureAnalytics = function(prodle,commentdata){
        console.log("_validateDeleteFeatureAnalytics");
        // var analytics = commentdata.analytics;
        if(commentdata.featureanalytics==undefined){
        	console.log("featureanalytics is undefined")
        }else{
        	if(commentdata.featureanalytics.length>0){
            	var initialvalue=0;            
            	_deleteFeatureAnalytics(prodle,commentdata.featureanalytics,commentdata.user.userid,initialvalue);
        	}else{
            	console.log("Please pass featureanalytics data");
        	}
        }
       
}

var _deleteFeatureAnalytics = function(prodle,analyticsdata,userid,initialvalue){
	var analytics=analyticsdata[initialvalue];
	console.log("analytics : "+analytics+" analyticsdata : "+JSON.stringify(analyticsdata)+" initialvalue : "+initialvalue);
	if(analyticsdata.length>initialvalue){//,"analytics.userid":userid,"analytics.tagname":analytics.tag
		FeatureAnalyticsModel.update({prodle:prodle,featurename:analytics.featurename,analytics:{$elemMatch:{tagname:analytics.tag,userid:userid}}},{$set:{"analytics.$.commentavailable":false}}).lean().exec(function(err,updatestatus){
	        if(err){
	            logger.emit("error","Error in deletion of featureanalytics");
	        }else if(updatestatus == 1){
	            logger.emit("log","featureanalytics deleted sucessfully");
	        }else{
	        	logger.emit("error","Given commentdata is wrong to delete featureanalytics");
	        }
    	});
    	_deleteFeatureAnalytics(prodle,analyticsdata,userid,++initialvalue);
	}else{
       logger.emit("log","all featureanalytics deletion is done");
	}
}

var updateLatestProductCommentDecCount = function(prodle){
	
    TrendingModel.update({prodle:prodle},{$inc:{commentcount:-1}},function(err,latestupatestatus){
		if(err){
			logger.emit("error","Error in updation latest comment count");
		}else if(latestupatestatus==1){
			logger.emit("log","Latest comment count(Decrement) for products updated");
		}else{
			logger.emit("error","Given product id is wrong to update latest comment count");
		}
	})	
}

Comment.prototype.deleteCampaignComment = function(sessionuserid,commentid) {
	var self=this;
    /////////////////////////////////////////////////////////////
	_isAuhorizedUserToDeleteCampaignComment(self,sessionuserid,commentid);
	/////////////////////////////////////////////////////////////	
};

var _isAuhorizedUserToDeleteCampaignComment = function(self,sessionuserid,commentid){
  CommentModel.findOne({commentid:commentid,status:"active"},{user:1},function(err,comment){
  	if(err){
  		self.emit("failedCampaignCommentDeletion",{"error":{"code":"ED001","message":"Error in db to find Comment"}});
  	}else if(comment){
  		if(comment.user.userid!=sessionuserid){
  		 	self.emit("failedCampaignCommentDeletion",{"error":{"code":"EA001","message":"You are not authorize to delete this comment"}});	
  		}else{
  		 	//////////////////////////////
        	_deleteCampaignComment(self,commentid);
		    /////////////////////////////
		}
	}else{
  		self.emit("failedCampaignCommentDeletion",{"error":{"code":"AC001","message":"Comment already deleted"}});
  	}
  })
}

var _deleteCampaignComment=function(self,commentid){
	var commentdata={status:"deactive",dateremoved:new Date()};	
  	CommentModel.findAndModify({commentid:commentid},[],{$set:commentdata},{new:false},function(err,comment){
		if(err){
			self.emit("failedCampaignCommentDeletion",{"error":{"code":"ED001","message":"Error in db to delete comment"}});
		}else if(!comment){
			self.emit("failedCampaignCommentDeletion",{"error":{"code":"AC001","message":"Provided commentid is wrong"}});
		}else{  
			if(comment.type="campaign"){
				// updateLatestCampaignComment(comment.campaign_id);
       			// updateLatestProductComment(comment.prodle);
			}else{
       			//updateLatestWarrantyComment
			}
			/////////////////////////////
			_successfulCampaignCommentDeletion(self,comment.prodle,comment.campaign_id);
			_validateDeleteCampaignCommentFeatureAnalytics(comment.prodle,comment);
			////////////////////////////
		}
	})
}

var _successfulCampaignCommentDeletion = function(self,prodle,campaign_id) {
		//validate the user data
	updateLatestCampaignCommentDecCount(prodle,campaign_id);
	logger.emit("log","_successfulCampaignCommentDeletion");
  	self.emit("successfulCampaignCommentDeletion", {"success":{"message":"Comment Deleted Successfully"}});
}

var _validateDeleteCampaignCommentFeatureAnalytics = function(prodle,commentdata){
        console.log("_validateDeleteCampaignCommentFeatureAnalytics");
        // var analytics = commentdata.analytics;
        if(commentdata.featureanalytics==undefined){
        	console.log("featureanalytics is undefined");
        }else{
        	console.log("commentdata ### :"+JSON.stringify(commentdata));
        	console.log("commentdata.featureanalytics : ### :"+JSON.stringify(commentdata.featureanalytics));
        	if(commentdata.featureanalytics.length>0){
            	var initialvalue=0;            
            	_deleteCampaignCommentFeatureAnalytics(prodle,commentdata.featureanalytics,commentdata.user.userid,initialvalue);
        	}else{
            	console.log("Please pass campaign comment featureanalytics data");
        	}
        }
       
}

var _deleteCampaignCommentFeatureAnalytics = function(prodle,analyticsdata,userid,initialvalue){
	var analytics=analyticsdata[initialvalue];
	console.log("analytics : "+analytics+" analyticsdata : "+JSON.stringify(analyticsdata)+" initialvalue : "+initialvalue);
	if(analyticsdata.length>initialvalue){//,"analytics.userid":userid,"analytics.tagname":analytics.tag
		CampaignAnalyticsModel.update({prodle:prodle,featurename:analytics.featurename,analytics:{$elemMatch:{tagname:analytics.tag,userid:userid}}},{$set:{"analytics.$.commentavailable":false}}).lean().exec(function(err,updatestatus){
	        if(err){
	            logger.emit("error","Error in deletion of campaign featureanalytics");
	        }else if(updatestatus == 1){
	            logger.emit("log","campaign comment featureanalytics deleted sucessfully");
	        }else{
	        	logger.emit("error","Given campaign commentdata is wrong to delete featureanalytics");
	        }
    	});
    	_deleteCampaignCommentFeatureAnalytics(prodle,analyticsdata,userid,++initialvalue);
	}else{
       logger.emit("log","all campaign comment featureanalytics deletion is done");
	}
}

var updateLatestCampaignCommentDecCount = function(prodle,campaign_id){
	console.log("prodle : "+prodle+" campaign_id : "+campaign_id);
    CampaignTrendModel.update({prodle:prodle,campaign_id:campaign_id},{$inc:{commentcount:-1}},function(err,latestupatestatus){
		if(err){
			logger.emit("error","Error in updation latest comment count");
		}else if(latestupatestatus==1){
			logger.emit("log","Latest comment count(Decrement) for campaign updated");
		}else{
			logger.emit("error","Given product id or campaignid is wrong to update latest comment count");
		}
	})	
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
			var query=CommentModel.find({prodle:comment.prodle,status:"active",type:"product",datecreated:{$lt:comment.datecreated}},{_id:0,status:0,type:0}).sort({datecreated:-1}).limit(10);
			query.exec(function(err,nextcomments){
				if(err){
					self.emit("failedLoadMoreComment",{"error":{"code":"ED001","message":"_loadMoreComment: Error in db to delete comment"+err}});
				}else if(nextcomments.length==0){
					self.emit("failedLoadMoreComment",{"error":{"code":"AC002","message":"No More Comment(s)"}});
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

Comment.prototype.loadMoreCampaignComment = function(sessionuserid,commentid) {
	var self=this;
    ///////////////////////////////////////////////////////
    _loadMoreCampaignComment(self,sessionuserid,commentid);
    ///////////////////////////////////////////////////////
};

var _loadMoreCampaignComment=function(self,sessionuserid,commentid){
	CommentModel.findOne({commentid:commentid,status:"active"},{campaign_id:1,commentid:1,datecreated:1},function(err,comment){
		if(err){
			self.emit("failedLoadMoreCampaignComment",{"error":{"code":"ED001","message":"_loadMoreCampaignComment:Error in db to get comment"+err}});
		}else if(!comment){
			self.emit("failedLoadMoreCampaignComment",{"error":{"code":"AC001","message":"Wrong commentid"}});
		}else{
			logger.emit("log",comment);
			var query=CommentModel.find({campaign_id:comment.campaign_id,type:"campaign",status:"active",datecreated:{$lt:comment.datecreated}},{_id:0,status:0}).sort({datecreated:-1}).limit(10);
			query.exec(function(err,nextcomments){
				if(err){
					self.emit("failedLoadMoreCampaignComment",{"error":{"code":"ED001","message":"_loadMoreCampaignComment: Error in db to get comment "+err}});
				}else if(nextcomments.length==0){
					self.emit("failedLoadMoreCampaignComment",{"error":{"code":"AC002","message":"No More Comment(s)"}});
				}else{
					///////////////////////////////////
					_successfulLoadMoreCampaignComment(self,nextcomments);
					//////////////////////////////////
				}
			})
		}
	})
}

var _successfulLoadMoreCampaignComment=function(self,nextcomments){
	logger.emit("log","_successfulLoadMoreCampaignComment");
	self.emit("successfulLoadMoreCampaignComment", {"success":{"message":"Next comments","comment":nextcomments}});
}

Comment.prototype.addCampaignComment=function(sessionuserid,prodle,campaign_id,__dirname){
	var self=this;
    //////////////////////////////////////////////////////////////////////////////
	_validateCampaignCommentData(self,sessionuserid,prodle,campaign_id,__dirname);
	//////////////////////////////////////////////////////////////////////////////
}

var _validateCampaignCommentData=function(self,sessionuserid,prodle,campaign_id,__dirname) {
	var commentdata=self.comment;
	console.log("commentdata ########## : "+JSON.stringify(commentdata));
	if(commentdata==undefined){
	   self.emit("failedAddCampaignComment",{"error":{"code":"AV001","message":"Please provide commentdata"}});	
	}else if(commentdata.user==undefined){
		self.emit("failedAddCampaignComment",{"error":{"code":"AV001","message":"Please provide user to commentdata"}});		
	}else if(commentdata.user.userid==undefined){
		self.emit("failedAddCampaignComment",{"error":{"code":"AV001","message":"Please provide userid with user object"}});		
	} else if(commentdata.commenttext==undefined){
		self.emit("failedAddCampaignComment",{"error":{"code":"AV001","message":"Please pass commenttext"}});			
	}else if(commentdata.commenttext.trim().length==0){
		self.emit("failedAddCampaignComment",{"error":{"code":"AV001","message":"Please enter commenttext"}});			
	}else if(commentdata.type==undefined){
		self.emit("failedAddCampaignComment",{"error":{"code":"AV001","message":"Please pass comment type"}});			
	}else if(commentdata.analytics==undefined){
		self.emit("failedAddCampaignComment",{"error":{"code":"AV001","message":"Please pass analytics"}});			
	// }else if(commentdata.analytics.featureid==undefined){
	// 	self.emit("failedAddCampaignComment",{"error":{"code":"AV001","message":"Please pass featureid in analytics"}});			
	}else{
		////////////////////////////////////////////////////////////////////////////////////////////////
		_isSessionUserToAddCampaignComment(self,sessionuserid,prodle,campaign_id,commentdata,__dirname);
		////////////////////////////////////////////////////////////////////////////////////////////////
	}
}

var _isSessionUserToAddCampaignComment=function(self,sessionuserid,prodle,campaign_id,commentdata,__dirname){
	if(sessionuserid!=commentdata.user.userid){
		self.emit("failedAddCampaignComment",{"error":{"code":"EA001","message":"Provided userid is not match with sessionuserid"}})
	}else{
		//////////////////////////////////////////////
		_isValidProdle(self,prodle,campaign_id,commentdata,__dirname);
		/////////////////////////////////////////////		
	}
}

var _isValidProdle=function(self,prodle,campaign_id,commentdata,__dirname){
	ProductModel.findOne({prodle:prodle},function(err,productdata){
		if(err){
			self.emit("failedAddCampaignComment",{"error":{"code":"ED001","message":" function:_isValidProdle \nError ind db to find product err message: "+err}})
		}else if(!productdata){
			self.emit("failedAddCampaignComment",{"error":{"code":"AP001","message":" Wrong prodle"}})
		}else{
			//////////////////////////////////////////////////////////////////////////////
			_isValidCampaignId(self,prodle,campaign_id,commentdata,productdata,__dirname);
			//////////////////////////////////////////////////////////////////////////////
		}
	})
}

var _isValidCampaignId=function(self,prodle,campaign_id,commentdata,productdata,__dirname){
	ProductCampaignModel.findOne({campaign_id:campaign_id},function(err,campaigndata){
		if(err){
			self.emit("failedAddCampaignComment",{"error":{"code":"ED001","message":" function:_isValidCampaignId \nError ind db to find product err message: "+err}});
		}else if(!campaigndata){
			self.emit("failedAddCampaignComment",{"error":{"code":"AP001","message":"Campaign id is wrong"}});
		}else{
			/////////////////////////////////////////////////////////////////////////////////////////////
			__checkCampaignCommentImageExists(self,prodle,campaign_id,commentdata,productdata,__dirname);
			/////////////////////////////////////////////////////////////////////////////////////////////
		}
	})
}

var __checkCampaignCommentImageExists=function(self,prodle,campaign_id,commentdata,product,__dirname){
	// commentdata.commentid=generateId();
	commentdata.status="active";
	commentdata.datecreated=new Date();
	commentdata.prodle=prodle;
	commentdata.campaign_id=campaign_id;
	if(commentdata.comment_image==undefined || commentdata.comment_image==""){
		/////////////////////////////////////////////////////////////////
        _addCampaignComment(self,prodle,campaign_id,commentdata,product);
		/////////////////////////////////////////////////////////////////
	}else{
		/////////////////////////////////////////////////////////////////////////////////
        _readCampaignCommentImage(self,prodle,campaign_id,commentdata,product,__dirname);
		/////////////////////////////////////////////////////////////////////////////////
	}

}

var _readCampaignCommentImage=function(self,prodle,campaign_id,commentdata,product,dirname){
	var file_name=commentdata.comment_image.filename;
  	var file_buffer=commentdata.comment_image.filebuffer;
   	// var file_length=commentdata.comment_image.filelength;  
  	var file_type=commentdata.comment_image.filetype;
/*
var commentdata={type:"product",comment_image:{filetype:filedata.type,filename:filedata.name,filebuffer:buffer},user:{userid:"ulksGOKEoS",fullname:"Sunil More",orgname:"Giant Leap Systems",grpname:"admin"},commenttext:"sssssssssssssssssssssssss"};
*/
	var ext = path.extname(fileName||'').split('.');
	ext=ext[ext.length - 1];
	if(file_name==undefined){
		self.emit("failedAddCampaignComment",{"error":{"message":"Please provide comment image file_name"}});
	}else if(file_buffer==undefined){
  		self.emit("failedAddCampaignComment",{"error":{"message":"Please provide comment image file_buffer"}});
	}else if(file_type==undefined){
		self.emit("failedAddCampaignComment",{"error":{"message":"Please provide comment image file_type"}});
	}else if(ext=="jpeg" || ext=="jpg" || ext=="png" || ext=="gif"){
		self.emit("failedAddCampaignComment",{"error":{"message":"You can add only image of type jpeg,jpg,gif,png"}});
	}else{
		var fileName = dirname + '/tmp/uploads/' + file_name;
		fs.open(fileName, 'a', 0755, function(err, fd) {
	    if (err) {
	      self.emit("failedAddCampaignComment",{"error":{"message":" function:_readCampaignCommentImage \nError in open image "+err}})
	    }else{	      
	      console.log("buffer size"+file_buffer.size);
	      console.log("file extension"+ext);
	      fs.write(fd, file_buffer, null, 'Binary', function(err, written, writebuffer) {
	        if(err){
	       		self.emit("failedAddCampaignComment",{"error":{"message":" function:_readCampaignCommentImage \nError in write image "+err}})   
	        }else{
				var s3filekey=Math.floor((Math.random()*1000)+1)+"."+ext;
				var bucketFolder;
				var params;
				bucketFolder=amazonbucket+"/org/"+product.orgid+"/product/"+product.prodle+"/campaign/"+campaign_id+"/comment";
		      	params = {
		            Bucket: bucketFolder,
		            Key: product.orgid+product.prodle+s3filekey,
		            Body: writebuffer,
		            //ACL: 'public-read-write',
		            ContentType: file_type
		        };
		        ////////////////////////////////////////
		        _campaignCommentImageUpload(self,prodle,campaign_id,commentdata,product,params);
		        //////////////////////////////////////
	     	}
	     })
	    }
	  })
	}
}

var _campaignCommentImageUpload=function(self,prodle,campaign_id,commentdata,product,awsparams){
	s3bucket.putObject(awsparams, function(err, data) {
	    if (err) {
	    	self.emit("failedAddCampaignComment",{"error":{"message":" function:_campaignCommentImageUpload \nError in s3buctke put object "+err}});
	    } else {
	    	logger.emit("log","filecomment  saved");
	      	var params1 = {Bucket: awsparams.Bucket, Key: awsparams.Key,Expires: 60*60*24*365};
	      	s3bucket.getSignedUrl('getObject',params1, function (err, url) {
	        	if(err){
	         	self.emit("failedAddCampaignComment",{"error":{"message":" function:_campaignCommentImageUpload \nError in s3aws getSignedUrl "+err}});
	        	}else{
	        		commentdata.comment_image=[{imageid:generateId(),image:url}];
	          		/////////////////////////////////////////////////////////////
	          		_addCampaignComment(self,prodle,campaign_id,commentdata,product);
	          		/////////////////////////////////////////////////////////////
		        }
	    	});
	    }
  	}) 
}

var _addCampaignComment=function(self,prodle,campaign_id,commentdata,product){
	var tags_array=[];
	if(commentdata.analytics.length>0){
		for(var i=0;i<commentdata.analytics.length;i++){
			if(commentdata.analytics[i].tag!=undefined){
				tags_array.push(commentdata.analytics[i].tag);
			}
		}
	}
	commentdata.tags=tags_array;

	var comment_data=new CommentModel(commentdata);

	comment_data.save(function(err,campaign_commentdata){
		if(err){
			self.emit("failedAddCampaignComment",{"error":{"code":"ED001","message":"Error in db to save new campaign comment"}});
		}else{      
	      	if(campaign_commentdata.type=="campaign"){
	      		// updateLatestCampaignComment(campaign_commentdata.campaign_id);
	      	}else{
	      		//updateLatestWarrantyComment(campaign_commentdata.prodle);
	      	}
	  		//campaign_commentdata.status=undefined;
	   		//campaign_commentdata.prodle=undefined;
			// ///////////////////////////////////		
			_successfulAddCampaignComment(self,campaign_commentdata);
			_validateCampaignCommentFeatureAnalytics(prodle,commentdata,product);		
			/////////////////////////////////
		}
	})
}

var _successfulAddCampaignComment=function(self,newcomment){
	updateCampaignTrendingForCommentCount(newcomment.prodle,newcomment.campaign_id);
	logger.emit("log","successfulAddCampaignComment");
	self.emit("successfulAddCampaignComment",{"success":{"message":"Gave comment to campaign sucessfully","campaign_comment":newcomment}});
}

var updateCampaignTrendingForCommentCount=function(prodle,campaign_id){	
	CampaignTrendModel.update({prodle:prodle,campaign_id:campaign_id},{$inc:{commentcount:1}},{upsert:true}).exec(function(err,latestupatestatus){
		if(err){
			logger.emit("error","Error in updation latest campaign comment count");
		}else if(latestupatestatus==1){
			logger.emit("log","Latest campaign comment count updated");
		}else{
			logger.emit("error","Given product id or campaign id is wrong to update latest campaign comment count");
		}
	});
}

var _validateCampaignCommentFeatureAnalytics = function(prodle,commentdata,product){
        console.log("_validateCampaignCommentFeatureAnalytics");
        // var analytics = commentdata.analytics;
        if(commentdata.analytics.length>0){
            console.log("analytics array " + commentdata.analytics);
            console.log("analytics array leangth " + commentdata.analytics.length);
            for(var i=0;i<commentdata.analytics.length;i++){
                console.log("analytics featureid" + commentdata.analytics[i].featureitad);
                console.log("analytics featurename" + commentdata.analytics[i].featurename);
                console.log("analytics tag" + commentdata.analytics[i].tag);
                _addCampaignCommentFeatureAnalytics(prodle,commentdata.campaign_id,commentdata.analytics[i],commentdata.user.userid,product);
            }
        }else{
            console.log("Please pass analytics data");
        }
}

var _addCampaignCommentFeatureAnalytics = function(prodle,campaign_id,analytics,userid,product){
    console.log("_addCampaignCommentFeatureAnalytics");
    console.log("CDA " + analytics);
    console.log("CDAFID " + analytics.featureid);
    CampaignAnalyticsModel.findOne({campaign_id:campaign_id,featurename:analytics.featurename}).lean().exec(function(err,analyticsdata){
        if(err){
          logger.emit("failedAddFeatureAnalytics",{"error":{"code":"ED001","message":" Error in db to find featurename err message: "+err}});
        }else if(!analyticsdata){
            console.log("calling to add new analytics with prodle and featureid");
            _addNewCampaignCommentFeatureAnalytics(prodle,campaign_id,analytics,userid,product);
        }else{
            console.log("calling to update analytics");
            _updateCampignCommentFeatureAnalytics(prodle,campaign_id,analytics,userid,product);
        }
    });
}

var _addNewCampaignCommentFeatureAnalytics = function(prodle,campaign_id,analytics,userid,product){
	console.log("_addNewCampaignCommentFeatureAnalytics");
	// var feature_analytics_object={prodle:prodle,featureid:analytics.featureid};
	TagReferenceDictionary.findOne({tagname:analytics.tag},{tagid:1}).lean().exec(function(err,tagdata){
		if(err){
            console.log("Error in db to find feature id err message: " + err);
        }else if(!tagdata){
            console.log("Tag name does not exist to get tagid");
        }else{
        	analytics.prodle = prodle;
        	analytics.campaign_id = campaign_id;
            analytics.analytics = [{tagid:tagdata.tagid,tagname:analytics.tag,userid:userid}];
            var analytics_data = new CampaignAnalyticsModel(analytics);
        	analytics_data.save(function(err,analyticsdata){
            	if(err){
               	 	console.log("Error in db to save feature analytics" + err);
            	}else{
                	console.log("Feature analytics added sucessfully" + analyticsdata);
            	}
        	})
        }
	});        
}

var _updateCampignCommentFeatureAnalytics = function(prodle,campaign_id,analytics,userid,product){
    console.log("_updateCampignCommentFeatureAnalytics");
    //checking tagid and tagname exist
    var query = {prodle:prodle,featureid:analytics.featureid};
    TagReferenceDictionary.findOne({tagname:analytics.tag},{tagid:1,tagname:1}).lean().exec(function(err,tagdata){
		if(err){
            console.log("Error in db to find feature id err message: " + err);
        }else if(!tagdata){
            console.log("Tag name does not exist to get tagid");
        }else{		    
		    CampaignAnalyticsModel.update(query,{$push:{analytics:{tagid:tagdata.tagid,tagname:tagdata.tagname,userid:userid}}},function(err,analyticsupdatedata){
	            if(err){
	                console.log("Error in db to update count err message: " + err);
	            }else if(!analyticsupdatedata){
	                console.log("Feature analytics not updated");
	            }else{
	                console.log("Feature analytics updated sucessfully analytics_data : " + analyticsupdatedata);
	                // _successfulAddComment(self,analyticsdata);
	            }
	        });
		}
	})	
}

Comment.prototype.agreeDisagreeComment=function(sessionuserid,commentid,action){
	var self=this;
	if(["agree","disagree"].indexOf(action)<0){
		self.emit("failedAgreeDisagreeComment",{"error":{"message":"Action Should be agree or disagree"}})
	}else{
		_isValidCommentId(self,sessionuserid,commentid,action)
  
	}
	console.log("test1");
	
	
}
var _isValidCommentId=function(self,sessionuserid,commentid,action){
	CommentModel.findOne({commentid:commentid},{commentid:1},function(err,comment){
		if(err){
			self.emit("failedAgreeDisagreeComment",{"error":{"code":"ED001","message":"Database Issue"}})
		}else if(!comment){
			self.emit("failedAgreeDisagreeComment",{"error":{"message":"Commentid is wrong or not exists"}})
		}else{
  //////////////////////////////////////////////////////////////////////////////
    _checkItIsAlreadyAgreedOrDisagreed(self,sessionuserid,commentid,action)
	//////////////////////////////////////////////////////////////////////////////	
		}
	})
}
var _checkItIsAlreadyAgreedOrDisagreed=function(self,sessionuserid,commentid,action){
 AgreeDisagreeComment.findOne({commentid:commentid},{commentid:1},function(err,agreedisagreecomment){
 	if(err){
 		self.emit("failedAgreeDisagreeComment",{"error":{"code":"ED001","message":"Database Issue"}})
 	}else if(!agreedisagreecomment){
 		console.log("test2");
 		//////////////////////////////////////////////////////////////
 		_addNewCommentDataToAgreeDisagree(self,sessionuserid,commentid,action)
 		//////////////////////////////////////////////////////////////
 	}else{
 		AgreeDisagreeComment.findOne({commentid:commentid},function(err,agreedisagree){
 			if(err){
 				self.emit("failedAgreeDisagreeComment",{"error":{"code":"ED001","message":"Database Issue"}})
 			}else if(!agreedisagree){
 					self.emit("failedAgreeDisagreeComment",{"error":{"message":"commentid is wrong"}});
 			}else{
 				if(action=="agree"){
 					if(agreedisagree.agreeduser.indexOf(sessionuserid)>=0){
 					  self.emit("failedAgreeDisagreeComment",{"error":{"message":"You have already agreed this comment"}});
	 				}else if(agreedisagree.disagreeduser.indexOf(sessionuserid)>=0){
	 					self.emit("failedAgreeDisagreeComment",{"error":{"message":"You can't Agree and Disagree with the same comment"}});
	 				}else{
	 						console.log("test2");
	 					///////////////////////////////////////////
	 					_agreeDisagreeComment(self,sessionuserid,commentid,action)
	 					//////////////////////////////////////////
	 				}
 				}else{
 					if(agreedisagree.disagreeduser.indexOf(sessionuserid)>=0){
 					  self.emit("failedAgreeDisagreeComment",{"error":{"message":"You have already disagreed this comment"}});
	 				}else if(agreedisagree.agreeduser.indexOf(sessionuserid)>=0){
	 					self.emit("failedAgreeDisagreeComment",{"error":{"message":"You can't Agree and Disagree with the same comment"}});
	 				}else{
	 						console.log("test3");
	 					///////////////////////////////////////////
	 					_agreeDisagreeComment(self,sessionuserid,commentid,action)
	 					//////////////////////////////////////////
	 				}
 				}
 				
 			}
 		})
 	}
 })
}
var _agreeDisagreeComment=function(self,sessionuserid,commentid,action){
	var condition;
	if(action=="agree"){
		condition={$push:{agreeduser:sessionuserid}}
	}else{
		condition={$push:{disagreeduser:sessionuserid}}
	}
	AgreeDisagreeComment.update({commentid:commentid},condition,function(err,agreedisagreestatus){
		if(err){
			self.emit("failedAgreeDisagreeComment",{"error":{"code":"ED001","message":"Database Issue"}})
		}else if(agreedisagreestatus==0){
			self.emit("failedAgreeDisagreeComment",{"error":{"message":"Comment id is wrong"}})
		}else{
			////////////////////////////////////////////
			_updateAgreeDisagreeCommentModel(self,commentid,action)
			////////////////////////////////////////////
				////////////////////////////////////////////////////////
			_successfullAgreeDisagreeComment(self,action)
			//////////////////////////////////////////////////////
		}
	})
}
var _addNewCommentDataToAgreeDisagree=function(self,sessionuserid,commentid,action){
	var agreedisagreedata;
	if(action=="agree"){
		agreedisagreedata={commentid:commentid,agreeduser:[sessionuserid]}
	}else{
		agreedisagreedata={commentid:commentid,disagreeduser:[sessionuserid]}
	}
	var agree_disagreecomment=new AgreeDisagreeComment(agreedisagreedata);
	agree_disagreecomment.save(function(err,agree_disagree_comment){
		if(err){
			self.emit("failedAgreeDisagreeComment",{"error":{"code":"ED001","message":"Database Issue"}})
		}else{
			////////////////////////////////////////////
			_updateAgreeDisagreeCommentModel(self,commentid,action)
			////////////////////////////////////////////
			////////////////////////////////////////////////////////
			_successfullAgreeDisagreeComment(self,action)
			//////////////////////////////////////////////////////
		}
	})
}
var _updateAgreeDisagreeCommentModel=function(self,commentid,action){
	var condition;
	console.log("commentid"+commentid)
	if(action=="agree"){
		condition={$inc:{agreecount:1}}
	}else{
		condition={$inc:{disagreecount:1}}
	}
	CommentModel.update({commentid:commentid},condition,function(err,commentagreedisagreestatus){
		if(err){
			logger.emit("error","Database Issue")
		}else if(commentagreedisagreestatus==0){
			logger.emit("error","Comment id is worng for _updateAgreeDisagreeCommentModel")
		}else{
			logger.emit("log","latest agreedcount and disagreed count updated");
		}
	})
}
var _successfullAgreeDisagreeComment=function(self,action){
	var result;
  if(action=="agree"){
  	result={success:{message:"Agree the comment Successfully"}}
  }else{
  	result={success:{message:"Disgree the comment Successfully"}}
  }
  self.emit("successfulAgreeDisagreeComment",result);
}

Comment.prototype.getUserInfoCommentedOnProduct=function(sessionuserid,prodle){
	var self=this;
    //////////////////////////////////////////////////////////
	_getUserInfoCommentedOnProduct(self,sessionuserid,prodle);
	//////////////////////////////////////////////////////////
}

var _getUserInfoCommentedOnProduct = function(self,sessionuserid,prodle){
	CommentModel.aggregate([{$match:{prodle:prodle}},{$group:{_id:{user:"$user"}}},{$project:{username:"$_id.user.username",userid:"$_id.user.userid",_id:0}}]).exec(function(err,userdata){
	  	if(err){
	  		self.emit("failedGetUserInfoCommentedOnProduct",{"error":{"code":"ED001","message":"Error in db to find userdata"}});
	  	}else if(userdata.length==0){
	  		self.emit("failedGetUserInfoCommentedOnProduct",{"error":{"code":"EA001","message":"prodle is wrong"}});	
	  	}else{
	  		_successfulGetUserInfoCommentedOnProduct(self,userdata);
	  	}
	});
}

var _successfulGetUserInfoCommentedOnProduct = function(self,userdata){
	logger.emit("log","successfulGetUserInfoCommentedOnProduct");
	self.emit("successfulGetUserInfoCommentedOnProduct",{"success":{"message":"Getting user details sucessfully","userdata":userdata}});

}