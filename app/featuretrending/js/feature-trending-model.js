/*
* Overview: Feature Analytics Model
* Dated:
* Author: Dinesh Sawant
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* Date | author | description 
* ----------------------------------------------------------------------
* 19-02-2014 | xyx | Add a new property
*/

var mongoose = require('../../common/js/db');
var logger = require("../../common/js/logger");

//Feature trending Model
var featureTrendingSchema = mongoose.Schema({
	name:{type:String},
	orgid:{type:String},
  	prodle:{type:String},
  	commentcount:{type:Number,default:0},
  	followedcount:{type:Number,default:0}
});

// featureTrendingSchema.pre('save', function(next) {
//   console.log("calling to trending save pre");  
//   var trend = this;
//   logger.emit("log","trending in pre"+user);
//   trend.name=;
//   trend.orgid=;
//   logger.emit("log","trend"+user.userid);
  
  
// });
//Seed a feature trending
 featureTrendingSchema.set('redisCache', true);
 featureTrendingSchema.set('expires', 90);
 
var FeatureTrending = mongoose.model('featuretrending', featureTrendingSchema);

module.exports = FeatureTrending;