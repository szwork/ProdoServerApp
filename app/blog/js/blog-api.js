//importing system
var mongodb = require("mongodb");
var S=require('string');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var logger=require("../../common/js/logger");
var orgModel = require('../../org//js/org-model');
var Blog = require('./blog');

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
    if(req.user.author.isAuthor!=true){
      // logger.emit("error","You are not an author to add blog",sessionuserid);
      blog.emit("failedAddBlog",{"error":{"code":"EA001","message":"You are not an author to add blog"}});
    }else{
      blog.addBlog(authorid,sessionuserid);
    }    
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
    // logger.emit("log","authorid : "+authorid+" \nreq blogdata "+JSON.stringify(blogdata));
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