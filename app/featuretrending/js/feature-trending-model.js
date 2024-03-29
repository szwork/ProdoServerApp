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
  	followedcount:{type:Number,default:0},
  	recommendcount:{type:Number,default:0},
  	org_category:[{type:String}],
  	status:{type:String,default:"active"}//active,deactive
});
//Seed a feature trending
 featureTrendingSchema.set('redisCache', true);
 featureTrendingSchema.set('expires', 90);
 
var FeatureTrending = mongoose.model('featuretrending', featureTrendingSchema);

module.exports = FeatureTrending;