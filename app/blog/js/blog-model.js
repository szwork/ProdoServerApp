/*
* Overview: Blog Model
* Dated: 14-May-2014
* Author: Dinesh Sawant
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* 27-3-2013 | xyx | Add a new property 
*/

var mongoose = require('../../common/js/db');
var ObjectId = mongoose.Schema.ObjectId;
var shortId = require('shortid');

var blogSchema = mongoose.Schema({
  blogid:{type:String,unique:true},
  prodle:{type:String,ref:"productSchema"},
  orgid:{type:String},
  authorid:{type:String},
  productname:{type:String,ref:"productTagsSchema"},
  title:{type:String},
  content:{type:String},
  category:[{type:String}],
  blog_images:[{bucket:String,key:String,image:{type:String},imageid:{type:String}}],
  datecreated:{type:Date},
  datepublished:{type:Date},
  dateupdated:{type:Date},
  dateremoved:{type:Date},
  status:{type:String,default:"init"},//init,active,deactive  
});

blogSchema.pre('save', function(next) {
  var blog = this;
  blog.blogid=shortId.generate();  
  console.log("blog pre"+blog);
  next(); 
})

//Seed a Blog
blogSchema.set('redisCache', true);
blogSchema.set('expires', 6000);
blogSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
  return this.collection.findAndModify(query, sort, doc, options, callback);
};

var Blog = mongoose.model('blog', blogSchema);
module.exports = Blog;


// var blogTagsSchema = mongoose.Schema({
//   tagid:{type:String}, 
//   tagname:{type:String}, 
//   tagmantic:{type:String}, 
//   {
//     goodbad:10 //0 ugly and 10 awesome
//   }
//   tagemotic:{type:String}, 
//   { //angry, passion, shy , irritable, dissapointed, happy, feeling great, satisfied, delighted, ecstatic, shocking, difficult, slow, low, fast, 
//     angry: 1
//     ecstatic: 10
//     passion:21
//   }
// });
