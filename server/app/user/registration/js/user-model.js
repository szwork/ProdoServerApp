/*
* Overview: User Model
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

var mongoose = require('../../../common/js/db');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var ObjectId = mongoose.Schema.ObjectId;

var userSchema = mongoose.Schema({
	fullname: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String},
  verified: { type:Boolean, default:false },
  orgid: { type:ObjectId, ref: 'Organization' }
});

//Encrypt the password when you save.
userSchema.pre('save', function(next) {
	var user = this;
	if(!user.isModified('password')){
		return next();
	}

	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if(err) {
			return next(err);
		}
		bcrypt.hash(user.password, salt, function(err, hash) {
			if(err) {
				return next(err);
			}
			user.password = hash;
			next();
		});
	});
});


//Password comparePassword
userSchema.methods.comparePassword = function(candidatePassword, callback) {
	bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
		if(err){ 
			return callback(err);
		}
		callback(null, isMatch);
	});
};

//Seed a user
var User = mongoose.model('User', userSchema);

module.exports = User;
