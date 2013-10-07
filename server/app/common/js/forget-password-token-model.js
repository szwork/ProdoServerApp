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
* 03-10-2013| Sunil|creat forgot password token model 
*/
var uuid = require('node-uuid');
var mongoose=require('./db');
//var mongoose = require('mongoose')
// Verification token model
var ObjectId = mongoose.Schema.ObjectId;
var forgotPasswordTokenSchema = new mongoose.Schema({
    _userId: {type:ObjectId,required: true, ref: 'User'},
    token: {type: String, required: true},
    createddate: {type: Date, required: true, default: Date.now, expires: '4h'},
    status:{type:String,default:"active"}
});

forgotPasswordTokenSchema.methods.createforgotPasswordToken = function (done) {
    var forgetPasswordToken = this;
    var token = uuid.v4();
    forgetPasswordToken.set('token', token);
    forgetPasswordToken.save( function (err) {
        if (err) return done(err);
        return done(null, token);
        console.log("Verification token", forgetPasswordToken);
    });
};
var ForgotPasswordTokenModel = mongoose.model('forgetpasswordtoken', forgotPasswordTokenSchema);
module.exports = ForgotPasswordTokenModel;
