var api = require("../api/api.js");
var auth=require('../common/js/security');
// Blog - REST apis
exports.init = function (app) {
  app.post("/api/testimonial/:orgid/:prodle",auth,api.testimonialapi.addTestimonial)
  app.get('/api/testimonialaction/:testimonialid',auth,api.testimonialapi.testimonialAction)
  app.get('/api/testimonial/:prodle',auth,api.testimonialapi.getTestimonialForProduct);
}
