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
* 12-11-2013|Sunil|Add a subscription 
*/

var mongoose = require('../../../common/js/db');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var ObjectId = mongoose.Schema.ObjectId;
var commonapi=require('../../../common/js/common-api');

var userSchema = mongoose.Schema({
  userid:{type:String},
  fullname: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String},
  verified: { type:Boolean, default:false },
  orgid: { type:String, ref: 'Organization' },
  subscription:{
        planid:{type:ObjectId,ref:"Subscription"} ,//referencing from Subscription 
        planstartdate:Date , 
        planexpirydate:Date
  }
});

//Encrypt the password when you save.
userSchema.pre('save', function(next) {
	var user = this;
	console.log("userdata in pre"+user);
	//this method will call when invite user that time user has not password
	if(!user.isModified('password')){
		commonapi.getNextSequnce("user",function(err,nextsequnce){
	      console.log(""+nextsequnce);
	      user.userid="u"+nextsequnce;
	      next();
		})
	} else{//this condition call when normal signup
		commonapi.getNextSequnce("user",function(err,nextsequnce){
		    console.log(""+nextsequnce);
		    user.userid="u"+nextsequnce;
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
				})
			})	
		});
	}
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
userSchema.statics.findAndModify = function (query, sort, doc, options, callback) {
    return this.collection.findAndModify(query, sort, doc, options, callback);
};

//Seed a user
var User = mongoose.model('User', userSchema);

module.exports = User;
