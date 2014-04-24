var api = require("../api/api.js");
var auth=require('../common/js/security');

exports.init = function (app) {
  app.delete("/api/comment/:commentid",auth,api.commentapi.deleteComment);//delete product
  app.get("/api/nextcomments/:commentid",auth,api.commentapi.loadMoreComment);

  //Rest Api for Campaign Comments
  app.get("/api/campaigncomments",auth,api.commentapi.getLatestCampaignComments);
}
