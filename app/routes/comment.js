var api = require("../api/api.js");
var auth=require('../common/js/security');

exports.init = function (app) {
  app.delete("/api/comment/:commentid",auth,api.commentapi.deleteComment);//delete product
  app.get("/api/nextcomments/:commentid",auth,api.commentapi.loadMoreComment);

  app.delete("/api/campaigncomment/:commentid",auth,api.commentapi.deleteCampaignComment);//delete campaign comment
  app.get("/api/campaign/nextcomments/:commentid",auth,api.commentapi.loadMoreCampaignComment);
  
  app.delete("/api/blogcomment/:commentid",auth,api.commentapi.deleteBlogComment);//delete blog comment
  app.get("/api/blog/nextcomments/:commentid",auth,api.commentapi.loadMoreBlogComment);

  app.post("/api/agreedisagreecomment/:commentid",auth,api.commentapi.agreeDisagreeComment);

  app.get("/api/comment/userinfo/:prodle",auth,api.commentapi.getUserInfoCommentedOnProduct);
}
