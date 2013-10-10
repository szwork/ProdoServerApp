/*
* Overview: verfiy password db Database connections
* Dated:
* Author: Sunil More
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* 27-3-2013 | xyx | Add a new property
* 
*/
var uuid = require('node-uuid');
var mongoose = require('./db');

// Verification token model
var ObjectId = mongoose.Schema.ObjectId;
var verificationTokenSchema = new mongoose.Schema({
    _userId: { type:ObjectId,required: true, ref: 'User' },
    token: { type: String, required: true },
    tokentype:{type:String},
    createddate: { type: Date, required: true, default: Date.now, expires: '4h' },
    status:{type:String,default:"active"}
});

verificationTokenSchema.methods.createVerificationToken = function (done) {
    var verificationToken = this;
    var token = uuid.v4();
    verificationToken.set('token', token);
    verificationToken.save( function (err) {
      if (err){
          return done(err);
      }
      return done(null, token);
      console.log("Verification token", verificationToken);
    });
};

var VerificationTokenModel = mongoose.model('verificationtoken', verificationTokenSchema);
module.exports = VerificationTokenModel;