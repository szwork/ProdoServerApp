var mongoose = require('../../common/js/db');
var testimonialSchema = mongoose.Schema({
  orgid:{type:String,ref:"organizations"},
  prodle:{type:String,ref:"products"},
  user:{userid:String,profilepic:{type:String},orgname:{type:String}},
  text:{type:String},
  displayname:{type:String}
});
testimonialSchema.set('redisCache', true);
testimonialSchema.set('expires', 6000);
var Testimonial = mongoose.model('testimonials', testimonialSchema);

module.exports = Testimonial;