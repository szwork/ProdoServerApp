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

var Blog = function(blogdata) {
	this.blog = blogdata;
};

Blog.prototype = new events.EventEmitter;
module.exports = Blog;

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