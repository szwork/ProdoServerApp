/*
* Overview: Product Comments Model
* Dated: 24-Nov-2013
* Author: Ramesh Kunhiraman
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* 27-3-2013 | xyx | Add a new property 
*/

var mongoose = require('../../common/js/db');
var ObjectId = mongoose.Schema.ObjectId;
var commonapi=require('../../common/js/common-api');
var shortId = require('shortid');
var logger = require("../../common/js/logger")


var blogTagsSchema = mongoose.Schema({
  tagid:{type:String}, 
  tagname:{type:String}, 
  tagmantic:{type:String}, 
  {
    goodbad:10 //0 ugly and 10 awesome
  }
  tagemotic:{type:String}, 
  { //angry, passion, shy , irritable, dissapointed, happy, feeling great, satisfied, delighted, ecstatic, shocking, difficult, slow, low, fast, 
    angry: 1
    ecstatic: 10
    passion:21
  }

});

var blogCommentSchema = mongoose.Schema({
  commentid:{type:String}, 
  commentby:{type:String}, 
  profilepicpath:{type:String}, 
  username:{type:String}, 
  productid:{type:String, ref:"productTagsSchema"}
  status:{type:String}, 
  datecreated:{type:String}, 
  dateremoved:{type:String}, 
  commenttext:{type:String},
  tags:{type:String}, 
  commentby:{type:String}, 
  orgid:{type:String}, 
  companyname:{type:String},   
  groupname:{type:String}, 
  usergeneratedimages:{type:String}, 
  orgid:{type:String}, 
  companyname:{type:String}, 
  replyComments: [{commentid:{type:String}, }]
});

//Seed a product
var Blog = mongoose.model('Blog', BlogSchema);

module.exports = Blog;

=====
BLOG
=====
{
 _id: ObjectId(...)),
metadata: {
	nonce: ObjectId(...),
	type: 'bblogasic-page'
	parent_id: ObjectId(...),
	slug: 'about',
	title: 'About Us',
	created: ISODate(...),
	author: { _id: ObjectId(…), name: 'Rick' },
	blogtags: [ ... ],
	detail: { text: '# About Us\n...' }
	}
}
votes:
voterids: []
reviewtags:[]