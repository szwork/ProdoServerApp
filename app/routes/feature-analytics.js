var api = require("../api/api.js");
var auth=require('../common/js/security');

exports.init = function (app) {
  app.get('/api/featureanalytics/:prodle',auth,api.featureanalytics.getTagAnalytics);
}
