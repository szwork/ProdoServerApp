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
  firstname: { type: String },
  lastname:{type:String},
  dob:{type:Date},
  gender:{type:String},
  phone:{type:String},
  mobile:{type:String},
  email: { type: String, required: true, unique: true },
  password: { type: String},
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
  orgid: { type:String, ref: 'Organization' },
  subscription:{
        planid:{type:ObjectId,ref:"Subscription"} ,//referencing from Subscription 
        planstartdate:{type:Date} , 
        planexpirydate:{type:Date}
  },
  payment:{paymentid:{type:String,ref:"payment"}},
  payment_history:{paymentid:{type:String,ref:"payment"}},
  products_followed: [{prodle:{type:String,ref:"product"}}], //list of prodle - product ids handles #12934xyz
  proucts_recommends:[{prodle:{type:String,ref:"product"} , rating:{type:String} ,repeat_value:{type:String}}], //list of prodles
  status:{type:String,default:"active"}

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
