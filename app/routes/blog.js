var api = require("../api/api.js");
var auth=require('../common/js/security');
// Blog - REST apis
exports.init = function (app) {
  //Blog CRUD

  	app.post("/api/author",auth,api.blogapi.authorRegistration);//author registration
	app.get("/api/author",auth,api.blogapi.getAllRegistration);//get author registration for admin screen
	app.put("/api/author/:authorid",auth,api.blogapi.authorAcceptance);//author acceptance by admin screen

	app.post("/api/blog",auth,api.blogapi.addBlog);//add new blog
	// app.get("/api/blog");//get product name
	app.put("/api/blog/:authorid/:blogid",auth,api.blogapi.updateBlog);//update blog	
  	app.get("/api/blog/:authorid/:authorid",auth,api.blogapi.getBlog);//get blog
  	app.get("/api/blog/:authorid",auth,api.blogapi.getAllBlogs);//get all blogs
	app.delete("/api/blog/:authorid/:blogid",auth,api.blogapi.deleteBlog);//delete blog
	
}
