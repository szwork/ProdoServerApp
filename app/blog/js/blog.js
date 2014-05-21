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

Blog.prototype.addBlog=function(prodle,authorid,sessionuserid){
	var self=this;
	var blogdata=this.blog;
	////////////////////////////////////////////////////////
	_validateBlogData(self,blogdata,prodle,authorid,sessionuserid);
	////////////////////////////////////////////////////////
}

var _validateBlogData = function(self,blogdata,prodle,authorid,userid){
	if(blogdata==undefined){
		self.emit("failedAddBlog",{"error":{"code":"AV001","message":"Please pass blog data"}});
	}else if(blogdata.productname==undefined){
		self.emit("failedAddBlog",{"error":{"code":"AV001","message":"Please pass productname"}});
	}else if(blogdata.title==undefined){
		self.emit("failedAddBlog",{"error":{"code":"AV001","message":"Please pass title"}});
	}else if(blogdata.content==undefined){
		self.emit("failedAddBlog",{"error":{"code":"AV001","message":"Please pass content"}});
	}else if(blogdata.category==undefined){
		self.emit("failedAddBlog",{"error":{"code":"AV001","message":"Please pass category"}});
	}else if(!isArray(blogdata.category)){
		self.emit("failedAddBlog",{"error":{"code":"AV001","message":"category should be an array"}});
	}else{
		_checkProdleIsValid(self,blogdata,prodle,authorid,userid);
	}
}

var _checkProdleIsValid = function(self,blogdata,prodle,authorid,userid){
	productModel.findOne({status:{$ne:"deactive"},prodle:prodle},function(err,product){
		if(err){
			self.emit("failedAddBlog",{"error":{"code":"ED001","message":"Error in db to find product"}});	
		}else if(product){
			blogdata.authorid = authorid;
			blogdata.prodle = product.prodle;
			blogdata.orgid = product.orgid;
			_addBlog(self,blogdata,userid);
		}else{
			self.emit("failedAddBlog",{"error":{"code":"AV001","message":"Provided prodle is wrong"}});
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
	blogModel.findAndModify({authorid:authorid,blogid:blogid},[],{$set:{status:"active",datepublished:new Date()}},{new:false},function(err,blogdata){
		if(err){
			self.emit("failedPublishBlog",{"error":{"code":"ED001","message":"Error in db to publish blog"}});
		}else if(blogdata){
			authorModel.findOne({authorid:authorid},{firstname:1,lastname:1}).lean().exec(function(err,authordata){
				if(err){
					self.emit("failedPublishBlog",{"error":{"code":"ED001","message":"Error in db to get authorname"}});
				}else if(authordata){
					blogdata.postedby = authordata.firstname+" "+authordata.lastname;
					blogdata.status = "active";
					blogModel.update({authorid:authorid,blogid:blogid},{$set:{publishblog:[blogdata]}}).lean().exec(function(err,blogupdatestatus){
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
				}else{
					self.emit("failedPublishBlog",{"error":{"code":"AP001","message":"authorid is wrong"}});
				}
			})
			
		}else{
			self.emit("failedPublishBlog",{"error":{"code":"AP001","message":"Wrong authorid or blogid"}});
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
	productModel.find({status:"active",category:{$in:category_arr}},{name:1,prodle:1,_id:0}).lean().exec(function(err,productname){
		if(err){
			self.emit("failedGetProductNameByCategory",{"error":{"code":"ED001","message":"Error in db to get product name"}});
		}else if(productname){
			var prod_name_arr = [];
			for(var i=0;i<productname.length;i++){
				prod_name_arr.push(productname[i]);
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
	/////////////////////////////////////////////////////////////////////
	_validateUpdateBlogData(self,blogdata,authorid,blogid,sessionuserid);
	/////////////////////////////////////////////////////////////////////
}

var _validateUpdateBlogData = function(self,blogdata,authorid,blogid,userid){
	if(blogdata==undefined){
		self.emit("failedUpdateBlog",{"error":{"code":"AV001","message":"Please pass blog data"}});
	}else if(blogdata.productname!=undefined){
		self.emit("failedUpdateBlog",{"error":{"code":"AV001","message":"Can't update productname"}});
	}else if(blogdata.prodle!=undefined){
		self.emit("failedUpdateBlog",{"error":{"code":"EA001","message":"Can't update prodle"}});
	}else if(blogdata.blogid!=undefined){
		self.emit("failedUpdateBlog",{"error":{"code":"EA001","message":"Can't update blogid"}});
	}else{
		_updateBlog(self,blogdata,authorid,blogid);
	}
}

// var _checkProductNameIsValidToUpdate = function(self,blogdata,authorid,blogid){
// 	productModel.findOne({status:{$ne:"deactive"},name:blogdata.productname},function(err,product){
// 		if(err){
// 			self.emit("failedUpdateBlog",{"error":{"code":"ED001","message":"Error in db to find product"}});	
// 		}else if(product){
// 			_updateBlog(self,blogdata,authorid,blogid);
// 		}else{
// 			self.emit("failedUpdateBlog",{"error":{"code":"AV001","message":"Provided product name is wrong"}});
// 		}
// 	});
// }

var _updateBlog = function(self,blogdata,authorid,blogid){
	blogdata.dateupdated = new Date();
	blogdata.status = "init";
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

var _getAllBlogs = function(self,authorid,userid){
	blogModel.find({status:{$ne:"deactive"},authorid:authorid},{authorid:1,blog_images:1,blogid:1,orgid:1,prodle:1,title:1,_id:0}).sort({datecreated:-1}).lean().exec(function(err,blogdata){
		if(err){
			self.emit("failedGetAllBlogs",{"error":{"code":"ED001","message":"Error in db to find all blog"}});
		}else if(blogdata.length>0){
			for(var i=0;i<blogdata.length;i++){
				if(blogdata[i].blog_images.length>0){
					blogdata[i].blog_images = [blogdata[i].blog_images[0]];
				}
			}
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
	blogModel.findOne({status:{$ne:"deactive"},authorid:authorid,blogid:blogid},{publishblog:0}).lean().exec(function(err,blogdata){
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

Blog.prototype.getAllBlogsForProduct = function(prodle,userid) {
	var self=this;
	/////////////////////////
	_getAllBlogsForProduct(self,prodle,userid);
	////////////////////////
};

var _getAllBlogsForProduct = function(self,prodle,userid){
	// {status:{$ne:"deactive"},prodle:prodle},{authorid:1,blog_images:1,blogid:1,orgid:1,prodle:1,title:1,_id:0}).sort({datecreated:-1}
	blogModel.aggregate([{"$unwind":"$publishblog"},{$match:{"publishblog.status":"active",prodle:prodle}},{$group:{_id:{authorid:"$authorid",blogid:"$blogid",prodle:"$prodle",orgid:"$orgid",postedby:"$publishblog.postedby",title:"$publishblog.title",content:"$publishblog.content"}}},{$project:{authorid:"$_id.authorid",blogid:"$_id.blogid",prodle:"$_id.prodle",orgid:"$_id.orgid",postedby:"$_id.postedby",title:"$_id.title",content:"$_id.content",_id:0}}]).exec(function(err,blogdata){
		if(err){
			self.emit("failedGetAllBlogsForProduct",{"error":{"code":"ED001","message":"Error in db to find all blog"}});
		}else if(blogdata.length>0){
			// for(var i=0;i<blogdata.length;i++){
			// 	if(blogdata[i].blog_images.length>0){
			// 		blogdata[i].blog_images = [blogdata[i].blog_images[0]];
			// 	}
			// }
			_successfulGetAllBlogsForProduct(self,blogdata);			
		}else{			
			self.emit("failedGetAllBlogsForProduct",{"error":{"code":"AP001","message":"Provided prodle is wrong"}});
		}
	})
}

var _successfulGetAllBlogsForProduct = function(self,blog){
	logger.emit("log","_successfulGetAllBlogsForProduct");
	self.emit("successfulGetAllBlogsForProduct", {"success":{"message":"Getting Product Blogs Successfully","doc":blog}});
}

Blog.prototype.getBlogForProduct = function(prodle,blogid,sessionuserid) {
	var self=this;
	/////////////////////////
	_getBlogForProduct(self,prodle,blogid,sessionuserid);
	////////////////////////
};

var _getBlogForProduct = function(self,prodle,blogid,userid){
	blogModel.aggregate([{"$unwind":"$publishblog"},{$match:{"publishblog.status":"active",prodle:prodle,blogid:blogid}},{$project:{authorid:"$authorid",blog_images:"$blog_images",blogid:"$blogid",category:"$publishblog.category",orgid:"$orgid",prodle:"$prodle",productname:"$productname",title:"$publishblog.title",content:"$publishblog.content",datepublished:"$datepublished",authorname:"$publishblog.postedby"}}]).exec(function(err,blogdata){
		if(err){
			self.emit("failedGetBlogForProduct",{"error":{"code":"ED001","message":"Error in db to find blog"}});
		}else if(blogdata){
			userModel.findOne({userid:userid}).exec(function(err,userdata){
				if(err){
					self.emit("failedGetBlogForProduct",{"error":{"code":"ED001","message":"Error in db to find user profile_pic"}});
				}else if(userdata){
					blogdata[0].profile_pic = userdata.profile_pic;
					_successfulGetBlogForProduct(self,blogdata);		
				}else{
					self.emit("failedGetBlogForProduct",{"error":{"code":"AP001","message":"Wrong userid"}});
				}
			})
					
		}else{			
			self.emit("failedGetBlogForProduct",{"error":{"code":"AP001","message":"Provided authorid or blogid is wrong"}});
		}
	})
}

var _successfulGetBlogForProduct = function(self,blog){
	logger.emit("log","_successfulGetBlogForProduct");
	self.emit("successfulGetBlogForProduct", {"success":{"message":"Getting Product Blog Successfully","doc":blog}});
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
	// }else if(isValidEmail(authordata.email).error!=undefined){
	// 	self.emit("failedauthorRegistration",isValidEmail(authordata.email));
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
		_checkAlreadyRegisterAuthor(self,authordata,userid);
	}
}

var _checkAlreadyRegisterAuthor = function(self,authordata,userid){
	authorModel.findOne({userid:userid}).exec(function(err,userstatus){
		if(err){
			self.emit("failedauthorRegistration",{"error":{"code":"ED001","message":"Error in db to check user alredy register"}});
		}else if(userstatus){
			self.emit("failedauthorRegistration",{"error":{"code":"AP001","message":"You are already register for blog author"}});
		}else{
			_getMailIdFromUserModel(self,authordata,userid);
		}
	})
}

var _getMailIdFromUserModel = function(self,authordata,userid){
	userModel.findAndModify({userid:userid},[],{$set:{firstname:authordata.firstname,lastname:authordata.lastname}},{new:false},function(err,authorstatus){
		if(err){
			self.emit("failedauthorRegistration",{"error":{"code":"ED001","message":"Error in db to check get emailid from user model"}});
		}else if(authorstatus){
			authordata.email = authorstatus.email;
			_authorRegistration(self,authordata,userid);	
		}else{
			self.emit("failedauthorRegistration",{"error":{"code":"AP001","message":"Wrong userid"}});
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
	        html=html.replaceAll("<firstname>",author.firstname);
	        html=html.replaceAll("<lastname>",author.lastname);
	        var message = {
	            from: "Prodonus <authorblog@prodonus.com>", // sender address
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

Blog.prototype.authorAcceptance=function(authorid,userid){
	var self=this;
	////////////////////////////////////////////////////////
	_authorAcceptance(self,authorid,userid);
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
	        html=html.replaceAll("<firstname>",author.firstname);
	        html=html.replaceAll("<lastname>",author.lastname);
	        var message = {
	            from: "Prodonus <authorblog@prodonus.com>", // sender address
	            to: author.email, // list of receivers
	            subject:emailtemplate.subject, // Subject line
	            html: html.s // html body
	        };
	        // logger.emit("log",JSON.stringify(message));
	 	 	// calling to sendmail method
	        commonapi.sendMail(message,CONFIG.smtp_general,function (result){
	            if(result=="failure"){
	            	self.emit("failedauthorAcceptance",{"error":{"code":"AT001","message":"Error to send author request acceptance"}});
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

Blog.prototype.authorRejection=function(authorid,userid){
	var self=this;
	////////////////////////////////////////////////////////
	_authorRejection(self,authorid,userid);
	////////////////////////////////////////////////////////
}

var _authorRejection = function(self,authorid,userid){
	authorModel.update({authorid:authorid},{$set:{status:"rejected",rejected_date:new Date()}}).lean().exec(function(err,blogupdatestatus){
		if(err){
			self.emit("failedAuthorRejection",{"error":{"code":"ED001","message":"Error in db to reject author request"}});
		}else if(blogupdatestatus!=1){
			self.emit("failedAuthorRejection",{"error":{"code":"AP001","message":"authorid is wrong"}});
		}else{
			////////////////////////////////
			// _successfulAuthorRejection(self);
			//////////////////////////////////
			_changeIsAuthorFalseInUserModel(self,authorid,userid);			
		}
	})
};

var _changeIsAuthorFalseInUserModel = function(self,authorid,userid){
	userModel.update({userid:userid},{$set:{"author.isAuthor":false}}).lean().exec(function(err,blogupdatestatus){
		if(err){
			self.emit("failedAuthorRejection",{"error":{"code":"ED001","message":"Error in db to update user details"}});
		}else if(blogupdatestatus!=1){
			self.emit("failedAuthorRejection",{"error":{"code":"AP001","message":"userid is wrong"}});
		}else{
			authorModel.findOne({authorid:authorid}).lean().exec(function(err,author){
				if(err){
					self.emit("failedAuthorRejection",{"error":{"code":"ED001","message":"Error in db to get author details"}});
				}else if(author){
					///////////////////////////////////////////
					_sendAuthorReqRejectionEmail(self,author);
					///////////////////////////////////////////
				}else{			
					self.emit("failedAuthorRejection",{"error":{"code":"AP001","message":"wrong authorid"}});
				}
			})
		}
	})
}

//find authorrejection template and send mail
var _sendAuthorReqRejectionEmail = function(self,author) {
	//send authorrejection email to author
	EmailTemplateModel.findOne({"templatetype":"authorrejection"}).lean().exec(function(err,emailtemplate){
		if(err){
			self.emit("failedAuthorRejection",{"error":{"code":"ED001","message":"Error in db to find authorregistrationsuccess emailtemplate"}});
		}else if(emailtemplate){
			// var url = "http://"+host+"/api/verify/"+token;
			var html=emailtemplate.description;
	        html=S(html);
	        html=html.replaceAll("<firstname>",author.firstname);
	        html=html.replaceAll("<lastname>",author.lastname);
	        var message = {
	            from: "Prodonus <authorblog@prodonus.com>", // sender address
	            to: author.email, // list of receivers
	            subject:emailtemplate.subject, // Subject line
	            html: html.s // html body
	        };
	        // logger.emit("log",JSON.stringify(message));
	 	 	// calling to sendmail method
	        commonapi.sendMail(message,CONFIG.smtp_general,function (result){
	            if(result=="failure"){
	            	self.emit("failedAuthorRejection",{"error":{"code":"AT001","message":"Error to author request rejection email"}});
	            }else{
	            	logger.emit("info","Author request rejected successfully");
	            	/////////////////////////////////
	            	_successfulAuthorRejection(self);
	            	////////////////////////////////
	            }
	        });
	    }else{
	        self.emit("failedAuthorRejection",{"error":{"code":"ED002","message":"Server setup template issue"}});
		}
	})
}

var _successfulAuthorRejection = function(self){
	logger.log("log","_successfulAuthorRejection");
	self.emit("successfulAuthorRejection",{"success":{"message":"Author request rejected sucessfully"}});
}

Blog.prototype.deleteBlogImage = function(blogimageids,authorid,blogid) {
	var self=this;
	if(blogimageids==undefined){
		self.emit("failedDeleteBlogImage",{"error":{"code":"AV001","message":"Please provide campaign image ids"}});
	}else if(blogimageids.length==0){
		self.emit("failedDeleteBlogImage",{"error":{"message":"Given blogimageids is empty "}});
	}else{
		///////////////////////////////////////////////////////////////////
		_deleteBlogImage(self,blogimageids,authorid,blogid);
		/////////////////////////////////////////////////////////////////	
	}
};

var _deleteBlogImage = function(self,blogimageids,authorid,blogid){
	var blog_imagearray=[];
	blogimageids=S(blogimageids);
	// db.products.update({"product_images.imageid":{$in:["7pz904msymu","333"]}},{$pull:{"product_images":{imageid:{$in:["7pz904msymu","333"]}}}});
   	if(blogimageids.contains(",")){
   		blog_imagearray=blogimageids.split(",");
   	}else{
   		blog_imagearray.push(blogimageids.s);
   	}
	blogModel.findAndModify({authorid:authorid,blogid:blogid,"blog_images.imageid":{$in:blog_imagearray}},[],{$pull:{blog_images:{imageid:{$in:blog_imagearray}}}},{new:false},function(err,deleteimagestatus){
		if(err){
			self.emit("failedDeleteBlogImage",{"error":{"code":"ED001","message":"function:_deleteCampaignImage\nError in db to "}});
		}else if(!deleteimagestatus){
			self.emit("failedDeleteBlogImage",{"error":{"message":"blogid or given blogimageids is wrong "}});
		}else{
			var blog_images=deleteimagestatus.blog_images;
			// blog_images=JSON.parse(blog_images);
			logger.emit("log","dd"+JSON.stringify(blog_images));
			var object_array=[];
			for(var i=0;i<blog_images.length;i++){
				object_array.push({Key:blog_images[i].key});
				console.log("test"+blog_images[i]);
			}
			logger.emit("log","object_array:"+JSON.stringify(object_array));
			var delete_aws_params={
				Bucket: blog_images[0].bucket, // required
  			Delete: { // required
    			Objects: object_array,
      			Quiet: true || false
      		}
      	}
      	logger.emit('log',"delete_aws_params:"+JSON.stringify(delete_aws_params));
      	s3bucket.deleteObjects(delete_aws_params, function(err, data) {
			if (err){
			  	logger.emit("error","Blog images not deleted from amazon s3 blogid:"+blogid);
			} else{
			  	logger.emit("log","Blog images deleted from amazon s3 blogid:"+blogid);
			} 
		})
			//////////////////////////////////
			_successfulDeleteBlogImage(self);
			/////////////////////////////////////
		}
	})
}

var _successfulDeleteBlogImage=function(self){
	logger.emit("log","_successfulDeleteBlogImage");
	self.emit("successfulDeleteBlogImage",{"success":{"message":"Delete Blog Images Successfully"}});
}