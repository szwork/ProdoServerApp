//importing system
var mongodb = require("mongodb");
var S=require('string');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var logger=require("../../common/js/logger");
var orgModel = require('../../org//js/org-model');
var Blog = require('./blog');

exports.authorRegistration=function(req,res){
    var authordata = req.body.author;
    logger.emit("log","req authordata "+JSON.stringify(authordata));
    var blog = new Blog(authordata);  
    var sessionuserid=req.user.userid;
    logger.emit("log","sessionid:"+sessionuserid);
    blog.removeAllListeners("failedauthorRegistration");
    blog.on("failedauthorRegistration",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // blog.removeAllListeners();
      res.send(err);
    });
    blog.removeAllListeners("successfulauthorRegistration");
    blog.on("successfulauthorRegistration",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // blog.removeAllListeners();
      res.send(result);
    });
    blog.authorRegistration(sessionuserid);
}

exports.getAllRegistration=function(req,res){
    // logger.emit("log","authorid : "+authorid+" \nreq blogdata "+JSON.stringify(blogdata));
    var blog = new Blog();  
    var sessionuserid=req.user.userid;
    logger.emit("log","sessionid:"+sessionuserid);
    blog.removeAllListeners("failedGetAllRegistration");
    blog.on("failedGetAllRegistration",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // blog.removeAllListeners();
      res.send(err);
    });
    blog.removeAllListeners("successfulGetAllRegistration");
    blog.on("successfulGetAllRegistration",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // blog.removeAllListeners();
      res.send(result);
    });
    if(req.user.isAdmin==false){
      // logger.emit("error","You are not an author to add blog",sessionuserid);
      blog.emit("failedGetAllRegistration",{"error":{"code":"EA001","message":"You are not an admin user to get author registration details"}});
    }else{
      blog.getAllRegistration();
    } 
}

exports.authorAcceptance=function(req,res){
  var authorid = req.params.authorid;
    // logger.emit("log","authorid : "+authorid+" \nreq blogdata "+JSON.stringify(blogdata));
    var blog = new Blog();  
    var sessionuserid=req.user.userid;
    logger.emit("log","sessionid:"+sessionuserid);
    blog.removeAllListeners("failedauthorAcceptance");
    blog.on("failedauthorAcceptance",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // blog.removeAllListeners();
      res.send(err);
    });
    blog.removeAllListeners("successfulauthorAcceptance");
    blog.on("successfulauthorAcceptance",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // blog.removeAllListeners();
      res.send(result);
    });
    if(req.user.isAdmin==false){
      // logger.emit("error","You are not an author to add blog",sessionuserid);
      blog.emit("failedauthorAcceptance",{"error":{"code":"EA001","message":"You are not an admin user to get author registration details"}});
    }else{
      blog.authorAcceptance(authorid,sessionuserid);
    } 
}

exports.authorRejection = function(req,res){
  var authorid = req.params.authorid;
    // logger.emit("log","authorid : "+authorid+" \nreq blogdata "+JSON.stringify(blogdata));
    var blog = new Blog();  
    var sessionuserid=req.user.userid;
    logger.emit("log","sessionid:"+sessionuserid);
    blog.removeAllListeners("failedAuthorRejection");
    blog.on("failedAuthorRejection",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // blog.removeAllListeners();
      res.send(err);
    });
    blog.removeAllListeners("successfulAuthorRejection");
    blog.on("successfulAuthorRejection",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // blog.removeAllListeners();
      res.send(result);
    });
    if(req.user.isAdmin==false){
      // logger.emit("error","You are not an author to add blog",sessionuserid);
      blog.emit("failedAuthorRejection",{"error":{"code":"EA001","message":"You are not an admin user to get author registration details"}});
    }else{
      blog.authorRejection(authorid,sessionuserid);
    } 
}

exports.addBlog=function(req,res){
    var authorid = req.user.author.authorid;
  	var blogdata = req.body.blog;
    // logger.emit("log","userid : "+userid+" \nreq blogdata "+JSON.stringify(blogdata));
  	var blog = new Blog(blogdata);  
  	var sessionuserid=req.user.userid;
    logger.emit("log","sessionid:"+sessionuserid);
    blog.removeAllListeners("failedAddBlog");
    blog.on("failedAddBlog",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // blog.removeAllListeners();
      res.send(err);
    });
    blog.removeAllListeners("successfulAddBlog");
    blog.on("successfulAddBlog",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // blog.removeAllListeners();
      res.send(result);
    });
    if(req.user.author.isAuthor==false){
      // logger.emit("error","You are not an author to add blog",sessionuserid);
      blog.emit("failedAddBlog",{"error":{"code":"EA001","message":"You are not an author to add blog"}});
    }else{
      blog.addBlog(authorid,sessionuserid);
    }    
}

exports.publishBlog=function(req,res){
    var authorid = req.params.authorid;
    var blogid = req.params.blogid;
    var blogdata = req.body.blog;
    // logger.emit("log","userid : "+userid+" \nreq blogdata "+JSON.stringify(blogdata));
    var blog = new Blog(blogdata);  
    var sessionuserid=req.user.userid;
    logger.emit("log","sessionid:"+sessionuserid);
    blog.removeAllListeners("failedPublishBlog");
    blog.on("failedPublishBlog",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // blog.removeAllListeners();
      res.send(err);
    });
    blog.removeAllListeners("successfulPublishBlog");
    blog.on("successfulPublishBlog",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // blog.removeAllListeners();
      res.send(result);
    });
    if(req.user.author.isAuthor==false){
      // logger.emit("error","You are not an author to add blog",sessionuserid);
      blog.emit("failedPublishBlog",{"error":{"code":"EA001","message":"You are not an author to publish blog"}});
    }else{
      blog.publishBlog(authorid,blogid,sessionuserid);
    }    
}

exports.getProductNameByCategory = function(req,res){
    var authorid = req.params.authorid;
    // logger.emit("log","authorid : "+authorid+" \nreq blogdata "+JSON.stringify(blogdata));
    var blog = new Blog();  
    var sessionuserid=req.user.userid;
    logger.emit("log","sessionid:"+sessionuserid);
    blog.removeAllListeners("failedGetProductNameByCategory");
    blog.on("failedGetProductNameByCategory",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // blog.removeAllListeners();
      res.send(err);
    });
    blog.removeAllListeners("successfulGetProductNameByCategory");
    blog.on("successfulGetProductNameByCategory",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // blog.removeAllListeners();
      res.send(result);
    });
    blog.getProductNameByCategory(authorid,sessionuserid);
}

exports.updateBlog=function(req,res){
    var authorid = req.params.authorid;
    var blogid = req.params.blogid;
    var blogdata = req.body.blog;
    logger.emit("log","blogid : "+blogid+" \nreq blogdata "+JSON.stringify(blogdata));
    var blog = new Blog(blogdata);  
    var sessionuserid=req.user.userid;
    logger.emit("log","sessionid:"+sessionuserid);
    blog.removeAllListeners("failedUpdateBlog");
    blog.on("failedUpdateBlog",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // blog.removeAllListeners();
      res.send(err);
    });
    blog.removeAllListeners("successfulUpdateBlog");
    blog.on("successfulUpdateBlog",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // blog.removeAllListeners();
      res.send(result);
    });
    if(req.user.author.isAuthor!=true){
      logger.emit("error","You are not an author to update blog data",sessionuserid)
      blog.emit("failedUpdateBlog",{"error":{"code":"EA001","message":"You are not an author to update blog data"}})
    }else{
      blog.updateBlog(authorid,blogid,sessionuserid);
    }    
}

exports.getAllBlogs=function(req,res){
    var authorid = req.params.authorid;
    // logger.emit("log","authorid : "+authorid+" \nreq blogdata "+JSON.stringify(blogdata));
    var blog = new Blog();  
    var sessionuserid=req.user.userid;
    logger.emit("log","sessionid:"+sessionuserid);
    blog.removeAllListeners("failedGetAllBlogs");
    blog.on("failedGetAllBlogs",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // blog.removeAllListeners();
      res.send(err);
    });
    blog.removeAllListeners("successfulGetAllBlogs");
    blog.on("successfulGetAllBlogs",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // blog.removeAllListeners();
      res.send(result);
    });
    blog.getAllBlogs(authorid,sessionuserid);
}

exports.getBlog=function(req,res){
    var authorid = req.params.authorid;
    var blogid = req.params.blogid;
    logger.emit("log","blogid : "+blogid);
    var blog = new Blog();  
    var sessionuserid=req.user.userid;
    logger.emit("log","sessionid:"+sessionuserid);
    blog.removeAllListeners("failedGetBlog");
    blog.on("failedGetBlog",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // blog.removeAllListeners();
      res.send(err);
    });
    blog.removeAllListeners("successfulGetBlog");
    blog.on("successfulGetBlog",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // blog.removeAllListeners();
      res.send(result);
    });
    blog.getBlog(authorid,blogid);
}

exports.deleteBlog=function(req,res){
    var authorid = req.params.authorid;
    var blogid = req.params.blogid;
    // var blogdata = req.body.blog;
    var blog = new Blog();  
    var sessionuserid=req.user.userid;
    logger.emit("log","sessionid:"+sessionuserid);
    blog.removeAllListeners("failedDeleteBlog");
    blog.on("failedDeleteBlog",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // blog.removeAllListeners();
      res.send(err);
    });
    blog.removeAllListeners("successfulDeleteBlog");
    blog.on("successfulDeleteBlog",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // blog.removeAllListeners();
      res.send(result);
    });

    if(req.user.author.isAuthor!=true){
      // logger.emit("error","You are not an author to update blog data",sessionuserid);
      blog.emit("failedDeleteBlog",{"error":{"code":"EA001","message":"You are not an author to update blog data"}});
    }else{
      blog.deleteBlog(authorid,blogid,sessionuserid);
    }
}