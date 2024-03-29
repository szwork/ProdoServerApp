/* Overview: Warranty Data Model
* Dated:
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
var commonapi = require('../../common/js/common-api');
var shortId = require('shortid');
var logger = require("../../common/js/logger");

/////////////////////////////
//Product Warranty Data Model
var warrantySchema = mongoose.Schema({
  warranty_id:{type:String},
  warranty_type:{type:String},//extended or standard
  prodle:{type:String},
  orgid:{type:String},
  orgname:{type:String},
  name:{type:String},
  model_name:{type:String},
  model_no:{type:String},
  serial_no:{type:String},  
  purchase_date:{type:Date},
  expirydate:{type:Date},
  
  purchase_location:{city:{type:String},country:{type:String}},
  invoice_image:{bucket:{type:String},key:String,image:{type:String},filetype:String},
  status:{type:String,default:"active"},
  modified_date:{type:Date},
  createddate:{type:Date,default:Date.now},
  removedate:{type:Date},
  userid:{type:String,ref:"User"},
  description:{type:String},  
});

warrantySchema.pre('save', function(next) {
  var warranty = this;
  warranty.warranty_id = shortId.generate();  
  // console.log("Warranty pre " + warranty);
  next(); 
})

//Seed a warranty
warrantySchema.set('redisCache', true);
warrantySchema.set('expires', 6000);

var Warranty = mongoose.model('Warranty', warrantySchema);
module.exports = Warranty;