/*
* Overview: Sequence Model
* Dated:
* Author: Sunil More
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* 27-3-2013 | xyx | Add a new property
* 08-10-2013|Sunil More|adding new model email template
*/

var mongoose = require('./db');

// Verification token model
var sequenceSchema = new mongoose.Schema({
  name:{type:String}, 
  nextsequence:{type:Number}
});

sequenceSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
  return this.collection.findAndModify(query, sort, doc, options, callback);
};

var SequenceModel = mongoose.model('sequence', sequenceSchema);
module.exports = SequenceModel;
