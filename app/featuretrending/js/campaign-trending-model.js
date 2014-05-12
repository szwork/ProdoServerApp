/*
* Overview: Campaign Trending Model
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

//Campign Trending Model
var campaignTrendingSchema = mongoose.Schema({
	name:{type:String},
	orgid:{type:String},
  	prodle:{type:String},
  	campaign_id:{type:String},
  	commentcount:{type:Number,default:0},
  	followedcount:{type:Number,default:0},
  	status:{type:String,default:"active"}//active,deactive
});

//Seed a campaign trending
 campaignTrendingSchema.set('redisCache', true);
 campaignTrendingSchema.set('expires', 90);
 
var CampaignTrending = mongoose.model('campaigntrendings', campaignTrendingSchema);

module.exports = CampaignTrending;