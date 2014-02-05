var api = require("../api/api.js");
var auth=require('../common/js/security');

exports.init = function (app) {
  app.post('/api/tagreffdictionary/addtag',auth,api.tagreffdictionary.addTag);//add new tag
  app.get('/api/tagreffdictionary/getalltag',auth,api.tagreffdictionary.getAllTag);//get all tags
}
