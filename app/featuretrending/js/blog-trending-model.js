/*
* Overview: Blog Trending Model
* Dated:
* Author: Dinesh Sawant
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* Date | author | description 
* ----------------------------------------------------------------------
* 23-05-2014 | xyx | Add a new property
*/

var mongoose = require('../../common/js/db');
var logger = require("../../common/js/logger");

//Campign Trending Model
var blogTrendingSchema = mongoose.Schema({
	name:{type:String},
	orgid:{type:String},
  	prodle:{type:String},
  	authorid:{type:String},
  	blogid:{type:String},
  	commentcount:{type:Number,default:0},
  	likecount:{type:Number,default:0},
  	status:{type:String,default:"active"}//active,deactive
});

blogTrendingSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
    return this.collection.findAndModify(query, sort, doc, options, callback);
};

//Seed a campaign trending
 blogTrendingSchema.set('redisCache', true);
 blogTrendingSchema.set('expires', 90);
 
var BlogTrending = mongoose.model('blogtrendings', blogTrendingSchema);

module.exports = BlogTrending;