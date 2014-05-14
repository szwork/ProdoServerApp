var shortId = require('shortid');
var logger = require("../../common/js/logger");
var mongoose = require('../../common/js/db');
var AgreeDisagreeCommentSchema = mongoose.Schema({
  commentid:{type:String},
  agreeduser:[{type:String}],
  disagreeduser:[{type:String}] 
  
});

AgreeDisagreeCommentSchema.set('redisCache', true);
 AgreeDisagreeCommentSchema.set('expires', 90);
//Seed a product Comment
AgreeDisagreeCommentSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
    return this.collection.findAndModify(query, sort, doc, options, callback);
};
var  AgreeDisagreeComment= mongoose.model('agreedisagreecomments', AgreeDisagreeCommentSchema);

module.exports = AgreeDisagreeComment;