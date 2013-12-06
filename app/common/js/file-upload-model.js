/*
* Overview: File Upload Model
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
var fileuploadschema = new mongoose.Schema({
  bucket:{type:String},
  key:{type:String}
});



var FileUploadModel = mongoose.model('fileuploads', fileuploadschema);
module.exports = FileUploadModel;
