var mongoose = require('../../common/js/db');
var ObjectId = mongoose.Schema.ObjectId;
var shortId = require('shortid');
var orgindustrycategorySchema = mongoose.Schema({
	id:{type:String},
	categoryname:{type:String,unique:true,lowercase:true},
});
orgindustrycategorySchema.pre('save', function(next) {
  var orgindustrycategory = this;
  orgindustrycategory.id=shortId.generate();  
  // console.log();
  next(); 
  })
var OrgIndustryCategory = mongoose.model('orgindustrycategories', orgindustrycategorySchema);

//export model schema
module.exports=OrgIndustryCategory;
