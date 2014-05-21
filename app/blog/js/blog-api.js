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
    var userid=req.params.userid;
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
      blog.authorAcceptance(authorid,userid);
    } 
}

exports.authorRejection = function(req,res){
  var authorid = req.params.authorid;
    // logger.emit("log","authorid : "+authorid+" \nreq blogdata "+JSON.stringify(blogdata));
    var blog = new Blog();  
    var userid=req.params.userid;
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
      blog.authorRejection(authorid,userid);
    } 
}

exports.addBlog=function(req,res){
    var authorid = req.user.author.authorid;
    var prodle = req.params.prodle;
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
      blog.addBlog(prodle,authorid,sessionuserid);
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

exports.getAllBlogsForProduct = function(req,res){
    var prodle = req.params.prodle;
    logger.emit("log","prodle : "+prodle);
    var blog = new Blog();  
    var sessionuserid=req.user.userid;
    logger.emit("log","sessionid:"+sessionuserid);
    blog.removeAllListeners("failedGetAllBlogsForProduct");
    blog.on("failedGetAllBlogsForProduct",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // blog.removeAllListeners();
      res.send(err);
    });
    blog.removeAllListeners("successfulGetAllBlogsForProduct");
    blog.on("successfulGetAllBlogsForProduct",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // blog.removeAllListeners();
      res.send(result);
    });
    blog.getAllBlogsForProduct(prodle,sessionuserid);
}

exports.getBlogForProduct = function(req,res){
    var prodle = req.params.prodle;
    var blogid = req.params.blogid;
    logger.emit("log","prodle : "+prodle);
    var blog = new Blog();  
    var sessionuserid=req.user.userid;
    logger.emit("log","sessionid:"+sessionuserid);
    blog.removeAllListeners("failedGetBlogForProduct");
    blog.on("failedGetBlogForProduct",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // blog.removeAllListeners();
      res.send(err);
    });
    blog.removeAllListeners("successfulGetBlogForProduct");
    blog.on("successfulGetBlogForProduct",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // blog.removeAllListeners();
      res.send(result);
    });
    blog.getBlogForProduct(prodle,blogid,sessionuserid);
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

    if(req.user.author.isAuthor==false){
      // logger.emit("error","You are not an author to update blog data",sessionuserid);
      blog.emit("failedDeleteBlog",{"error":{"code":"EA001","message":"You are not an author to update blog data"}});
    }else{
      blog.deleteBlog(authorid,blogid,sessionuserid);
    }
}

exports.deleteBlogImage=function(req,res){ 
  var sessionuserid=req.user.userid;  
  var blogimageids=req.query.blogimageids;
  var authorid = req.params.authorid;
  var blogid = req.params.blogid;
  logger.emit("log","sessionuserid : "+sessionuserid+"blogid : "+blogid+"blogimageids : "+JSON.stringify(blogimageids));
  
  var blog= new Blog();
  blog.removeAllListeners("failedDeleteBlogImage");
  blog.on("failedDeleteBlogImage",function(err){
    // logger.emit("log","error:"+err.error.message+":"+sessionuserid);
    logger.emit("error", err.error.message,sessionuserid);
    // product.removeAllListeners();
    res.send(err);
     // eventEmitter.removeListener(this);
  });
  blog.removeAllListeners("successfulDeleteBlogImage");
  blog.on("successfulDeleteBlogImage",function(result){
    //logger.emit("log","Getting Product details successfully");
    // logger.emit("info", result.success.message,sessionuserid);
    // product.removeAllListeners();

    res.send(result);
    // eventEmitter.removeListener(this);
  });

  if(req.user.author.isAuthor==false){
    logger.emit("log","You are not author to delete blog image");
    blog.emit("failedDeleteBlogImage",{"error":{"code":"EA001","message":"You are not authorized to delete blog image"}}); 
  }else{
    ///////////////////////////////////////////////////
    blog.deleteBlogImage(blogimageids,authorid,blogid);
    ///////////////////////////////////////////////////
  }
}