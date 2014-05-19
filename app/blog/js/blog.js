/*
* Overview: Blog
* Dated:
* Author: Ramesh Kunhiraman
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* 27-3-2013 | xyx | Add a new property
* 12-11-2013|Sunil|Add a subscription 
*/

var events = require("events");
var logger = require("../../common/js/logger");
var productModel = require("../../product/js/product-model");
var authorModel = require("./author-model");
var blogModel = require("./blog-model");
var userModel = require('../../user/js/user-model');
var EmailTemplateModel=require('../../common/js/email-template-model');
var commonapi = require('../../common/js/common-api');
var CONFIG = require('config').Prodonus;
var regxemail = /\S+@\S+\.\S+/;
var S=require('string');
var Blog = function(blogdata) {
	this.blog = blogdata;
};

Blog.prototype = new events.EventEmitter;
module.exports = Blog;

function isArray(what) {
    return Object.prototype.toString.call(what) === '[object Array]';
}

//To check email validation
var isValidEmail=function(email){
	if(email==undefined){
	 	return {"error":{"code":"AV001","message":"please pass emailid"}};
	}else if(email.trim().length==0){
		return {"error":{"code":"AV001","message":"please enter emailid"}};
	}else if(!regxemail.test(email)){
		return {"error":{"code":"AV001","message":"please enter valid email"}};
 	}else{
 		return {"success":{"message":"Valid email id"}};
 	}
}

Blog.prototype.addBlog=function(authorid,sessionuserid){
	var self=this;
	var blogdata=this.blog;
	////////////////////////////////////////////////////////
	_validateBlogData(self,blogdata,authorid,sessionuserid);
	////////////////////////////////////////////////////////
}

var _validateBlogData = function(self,blogdata,authorid,userid){
	console.log(" blogdata : "+JSON.stringify(blogdata));
	if(blogdata==undefined){
		self.emit("failedAddBlog",{"error":{"code":"AV001","message":"Please pass blog data"}});
	}else if(blogdata.productname==undefined){
		self.emit("failedAddBlog",{"error":{"code":"AV001","message":"Please pass productname"}});
	}else if(blogdata.title==undefined){
		self.emit("failedAddBlog",{"error":{"code":"AV001","message":"Please pass title"}});
	}else if(blogdata.content==undefined){
		self.emit("failedAddBlog",{"error":{"code":"AV001","message":"Please pass content"}});
	}else{
		_checkProductNameIsValid(self,blogdata,authorid,userid);
	}
}

var _checkProductNameIsValid = function(self,blogdata,authorid,userid){
	productModel.findOne({status:{$ne:"deactive"},name:blogdata.productname},function(err,product){
		if(err){
			self.emit("failedAddBlog",{"error":{"code":"ED001","message":"Error in db to find product"}});	
		}else if(product){
			blogdata.authorid = authorid;
			blogdata.prodle = product.prodle;
			blogdata.orgid = product.orgid;
			_addBlog(self,blogdata,userid);
		}else{
			self.emit("failedAddBlog",{"error":{"code":"AV001","message":"Provided product name is wrong"}});
		}
	});
}

var _addBlog = function(self,blogdata,userid){
	console.log("blogdata : "+JSON.stringify(blogdata));
	blogdata.datecreated = new Date();
	var blog=new blogModel(blogdata);
	blog.save(function(err,blogstatus){
	  	if(err){
	  		self.emit("failedAddBlog",{"error":{"code":"ED001","message":"Error in db to add new blog"}});	
	   	}else{
		 	////////////////////////////////////
			_successfulAddBlog(self,blogstatus);
			////////////////////////////////////
	   	}
    });
}

var _successfulAddBlog = function(self,blogstatus){
	logger.log("log","_successfulAddBlog");
	self.emit("successfulAddBlog",{"success":{"message":"Blog added sucessfully"}});
}

Blog.prototype.publishBlog=function(authorid,blogid,sessionuserid){
	var self=this;
	var blogdata=this.blog;
	////////////////////////////////////////////////////////
	_checkAlreadyPublishOrNot(self,authorid,blogid,sessionuserid);
	////////////////////////////////////////////////////////
}

var _checkAlreadyPublishOrNot = function(self,authorid,blogid,userid){
	blogModel.findOne({authorid:authorid,blogid:blogid},{status:1}).lean().exec(function(err,blogdata){
		if(err){
			self.emit("failedPublishBlog",{"error":{"code":"ED001","message":"Error in db to get author category"}});
		}else if(blogdata){
			if(blogdata.status=="active"){
				self.emit("failedPublishBlog",{"error":{"code":"AP001","message":"Blog was already published"}});
			}else{
				_publishBlog(self,authorid,blogid,userid);
			}			
		}else{			
			self.emit("failedPublishBlog",{"error":{"code":"AP001","message":"Wrong authorid or blogid"}});
		}
	})
}

var _publishBlog = function(self,authorid,blogid,userid){
	blogModel.update({authorid:authorid,blogid:blogid},{$set:{status:"active",datepublished:new Date()}}).lean().exec(function(err,blogupdatestatus){
		if(err){
			self.emit("failedPublishBlog",{"error":{"code":"ED001","message":"Error in db to publish blog"}});
		}else if(blogupdatestatus!=1){
			self.emit("failedPublishBlog",{"error":{"code":"AP001","message":"authorid or blogid is wrong"}});
		}else{
			////////////////////////////////
			_successfulPublishBlog(self);
			//////////////////////////////////
		}
	})
}

var _successfulPublishBlog = function(self,blogstatus){
	logger.log("log","_successfulPublishBlog");
	self.emit("successfulPublishBlog",{"success":{"message":"Blog Published Sucessfully"}});
}

Blog.prototype.getProductNameByCategory = function(authorid,userid){
	var self=this;
	////////////////////////////////////////////////////////
	_getAuthorCategory(self,authorid,userid);
	////////////////////////////////////////////////////////
}

var _getAuthorCategory = function(self,authorid,userid){
	authorModel.findOne({authorid:authorid,userid:userid}).lean().exec(function(err,authordata){
		if(err){
			self.emit("failedGetProductNameByCategory",{"error":{"code":"ED001","message":"Error in db to get author category"}});
		}else if(authordata){
			_getProductNameByCategory(self,authordata.category);			
		}else{			
			self.emit("failedGetProductNameByCategory",{"error":{"code":"AP001","message":"Wrong authorid"}});
		}
	})
}

var _getProductNameByCategory = function(self,category_arr){
	productModel.find({status:"active",category:{$in:category_arr}},{name:1,_id:0}).lean().exec(function(err,productname){
		if(err){
			self.emit("failedGetProductNameByCategory",{"error":{"code":"ED001","message":"Error in db to get product name"}});
		}else if(productname){
			var prod_name_arr = [];
			for(var i=0;i<productname.length;i++){
				prod_name_arr.push(productname[i].name);
			}
			_successfulGetProductNameByCategory(self,prod_name_arr);
		}else{
			self.emit("failedGetProductNameByCategory",{"error":{"code":"AP001","message":"Product not found for category which is entered by author"}});
		}
	})
}

var _successfulGetProductNameByCategory = function(self,productname){
	logger.log("log","_successfulGetProductNameByCategory");
	self.emit("successfulGetProductNameByCategory",{"success":{"message":"Getting productname sucessfully","productname":productname}});
}

Blog.prototype.updateBlog=function(authorid,blogid,sessionuserid){
	var self=this;
	var blogdata=this.blog;
	////////////////////////////////////////////////////////
	_validateUpdateBlogData(self,blogdata,authorid,blogid,sessionuserid);
	////////////////////////////////////////////////////////
}

var _validateUpdateBlogData = function(self,blogdata,authorid,blogid,userid){
	if(blogdata==undefined){
		self.emit("failedUpdateBlog",{"error":{"code":"AV001","message":"Please pass blog data"}});
	}else if(blogdata.prodle!=undefined){
		self.emit("failedUpdateBlog",{"error":{"code":"EA001","message":"Can't update prodle"}});
	}else if(blogdata.blogid!=undefined){
		self.emit("failedUpdateBlog",{"error":{"code":"EA001","message":"Can't update blogid"}});
	}else{
		_checkProductNameIsValidToUpdate(self,blogdata,authorid,blogid);
	}
}

var _checkProductNameIsValidToUpdate = function(self,blogdata,authorid,blogid){
	productModel.findOne({status:{$ne:"deactive"},name:blogdata.productname},function(err,product){
		if(err){
			self.emit("failedUpdateBlog",{"error":{"code":"ED001","message":"Error in db to find product"}});	
		}else if(product){
			_updateBlog(self,blogdata,authorid,blogid);
		}else{
			self.emit("failedUpdateBlog",{"error":{"code":"AV001","message":"Provided product name is wrong"}});
		}
	});
}

var _updateBlog = function(self,blogdata,authorid,blogid){
	console.log("Blog## : "+JSON.stringify(blogdata));
	console.log("authorid : "+authorid+" blogid : "+blogid);
	blogdata.dateupdated = new Date();
	blogModel.update({authorid:authorid,blogid:blogid},{$set:blogdata}).lean().exec(function(err,blogupdatestatus){
		if(err){
			self.emit("failedUpdateBlog",{"error":{"code":"ED001","message":"Error in db to update blog"}});
		}else if(blogupdatestatus!=1){
			self.emit("failedUpdateBlog",{"error":{"code":"AP001","message":"authorid or blogid is wrong"}});
		}else{
			////////////////////////////////
			_successfulUpdateBlog(self);
			//////////////////////////////////
		}
	})
};

var _successfulUpdateBlog = function(self){
	logger.log("log","_successfulUpdateBlog");
	self.emit("successfulUpdateBlog",{"success":{"message":"Blog updated sucessfully"}});
}

Blog.prototype.getAllBlogs = function(authorid,userid) {
	var self=this;
	/////////////////////////
	_getAllBlogs(self,authorid,userid);
	////////////////////////
};

var _getAllBlogs=function(self,authorid,userid){
	blogModel.find({status:"active",authorid:authorid}).lean().exec(function(err,blogdata){
		if(err){
			self.emit("failedGetAllBlogs",{"error":{"code":"ED001","message":"Error in db to find all blog"}});
		}else if(blogdata.length>0){			
			_successfulGetAllBlogs(self,blogdata);			
		}else{			
			self.emit("failedGetAllBlogs",{"error":{"code":"AP001","message":"Provided authorid is wrong"}});
		}
	})
}

var _successfulGetAllBlogs = function(self,blog){
	logger.emit("log","_successfulGetAllBlogs");
	self.emit("successfulGetAllBlogs", {"success":{"message":"Getting All Blog Details Successfully","blog":blog}});
}

Blog.prototype.getBlog = function(authorid,blogid) {
	var self=this;
	/////////////////////////
	_getBlog(self,authorid,blogid);
	////////////////////////
};

var _getBlog=function(self,authorid,blogid){
	blogModel.findOne({status:"active",authorid:authorid,blogid:blogid}).lean().exec(function(err,blogdata){
		if(err){
			self.emit("failedGetBlog",{"error":{"code":"ED001","message":"Error in db to find blog"}});
		}else if(blogdata){
			_successfulGetBlog(self,blogdata);			
		}else{			
			self.emit("failedGetBlog",{"error":{"code":"AP001","message":"Provided authorid or blogid is wrong"}});
		}
	})
}

var _successfulGetBlog = function(self,blog){
	logger.emit("log","_successfulGetBlog");
	self.emit("successfulGetBlog", {"success":{"message":"Getting Blog Details Successfully","blog":blog}});
}

Blog.prototype.deleteBlog=function(authorid,blogid,sessionuserid){
	var self=this;
	////////////////////////////////////////////////////////
	_deleteBlog(self,authorid,blogid);
	////////////////////////////////////////////////////////
}

var _deleteBlog = function(self,authorid,blogid){
	console.log("authorid : "+authorid+" blogid : "+blogid);
	var removed_date = new Date();
	blogModel.update({authorid:authorid,blogid:blogid},{$set:{dateremoved:removed_date,status:"deactive"}}).lean().exec(function(err,blogupdatestatus){
		if(err){
			self.emit("failedDeleteBlog",{"error":{"code":"ED001","message":"Error in db to delete"}});
		}else if(blogupdatestatus!=1){
			self.emit("failedDeleteBlog",{"error":{"code":"AP001","message":"authorid or blogid is wrong"}});
		}else{
			////////////////////////////
			_successfulDeleteBlog(self);
			////////////////////////////
		}
	})
};

var _successfulDeleteBlog = function(self,blog){
	logger.emit("log","_successfulDeleteBlog");
	self.emit("successfulDeleteBlog", {"success":{"message":"Blog Deleted Successfully"}});
}

Blog.prototype.authorRegistration=function(sessionuserid){
	var self=this;
	var authordata=this.blog;
	
	////////////////////////////////////////////////////////
	_validateAuthorData(self,authordata,sessionuserid);
	////////////////////////////////////////////////////////
}

var _validateAuthorData = function(self,authordata,userid){
	if(authordata==undefined){
		self.emit("failedauthorRegistration",{"error":{"code":"AV001","message":"Please pass authordata"}});
	}else if(authordata.firstname==undefined){
		self.emit("failedauthorRegistration",{"error":{"code":"AV001","message":"Please pass firstname"}});
	}else if(authordata.lastname==undefined){
		self.emit("failedauthorRegistration",{"error":{"code":"AV001","message":"Please pass lastname"}});
	}else if(isValidEmail(authordata.email).error!=undefined){
		self.emit("failedauthorRegistration",isValidEmail(authordata.email));
	}else if(authordata.country==undefined){
		self.emit("failedauthorRegistration",{"error":{"code":"AV001","message":"Please pass country"}});
	}else if(authordata.category==undefined){
		self.emit("failedauthorRegistration",{"error":{"code":"AV001","message":"Please pass category"}});
	}else if(!isArray(authordata.category)){
		self.emit("failedauthorRegistration",{"error":{"code":"AV001","message":"category should be an array"}});
	}else if(authordata.category.length==0){
		self.emit("failedauthorRegistration",{"error":{"code":"AV001","message":"Pleas pass atleast one category"}});
	}else if(authordata.portfolio==undefined){
		self.emit("failedauthorRegistration",{"error":{"code":"AV001","message":"Please pass portfolio"}});
	}else if(!isArray(authordata.portfolio)){
		self.emit("failedauthorRegistration",{"error":{"code":"AV001","message":"portfolio should be an array"}});
	}else{
		_checkEmailAlreadyExist(self,authordata,userid);
	}
}

var _checkEmailAlreadyExist = function(self,authordata,userid){
	authorModel.findOne({userid:userid}).lean().exec(function(err,authorstatus){
		if(err){
			self.emit("failedauthorRegistration",{"error":{"code":"ED001","message":"Error in db to check valid email"}});
		}else if(authorstatus){
			self.emit("failedauthorRegistration",{"error":{"code":"AP001","message":"You have already registered for author application"}});
		}else{
			_authorRegistration(self,authordata,userid);		
		}
	})
}

var _authorRegistration = function(self,authordata,userid){
	authordata.userid = userid;
	authordata.posted_date = new Date();
	var author_model = new authorModel(authordata);
	console.log("AuthorData : "+JSON.stringify(authordata));
	author_model.save(function(err,addstatus){
	   	if(err){
	  		self.emit("failedauthorRegistration",{"error":{"code":"ED001","message":"Error in db to add new author "+err}});	
	   	}else{
		    /////////////////////////////////////////////
			// _successfulauthorRegistration(self,addstatus);
			_sendSuccessfulAuthorRegiEmail(self,addstatus);
	  		/////////////////////////////////////////////
	   	}
	});
}

//find author registration template and send mail
var _sendSuccessfulAuthorRegiEmail = function(self,author) {
	//send successful author registration email to author 
	EmailTemplateModel.findOne({"templatetype":"authorregistrationsuccess"}).lean().exec(function(err,emailtemplate){
		if(err){
			self.emit("failedauthorRegistration",{"error":{"code":"ED001","message":"Error in db to find authorregistrationsuccess emailtemplate"}});
		}else if(emailtemplate){
			// var url = "http://"+host+"/api/verify/"+token;
			var html=emailtemplate.description;
	        html=S(html);
	        html=html.replaceAll("<email>",author.email);
	        // html=html.replaceAll("<url>",url);
	        var message = {
	            from: "Prodonus <noreply@prodonus.com>", // sender address
	            to: author.email, // list of receivers
	            subject:emailtemplate.subject, // Subject line
	            html: html.s // html body
	        };
	        // logger.emit("log",JSON.stringify(message));
	 	 	// calling to sendmail method
	        commonapi.sendMail(message,CONFIG.smtp_general,function (result){
	            if(result=="failure"){
	            	self.emit("failedauthorRegistration",{"error":{"code":"AT001","message":"Error to send verification email"}});
	            }else{
	            	logger.emit("info","Author Added successfully");
	            	/////////////////////////////////
	            	_successfulauthorRegistration(self,author);
	            	////////////////////////////////
	            }
	        });
	    }else{
	        self.emit("failedauthorRegistration",{"error":{"code":"ED002","message":"Server setup template issue"}});
		}
	})
}

var _successfulauthorRegistration = function(self,author){
	logger.emit("log","_successfulauthorRegistration");
	self.emit("successfulauthorRegistration", {"success":{"message":"Author Added Successfully"}});
}

Blog.prototype.getAllRegistration = function() {
	var self=this;
	/////////////////////////
	_getAllRegistration(self);
	////////////////////////
};

var _getAllRegistration = function(self){
	authorModel.find({}).lean().exec(function(err,authorstatus){
		if(err){
			self.emit("failedGetAllRegistration",{"error":{"code":"ED001","message":"Error in db to get author registration details"}});
		}else if(authorstatus){
			_successfulGetAllRegistration(self,authorstatus);			
		}else{			
			self.emit("failedGetAllRegistration",{"error":{"code":"AP001","message":"Author registration does not exist"}});
		}
	})
}

var _successfulGetAllRegistration = function(self,author){
	logger.emit("log","_successfulGetAllRegistration");
	self.emit("successfulGetAllRegistration", {"success":{"message":"Getting Author Registration Details Successfully","author":author}});
}

Blog.prototype.authorAcceptance=function(authorid,sessionuserid){
	var self=this;
	////////////////////////////////////////////////////////
	_authorAcceptance(self,authorid,sessionuserid);
	////////////////////////////////////////////////////////
}

var _authorAcceptance = function(self,authorid,userid){
	authorModel.update({authorid:authorid},{$set:{status:"accepted",accepted_date:new Date()}}).lean().exec(function(err,blogupdatestatus){
		if(err){
			self.emit("failedauthorAcceptance",{"error":{"code":"ED001","message":"Error in db to accept author request"}});
		}else if(blogupdatestatus!=1){
			self.emit("failedauthorAcceptance",{"error":{"code":"AP001","message":"authorid is wrong"}});
		}else{
			////////////////////////////////
			// _successfulauthorAcceptance(self);
			//////////////////////////////////
			_changeIsAuthorInUserModel(self,authorid,userid);
			
		}
	})
};

var _changeIsAuthorInUserModel = function(self,authorid,userid){
	userModel.update({userid:userid},{$set:{"author.authorid":authorid,"author.isAuthor":true}}).lean().exec(function(err,blogupdatestatus){
		if(err){
			self.emit("failedauthorAcceptance",{"error":{"code":"ED001","message":"Error in db to update user detail"}});
		}else if(blogupdatestatus!=1){
			self.emit("failedauthorAcceptance",{"error":{"code":"AP001","message":"userid is wrong"}});
		}else{
			authorModel.findOne({authorid:authorid}).lean().exec(function(err,author){
				if(err){
					self.emit("failedauthorAcceptance",{"error":{"code":"ED001","message":"Error in db to get author details"}});
				}else if(author){
					///////////////////////////////////////////
					_sendAuthorReqAcceptanceEmail(self,author);
					///////////////////////////////////////////
				}else{			
					self.emit("failedauthorAcceptance",{"error":{"code":"AP001","message":"wrong authorid"}});
				}
			})
		}
	})
}

//find authoracceptance template and send mail
var _sendAuthorReqAcceptanceEmail = function(self,author) {
	//send authoracceptance email to author
	console.log("Author ## : "+author.email);
	EmailTemplateModel.findOne({"templatetype":"authoracceptance"}).lean().exec(function(err,emailtemplate){
		if(err){
			self.emit("failedauthorAcceptance",{"error":{"code":"ED001","message":"Error in db to find authorregistrationsuccess emailtemplate"}});
		}else if(emailtemplate){
			// var url = "http://"+host+"/api/verify/"+token;
			var html=emailtemplate.description;
	        html=S(html);
	        html=html.replaceAll("<email>",author.email);
	        // html=html.replaceAll("<url>",url);
	        var message = {
	            from: "Prodonus <noreply@prodonus.com>", // sender address
	            to: author.email, // list of receivers
	            subject:emailtemplate.subject, // Subject line
	            html: html.s // html body
	        };
	        // logger.emit("log",JSON.stringify(message));
	 	 	// calling to sendmail method
	        commonapi.sendMail(message,CONFIG.smtp_general,function (result){
	            if(result=="failure"){
	            	self.emit("failedauthorAcceptance",{"error":{"code":"AT001","message":"Error to send verification email"}});
	            }else{
	            	logger.emit("info","Author request accepted successfully");
	            	/////////////////////////////////
	            	_successfulauthorAcceptance(self);
	            	////////////////////////////////
	            }
	        });
	    }else{
	        self.emit("failedauthorAcceptance",{"error":{"code":"ED002","message":"Server setup template issue"}});
		}
	})
}

var _successfulauthorAcceptance = function(self){
	logger.log("log","_successfulauthorAcceptance");
	self.emit("successfulauthorAcceptance",{"success":{"message":"Author request accepted sucessfully"}});
}