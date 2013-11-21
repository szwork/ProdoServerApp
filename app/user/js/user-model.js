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

var mongoose = require('../../common/js/db');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var ObjectId = mongoose.Schema.ObjectId;
var commonapi=require('../../common/js/common-api');
var shortId = require('shortid');
var logger=require("../../common/js/logger")
var userSchema = mongoose.Schema({
  userid:{type:String},
  fullname:{type:String},
  firstname: { type: String },
  lastname:{type:String},
  dob:{type:Date},
  gender:{type:String},
  phone:{type:String},
  mobile:{type:String},
  email: { type: String, required: true, unique: true },
  password: { type: String},
  isOtpPassword:{type:Boolean,default:false},
  verified: { type:Boolean, default:false },//after verifying email sets true
  address:{
  	address1:{type:String},
    address2:{type:String},
  	address3:{type:String},
  	city:{type:String},
  	state:{type:String},
  	country:{type:String},
  	zipcode:{type:String}
   },
  orgid: { type:String, ref: 'Organization'},
  isAdmin:{type:Boolean,default:false},
  subscription:{
        planid:{type:ObjectId,ref:"Subscription"} ,//referencing from Subscription 
        planstartdate:{type:Date} , 
        planexpirydate:{type:Date}
  },
  payment:{paymentid:{type:String,ref:"payment"}},
  payment_history:{paymentid:{type:String,ref:"payment"}},
  products_followed: [{prodle:{type:String,ref:"product"}}], //list of prodle - product ids handles #12934xyz
  products_recommends:[{prodle:{type:String,ref:"product"} , rating:{type:String} ,repeat_value:{type:String}}], //list of prodles
  status:{type:String,default:"active"},
  terms:{type:Boolean}

});

//Encrypt the password and generate the idwhen you save.
userSchema.pre('save', function(next) {
	var user = this;
	logger.emit("log","userdata in pre"+user);
	user.userid="u"+shortId.generate();
	logger.emit("log","shortid"+user.userid);
	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
		if(err) {
			return next(err);
		}
		bcrypt.hash(user.password, salt, function(err, hash) {
			if(err) {
				return next(err);
			}
			user.password = hash;
			logger.emit("log","password"+user.password);
			next();
		})
	})	
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
