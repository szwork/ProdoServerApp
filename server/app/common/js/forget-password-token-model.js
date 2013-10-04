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
var ForgotPasswordTokenModel = mongoose.model('ForgetPasswordToken', forgotPasswordTokenSchema);
module.exports = ForgotPasswordTokenModel;
