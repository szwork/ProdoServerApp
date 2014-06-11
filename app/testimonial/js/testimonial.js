var events = require("events");
var logger = require("../../common/js/logger");
var ProductModel = require("../../product/js/product-model");
var orgModel=require("../../org/js/org-model");
var TestimonialModel=require("./testimonial-model");
var CONFIG = require('config').Prodonus;
var commonapi = require('../../common/js/common-api');
var UserModel=require("../../user/js/user-model");
var S=require("string");
var __=require("underscore");
var InboxModel=require("../../inbox/js/inbox-model");
var Testimonial = function(testimonialdata) {
	this.testimonial = testimonialdata;
};

Testimonial.prototype = new events.EventEmitter;
module.exports = Testimonial;
Testimonial.prototype.addTestimonial=function(orgid,prodle,sessionuserid,host){
	var self=this;
	var testimonialdata=this.testimonial;
	////////////////////////////////////////////////////////////
	_validateTestimonialData(self,testimonialdata,orgid,prodle,sessionuserid,host);
	//////////////////////////////////////////////////////////
}
var _validateTestimonialData=function(self,testimonialdata,orgid,prodle,sessionuserid,host){
	if(testimonialdata==undefined){
		self.emit("failedAddTestimonial",{error:{code:"AV001",message:"please pass testimonialdata"}})
	}else if(testimonialdata.text==undefined || testimonialdata.text==""){
		self.emit("failedAddTestimonial",{error:{code:"AV001",message:"please enter testimonial text"}})
	}else if(testimonialdata.displayname==undefined || testimonialdata.displayname==""){
		self.emit("failedAddTestimonial",{error:{code:"AV001",message:"please enter testimonial displayname"}})
	}else{
		//////////////////////////////////////
		_addTestimonial(self,testimonialdata,orgid,prodle,sessionuserid,host)
		/////////////////////////////////////
	}
}
var _addTestimonial=function(self,testimonialdata,orgid,prodle,sessionuserid,host){
	ProductModel.findOne({orgid:orgid,prodle:prodle},{prodle:1,name:1},function(err,product){
		if(err){
			logger.emit("error","Database Issue _addTestimonial"+err)
			self.emit("failedAddTestimonial",{error:{code:"ED001",message:"Database Issue"}})
		}else if(!product){
			self.emit("failedAddTestimonial",{error:{message:"prodle or orgid is wrong"}});
		}else{
			UserModel.findOne({userid:sessionuserid},{username:1,email:1,profile_pic:1,userid:1,org:1},function(err,user){
				if(err){
					logger.emit("error","Database Issue _addTestimonial"+err)
			    self.emit("failedAddTestimonial",{error:{code:"ED001",message:"Database Issue"}})
				}else if(!user){
					self.emit("failedAddTestimonial",{error:{message:"userid is wrong"}})
				}else{
					var testimonail_data={text:testimonialdata.text,displayname:testimonialdata.displayname,prodle:prodle,orgid:orgid,user:{userid:user.userid,profile_pic:user.profile_pic,orgname:user.org.orgname}};
					var testimonial_object=new TestimonialModel(testimonail_data);
					testimonial_object.save(function(err,testimonial){
						if(err){
							logger.emit("error","Database Issue _addTestimonial"+err)
			        self.emit("failedAddTestimonial",{error:{code:"ED001",message:"Database Issue"}})
						}else{
							//////////////////////////////////////
							_sendTestimonialRequestToOrganizationMember(self,testimonial,user,product,host);
							//////////////////////////////////
							///////////////////////////////////
							// _successfullAddTestimonial(self)
							///////////////////////////////////
						}
					})
				}
			})
		}
	})
}
var _successfullAddTestimonial=function(self){
	self.emit("successfulAddTestimonial",{success:{message:"Successfully added testimonial"}});
}
var _sendTestimonialRequestToOrganizationMember=function(self,testimonial,user,product,host){
	logger.emit("log","host"+host);
	var body="";
	var subject="Testimonial Requst";
	body+="<br>Customer <username> <orgname> has provided a testimonial for our product <b><productname></b>.<br>";
	body+="<br><br> '<b><testimonialtext></b>'<br><br>Please press or click <a  style='color:black;border:1;background-color:orange' href='http://"+host+"/api/testimonialaction/<testimonialid>?name=accept'>ACCEPT</a> if you want to make this testimonial public. And press or click <a style='color:black;border:1;background-color:orange' href='http://"+host+"/api/testimonialaction/<testimonialid>?name=reject' >REJECT</a> to remove the testimonial from product page"
	body=S(body);

	body=body.replaceAll("<username>",user.username);
	if(user.org.orgname==undefined || user.org.orgname==null ){
		body=body.replaceAll("<orgname>","");
	}else{
		body=body.replaceAll("<orgname>","from "+user.org.orgname);
	}
	
	body=body.replaceAll("<productname>",product.name);
	body=body.replaceAll("<testimonialid>",testimonial.testimonialid);
	body=body.replaceAll("<testimonialtext>",testimonial.text);
	console.log('body'+body)
 body=body.s;
	// body="<br><br>User <username> has added Testimonial h<b>"+product.name+"</b><br><br>";
	body+="<br><br>This email content is sent on behalf of  "+user.email+" by Prodonus Software Team";
  body+="<br>Disclaimer: We are not responsible for the content of this email as it is produced by "+user.email;
    var grparray=[new RegExp("admin",'i'),new RegExp("marketing",'i'),new RegExp("marketing",'i')];
		orgModel.aggregate({$match:{orgid:testimonial.orgid}},{$unwind:"$usergrp"},{$match:{"usergrp.grpname":{$in:grparray}}},{$project:{grpname:"$usergrp.grpname",grpmembers:"$usergrp.grpmembers",_id:0}},function(err,usergrps){
			if(err){
				logger.emit("error","Database Issue _sendProductEnquiryRequest "+err)
		    self.emit("failedAddTestimonial",{"error":{"code":"ED001","message":"Database Issue"}})			
			}else if(usergrps.length==0){
				self.emit("failedAddTestimonial",{"error":{"message":"There is no admin,sales,marketing user exists"}})			
			}else{
				var usergrpidsarray=[];
				for(var j=0;j<usergrps.length;j++){
					usergrpidsarray=__.union(usergrpidsarray,usergrps[j].grpmembers);
				}
				UserModel.find({userid:{$in:usergrpidsarray},status:"active"},{userid:1,email:1},function(err,useremails){
  				if(err){
  					logger.emit("error","Database Issue _sendProductEnquiryRequest "+err)
						self.emit("failedAddTestimonial",{"error":{"message":"Database Issue"}})			
  				}else if(useremails.length==0){
  					self.emit("failedAddTestimonial",{"error":{"message":"No Organization member exists"}})			
  				}else{
  					var emailarray=[];
  					var validproductenquiryuserids=[];
						for(var i=0;i<useremails.length;i++){
							emailarray.push(useremails[i].email);	
							validproductenquiryuserids.push(useremails[i].userid);	
						}
						var message = {
		        from: "Prodonus  <business@prodonus.com>", // sender address
		        to: emailarray+"", // list of receivers
		        subject:subject, // Subject line
		        html: body // html body
		       };
		      
         ////////////////////////////////////
		   _addProductTestimonialToGroupMemberInbox(testimonial,message,validproductenquiryuserids,user)
		     ///////////////////////////////////
         	///////////////////////////////////
							 _successfullAddTestimonial(self)
							///////////////////////////////////

		    // commonapi.sendMail(message,CONFIG.smtp_business, function (result){
		    //   if(result=="failure"){
		    //     logger.emit("error","Product enquiry request not sent to "+message.to+" by"+user.email);
		    //   }else{
		    //     logger.emit("log","Product enquiry request Sent Successfully to"+message.to+" by"+user.email);
		    //   }
		    // });
		  }
		})
	}
 })
}
var _addProductTestimonialToGroupMemberInbox=function(testimonial,message,userids,user){
	UserModel.find({userid:{$in:userids}},{userid:1,email:1,firstname:1},function(err,users){
		if(err){
			logger.emit("error","Database Issue"+err)
		}else if(!users){
			logger.emit("error","No user exists _addProductTestimonialToGroupMemberInbox")
		}else{
			var inboxarray=[]
			for(var i=0;i<users.length;i++){
				var inbox={testimonial:testimonial,messagetype:"testimonial",userid:users[i].userid,from:{email:user.email,userid:user.userid,username:user.username},subject:message.subject,body:message.html}
				// if(user.firstname==undefined){
				// 	inbox={testimonial:testimonial,messagetype:"testimonial",userid:users[i].userid,from:{email:user.email,userid:user.userid},subject:message.subject,body:message.html}
				// }else{
				// 	inbox={testimonial:testimonial,messagetype:"testimonial",userid:users[i].userid,from:{email:user.email,userid:user.userid,name:user.firstname},subject:message.subject,body:message.html}
				// }
				inboxarray.push(inbox)
			}
			InboxModel.create(inboxarray,function(err,inboxex){
				if(err){
					logger.emit("error","Database Issue"+err)
				}else{
					logger.emit("log","sent to inbox")
				}
			})

		}
	})
}
Testimonial.prototype.testimonialAction=function(testimonialid,sessionuserid,action){
	var self=this;
	////////////////////////////////////////////////////////////////
	_isAuthorizedToPerformAction(self,testimonialid,sessionuserid,action)
	///////////////////////////////////////////////////////////////
}
var _isAuthorizedToPerformAction=function(self,testimonialid,sessionuserid,action){
	TestimonialModel.findOne({testimonialid:testimonialid},function(err,testimonial){
		if(err){
			logger.emit("error","Database Issue _isAuthorizedToPerformAction "+err)
		  self.emit("failedTestimonailAction",{"error":{"code":"ED001","message":"Database Issue"}})			
		}else if(!testimonial){
			self.emit("failedTestimonailAction",{"error":{"message":"testimonialid does not exists"}})			
		}else{
			UserModel.findOne({userid:sessionuserid},{org:1,userid:1},function(err,user){
				if(err){
					logger.emit("error","Database Issue _isAuthorizedToPerformAction "+err)
		      self.emit("failedTestimonailAction",{"error":{"code":"ED001","message":"Database Issue"}})			
				}else if(!user){
					self.emit("failedTestimonailAction",{"error":{"message":"userid is wrong"}})			
				}else{
					if(user.org.orgid!=testimonial.orgid){
						self.emit("failedTestimonailAction",{"error":{"message":"Its not your product to accept or reject testimonial"}})			
					}else{
						///////////////////////////////
						_performTestimonialAction(self,testimonial,action)
						///////////////////////////////
					}
				}
			})	
		}
	})
}
var _performTestimonialAction=function(self,testimonial,action){
	if(action=="accept"){
		if(testimonial.status==action){
			self.emit("failedTestimonailAction",{error:{message:"Testimonial already accepted"}})	
		}else{
			///////////////////////////////////////////
			_acceptTestimonial(self,testimonial,action)
			///////////////////////////////////////////
		}
	}else{
		if(testimonial.status==action){
			self.emit("failedTestimonailAction",{error:{message:"Testimonial already rejected"}})	
		}else{
			///////////////////////////////////////////
			_rejectTestimonial(self,testimonial,action)
			///////////////////////////////////////////
		}
	}
}
var _acceptTestimonial=function(self,testimonial,action){
	TestimonialModel.update({testimonialid:testimonial.testimonialid},{$set:{status:"accept"}},function(err,testimonialstatus){
		if(err){
			logger.emit("error","Database Issue _acceptTestimonial "+err)
		  self.emit("failedTestimonailAction",{"error":{"code":"ED001","message":"Database Issue"}})			
		}else if(testimonialstatus==0){
			self.emit("failedTestimonailAction",{"error":{"message":"testimonialid is wrong"}})			
		}else{
			var message="Successfully accepted the testimonial";
			////////////////////////////////
			_successfullTestimonialAction(self,message)
			////////////////////////////////	
		}
	})
}
var _rejectTestimonial=function(self,testimonial,action){
	TestimonialModel.remove({testimonialid:testimonial.testimonialid},function(err,testimonialstatus){
		if(err){
			logger.emit("error","Database Issue _rejectTestimonial "+err)
		  self.emit("failedTestimonailAction",{"error":{"code":"ED001","message":"Database Issue"}})			
		}else if(testimonialstatus==0){
			self.emit("failedTestimonailAction",{"error":{"message":"testimonialid is wrong"}})			
		}else{
			var message="Successfully rejected the testimonial";
			////////////////////////////////
			_successfullTestimonialAction(self,message)
			////////////////////////////////	
		}
	})
}
var _successfullTestimonialAction=function(self,message){
	self.emit("successfulTestimonialAction",{success:{message:message}})
}
Testimonial.prototype.getTestimonialForProduct=function(prodle){
	var self=this;
	//////////////////////////////////////
	_getTestimonialForProduct(self,prodle)
	/////////////////////////////////
}
var _getTestimonialForProduct=function(self,prodle){
	TestimonialModel.find({prodle:prodle,status:"accept"},function(err,testimonials){
		if(err){
			logger.emit("error","Database Issue _getTestimonialForProduct "+err)
		  self.emit("failedTestimonialForProduct",{"error":{"code":"ED001","message":"Database Issue"}})			
		}else if(testimonials.length==0){
			self.emit("failedTestimonialForProduct",{error:{message:"No testimonials for product"}})
		}else{
			//////////////////////////////////
			_successfullGetTestimonialForProduct(self,testimonials)
			////////////////////////////////
		}
	})
}
var _successfullGetTestimonialForProduct=function(self,testimonials){
	self.emit('successfulTestimonialForProduct',{success:{message:"Getting testimonials for product successfully",testimonials:testimonials}})
}