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
Inbox.prototype.getMyLatestInbox=function(sessionuserid){
	var self=this;
	///////////////////////////////////////////
	_getMyLatestInbox(self,sessionuserid)
	///////////////////////////////////////////
}
var _getMyLatestInbox=function(self,sessionuserid){
	var query=InboxModel.find({userid:sessionuserid}).sort({createdate:-1}).limit(10).lean()
	query.exec(function(err,inbox){
		if(err){
			self.emit("failedGetMyLatestInbox",{error:{code:"ED001",message:"Database Issue"}})
		}else if(inbox.length==0){
			self.emit("failedGetMyLatestInbox",{error:{message:"No message exists"}})
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
Inbox.prototype.loadMoreInboxMessages=function(sessionuserid,inboxid){
	var self=this;
	///////////////////////////////////////////
	_loadMoreInboxMessage(self,sessionuserid,inboxid)
	///////////////////////////////////////////
}
var _loadMoreInboxMessage=function(self,sessionuserid,inboxid){
	InboxModel.findOne({userid:sessionuserid,inboxid:inboxid},function(err,inbox){
		if(err){
			self.emit("failedLoadMoreInboxMessages",{error:{code:"ED001",message:"Database Issue"}})
		}else if(!inbox){
			self.emit("failedLoadMoreInboxMessages",{error:{"message":"inboxd is wrong or not exiss"}})
		}else{
			var query=InboxModel.find({userid:sessionuserid,inboxid:{$ne:inboxid},createdate:{$lte:inbox.createdate}}).sort({createdate:-1}).limit(10).lean()
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
Inbox.prototype.inboxAction=function(sessionuserd,inboxid,action){
	var self=this;
	// console.log("action"+action)
	if(action==undefined){
		self.emit("failedInboxAction",{error:{code:"AV001",message:"Please pass action"}})
	}else if(["read","delete"].indexOf(action)<0){
		self.emit("failedInboxAction",{error:{code:"AV001",message:"action should be read or delete"}})
	}else{
		/////////////////////////////////////////////////
	_validateInboxAction(self,sessionuserd,inboxid,action)
	///////////////////////////////////////////////	
	}
	
}
var _validateInboxAction=function(self,sessionuserid,inboxid,action){
	UserModel.findOne({userid:sessionuserid},{userid:1},function(err,user){
		if(err){
			self.emit("failedInboxAction",{error:{code:"ED001",message:"Database Issue"}})
		}else if(!user){
			self.emit("failedInboxAction",{error:{message:"user not exists"}})
		}else{
			InboxModel.findOne({userid:sessionuserid,inboxid:inboxid,status:{$ne:"deactive"}},function(err,inbox){
				if(err){
					self.emit("failedInboxAction",{error:{code:"ED001",message:"Database Issue"}})
				}else if(!inbox){
					self.emit("failedInboxAction",{error:{"message":"inboxid is wrong or not exiss"}})
				}else{
					if(action=="read"){
						if(action==inbox.status){
							self.emit("failedInboxAction",{error:{"message":"You have already read the message"}})
						}else{
							//////////////////////////////////////
							_performInboxAction(self,inboxid,"read")
							/////////////////////////////////////
						}
					}else{
						////////////////////////////////////////////
							//////////////////////////////////////
							_performInboxAction(self,inboxid,"deactive")
							/////////////////////////////////////
						/////////////////////////////////////
					}
				}
			})
		}
	})
}
var _performInboxAction=function(self,inboxid,status){
	InboxModel.update({inboxid:inboxid},{$set:{status:status}},function(err,inboxstatus){
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
Inbox.prototype.replyToInboxMessage=function(sessionuserd,inboxid,replytext){
	var self=this;
	// console.log("action"+action)
	if(replytext==undefined ||replytext==""){
		self.emit("failedReplyToInboxMessage",{error:{code:"AV001",message:"Please pass replytext"}})
	}else{
		///////////////////////////////////////////////////////////
		_checkInbixIdIsWrong(self,sessionuserid,inboxid,replytext)
		///////////////////////////////////////////////////////////
	}
	
}
var _checkInbixIdIsWrong=function(self,sessionuserid,inboxid,replytext){
	UserModel.findOne({userid:sessionuserid},function(err,user){
		if(err){
			self.emit("failedReplyToInboxMessage",{error:{code:"ED001",message:"Database Issue"}})
		}else if(!user){
			self.emit("failedReplyToInboxMessage",{error:{message:"user not exists"}})
		}else{
			InboxModel.findOne({userid:sessionuserid,inboxid:inboxid,status:{$ne:"deactive"}},function(err,inbox){
				if(err){
					self.emit("failedReplyToInboxMessage",{error:{code:"ED001",message:"Database Issue"}})
				}else if(!inbox){
					self.emit("failedReplyToInboxMessage",{error:{"message":"inboxid is wrong or not exiss"}})
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
  var newinbox={userid:inbox.from.userid,from:{email:user.email,userid:user.userid,name:user.firstname},body:replytext,subject:inbox.subject}
	var new_inbox=new InboxModel(newinbox);
	new_inbox.save(function(err,inbox_data){
		if(err){
			self.emit("failedReplyToInboxMessage",{error:{code:"ED001",message:"Database Issue"}})
		}else{

		}
	})
}