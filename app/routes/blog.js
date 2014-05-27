var api = require("../api/api.js");
var auth=require('../common/js/security');
// Blog - REST apis
exports.init = function (app) {
  //Blog CRUD

  	app.post("/api/author",auth,api.blogapi.authorRegistration);//author registration
	app.get("/api/author",auth,api.blogapi.getAllRegistration);//get author registration for admin screen
	app.put("/api/author/acceptance/:authorid/:userid",auth,api.blogapi.authorAcceptance);//author acceptance by admin screen
	app.put("/api/author/rejection/:authorid/:userid",auth,api.blogapi.authorRejection);//author rejection by admin screen

	app.post("/api/blog/:prodle",auth,api.blogapi.addBlog);//add new blog
	app.get("/api/productname/:authorid",auth,api.blogapi.getProductNameByCategory);//get product name
	app.put("/api/blog/:authorid/:blogid",auth,api.blogapi.updateBlog);//update blog	
  app.get("/api/blog/:authorid/:blogid",auth,api.blogapi.getBlog);//get blog
  app.get("/api/blog/:authorid",auth,api.blogapi.getAllBlogs);//get all blogs
  app.get("/api/productblog/:prodle",auth,api.blogapi.getAllBlogsForProduct);//get all blogs for a product
  app.get("/api/productblog/:prodle/:blogid",auth,api.blogapi.getBlogForProduct);//get blog for a product
  	app.post("/api/blogpublish/:authorid/:blogid",auth,api.blogapi.publishBlog);//publish blog
  	app.post("/api/bloglike/:authorid/:blogid",auth,api.blogapi.blogLike);//blog likes
  	app.post("/api/blogdislike/:authorid/:blogid",auth,api.blogapi.blogDislike);//blog dislikes
	app.delete("/api/blog/:authorid/:blogid",auth,api.blogapi.deleteBlog);//delete blog
	app.delete("/api/blog/image/:authorid/:blogid",auth,api.blogapi.deleteBlogImage);//delete blog images
}
