var api = require("../api/api.js");
var auth=require('../common/js/security');

exports.init = function (app) {
  app.delete("/api/comment/:commentid",auth,api.commentapi.deleteComment);//delete product
  app.get("/api/nextcomments/:commentid",auth,api.commentapi.loadMoreComment);

  app.delete("/api/campaigncomment/:commentid",auth,api.commentapi.deleteCampaignComment);//delete product
  app.get("/api/campaign/nextcomments/:commentid",auth,api.commentapi.loadMoreCampaignComment);

  app.get("/api/comment/userinfo/:prodle",auth,api.commentapi.getUserInfoCommentedOnProduct);
}
