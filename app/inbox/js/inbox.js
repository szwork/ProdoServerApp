var InboxModel=require("./inbox-model")
var logger=require("../../common/js/logger");
var events = require("events");
var UserModel=require("../../user/js/user-model")

var Inbox = function(inboxdata) {
	this.inbox = inboxdata;
};


Inbox.prototype = new events.EventEmitter;
module.exports = Inbox
;
Inbox.prototype.getMyLatestInbox=function(sessionuserid,messagetype){
	var self=this;
	if(["normal","testimonial","enquiry"].indexOf(messagetype)<0){
		self.emit("failedGetMyLatestInbox",{error:{code:"AV001",message:"messagetype should be normal,enquiry,testimonial"}})
	}else{
	  ///////////////////////////////////////////
	  _getMyLatestInbox(self,sessionuserid,messagetype)
	 ///////////////////////////////////////////	
	}
	
}
var _getMyLatestInbox=function(self,sessionuserid,messagetype){
	var query=InboxModel.find({userid:sessionuserid,messagetype:messagetype}).sort({createdate:-1}).limit(10).lean()
	query.exec(function(err,inbox){
		if(err){
			self.emit("failedGetMyLatestInbox",{error:{code:"ED001",message:"Database Issue"}})
		}else if(inbox.length==0){
			self.emit("failedGetMyLatestInbox",{error:{message:"No "+messagetype+" message exists"}})
		}else{
			////////////////////////////////////////////////////////
			_successfullMyLatestInbox(self,inbox)
			///////////////////////////////////////////////////////
		}
	})
}
var _successfullMyLatestInbox=function(self,inbox){
	self.emit("successfulGetMyLatestInbox",{success:{message:"Getting Inbox Successfully",inbox:inbox}})
}
Inbox.prototype.loadMoreInboxMessages=function(sessionuserid,messageid){
	var self=this;
	///////////////////////////////////////////
	_loadMoreInboxMessage(self,sessionuserid,messageid)
	///////////////////////////////////////////
}
var _loadMoreInboxMessage=function(self,sessionuserid,messageid){
	InboxModel.findOne({userid:sessionuserid,messageid:messageid},function(err,inbox){
		if(err){
			self.emit("failedLoadMoreInboxMessages",{error:{code:"ED001",message:"Database Issue"}})
		}else if(!inbox){
			self.emit("failedLoadMoreInboxMessages",{error:{"message":"inboxd is wrong or not exiss"}})
		}else{
			var query=InboxModel.find({messagetype:inbox.messagetype,userid:sessionuserid,messageid:{$ne:messageid},createdate:{$lte:inbox.createdate}}).sort({createdate:-1}).limit(10).lean()
	        query.exec(function(err,inbox){
				if(err){
					self.emit("failedLoadMoreInboxMessages",{error:{code:"ED001",message:"Database Issue"}})
				}else if(inbox.length==0){
					self.emit("failedLoadMoreInboxMessages",{error:{message:"No More Message(s)"}})
				}else{
					////////////////////////////////////////////////////////
					_successfullLoadMoreInboxMessage(self,inbox)
					///////////////////////////////////////////////////////
				}
			})
		}
	})
	
}
var _successfullLoadMoreInboxMessage=function(self,inbox){
	self.emit("successfulLoadMoreInboxMessages",{success:{message:"next message",inbox:inbox}})
}
Inbox.prototype.inboxAction=function(sessionuserd,messageid,action){
	var self=this;
	// console.log("action"+action)
	if(action==undefined){
		self.emit("failedInboxAction",{error:{code:"AV001",message:"Please pass action"}})
	}else if(["read","delete"].indexOf(action)<0){
		self.emit("failedInboxAction",{error:{code:"AV001",message:"action should be read or delete"}})
	}else{
		/////////////////////////////////////////////////
	_validateInboxAction(self,sessionuserd,messageid,action)
	///////////////////////////////////////////////	
	}
	
}
var _validateInboxAction=function(self,sessionuserid,messageid,action){
	UserModel.findOne({userid:sessionuserid},{userid:1},function(err,user){
		if(err){
			self.emit("failedInboxAction",{error:{code:"ED001",message:"Database Issue"}})
		}else if(!user){
			self.emit("failedInboxAction",{error:{message:"user not exists"}})
		}else{
			InboxModel.findOne({userid:sessionuserid,messageid:messageid,status:{$ne:"deactive"}},function(err,inbox){
				if(err){
					self.emit("failedInboxAction",{error:{code:"ED001",message:"Database Issue"}})
				}else if(!inbox){
					self.emit("failedInboxAction",{error:{"message":"messageid is wrong or not exiss"}})
				}else{
					if(action=="read"){
						if(action==inbox.status){
							self.emit("failedInboxAction",{error:{"message":"You have already read the message"}})
						}else{
							//////////////////////////////////////
							_performInboxAction(self,messageid,"read")
							/////////////////////////////////////
						}
					}else{
						////////////////////////////////////////////
							//////////////////////////////////////
							_performInboxAction(self,messageid,"deactive")
							/////////////////////////////////////
						/////////////////////////////////////
					}
				}
			})
		}
	})
}
var _performInboxAction=function(self,messageid,status){
	InboxModel.update({messageid:messageid},{$set:{status:status}},function(err,inboxstatus){
		if(err){
			self.emit("failedInboxAction",{error:{code:"ED001",message:"Database Issue"}})
		}else if(inboxstatus==0){
			self.emit("failedInboxAction",{error:{message:"inbox id is wrong"}})
		}else{
			//////////////////////////////
			_successfullPerformAction(self,status)
			///////////////////////////////
		}
	})
}
var _successfullPerformAction=function(self,status){
	self.emit("successfulInboxAction",{success:{message:"Successfully update the inbox status",status:status}})
}
Inbox.prototype.replyToInboxMessage=function(sessionuserd,messageid,replytext){
	var self=this;
	// console.log("action"+action)
	if(replytext==undefined ||replytext==""){
		self.emit("failedReplyToInboxMessage",{error:{code:"AV001",message:"Please pass replytext"}})
	}else{
		///////////////////////////////////////////////////////////
		_checkInbixIdIsWrong(self,sessionuserd,messageid,replytext)
		///////////////////////////////////////////////////////////
	}
	
}
var _checkInbixIdIsWrong=function(self,sessionuserid,messageid,replytext){
	UserModel.findOne({userid:sessionuserid},function(err,user){
		if(err){
			self.emit("failedReplyToInboxMessage",{error:{code:"ED001",message:"Database Issue"}})
		}else if(!user){
			self.emit("failedReplyToInboxMessage",{error:{message:"user not exists"}})
		}else{
			InboxModel.findOne({userid:sessionuserid,messageid:messageid,status:{$ne:"deactive"}},function(err,inbox){
				if(err){
					self.emit("failedReplyToInboxMessage",{error:{code:"ED001",message:"Database Issue"}})
				}else if(!inbox){
					self.emit("failedReplyToInboxMessage",{error:{"message":"messageid is wrong or not exiss"}})
				}else{
					/////////////////////////
					_replyToInboxMessage(self,inbox,replytext,user)
					///////////////////////////////////
					
				}
			})
		}
	})
}
var _replyToInboxMessage=function(self,inbox,replytext,user){
  var newinbox={parentid:inbox.messageid,userid:inbox.from.userid,from:{email:user.email,userid:user.userid,username:user.username},body:replytext,subject:inbox.subject}
	var new_inbox=new InboxModel(newinbox);
	new_inbox.save(function(err,inbox_data){
		if(err){
			self.emit("failedReplyToInboxMessage",{error:{code:"ED001",message:"Database Issue"}})
		}else{
			///////////////////////////////////
			_successfullReplyToInboxMessage(self)
			///////////////////////////////
		}
	})
}
var _successfullReplyToInboxMessage=function(self){
	self.emit("successfulReplyToInboxMessage",{success:{message:"Successfully gave reply to the message"}})
}
Inbox.prototype.getMessagetypewisecount=function(sessionuserid,messagetype){
	var self=this;
	
	  ///////////////////////////////////////////
	  _getMessagetypewisecount(self,sessionuserid)
	 ///////////////////////////////////////////	
}
var _getMessagetypewisecount=function(self,sessionuserid){
	InboxModel.aggregate({$match:{userid:sessionuserid}},{$group:{_id:"$messagetype",messagecount:{$sum:1}}},{$project:{messagetype:"$_id",messagecount:1,_id:0}},function(err,messagecount){
		if(err){
			self.emit("failedGetMessagetypewisecount",{error:{code:"ED001",message:"Database Issue"}})
		}else if(messagecount.length==0){
			self.emit("failedGetMessagetypewisecount",{error:{message:"No message exists"}})
		}else{
			////////////////////////////
			_successfullGetMessageTypewisecount(self,messagecount);
			///////////////////////////
		}
	})
}
var _successfullGetMessageTypewisecount=function(self,messagetypewisecount){
	self.emit("successfulGetMessageTypewisecount",{success:{message:"Getting messagetype wise count successfully",messagetypewisecount:messagetypewisecount}})
}