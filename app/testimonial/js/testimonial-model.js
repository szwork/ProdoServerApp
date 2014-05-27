var mongoose = require('../../common/js/db');
var shortId = require('shortid');
var testimonialSchema = mongoose.Schema({
  testimonialid:{type:String,unique:true},
  orgid:{type:String,ref:"organizations"},
  prodle:{type:String,ref:"products"},
  user:{userid:String,profile_pic:{type:String},orgname:{type:String}},
  text:{type:String},
  displayname:{type:String},
  createdate:{type:Date,default:new Date()},
  status:{type:String,default:"init"}//status init ,accept,deactive by organization user,
});
testimonialSchema.pre('save', function(next) {
  var product = this;
  product.testimonialid=shortId.generate();  
  next(); 
})
testimonialSchema.set('redisCache', true);
testimonialSchema.set('expires', 6000);
var Testimonial = mongoose.model('testimonials', testimonialSchema);

module.exports = Testimonial;