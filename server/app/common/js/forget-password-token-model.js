/*
* Overview: Forgot password db Database connections
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

var forgotPasswordTokenSchema = new mongoose.Schema({
    _userId: { type:ObjectId,required: true, ref: 'User' },
    token: { type: String, required: true },
    createdAt: { type: Date, required: true, default: Date.now, expires: '4h' },
    status: { type:String,default:"active" }
});

forgotPasswordTokenSchema.methods.createForgotPasswordToken = function (done) {
    var forgotPasswordToken = this;
    var token = uuid.v4();
    forgotPasswordToken.set('token', token);
    forgotPasswordToken.save( function (err) {
      if (err){
        return done(err);
      }
      return done(null, token);
      console.log("Verification token", forgotPasswordToken);
    });
};

var ForgotPasswordTokenModel = mongoose.model('ForgotPasswordToken', forgotPasswordTokenSchema);
module.exports = ForgotPasswordTokenModel;
