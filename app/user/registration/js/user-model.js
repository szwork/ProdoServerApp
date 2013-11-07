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
var commonapi=require('../../../common/js/common-api');
var subscription=mongoose.Schema(
{

        planid:{type:ObjectId,ref:"Subscription"} ,//individdual
        planstartdate:Date , 
        planexpirydate:Date
        
});
var userSchema = mongoose.Schema({
  _id:{type:String},
  fullname: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String},
  verified: { type:Boolean, default:false },
  orgid: { type:String, ref: 'Organization' },
  subscription:[subscription]
});

//Encrypt the password when you save.
userSchema.pre('save', function(next) {
	var user = this;
	console.log("userdata in pre"+user);
	
	if(!user.isModified('password')){
		if(user.orgid){
      		  	commonapi.getNextSequnce("user",function(err,nextsequnce){
      		  	console.log(""+nextsequnce);
      		  	user._id="uo"+nextsequnce;	
				next();	
      		  	})
      		  
      		  	
    		} else{
        	  		commonapi.getNextSequnce("user",function(err,nextsequnce){
      		  	console.log(""+nextsequnce);
      		  	user._id="ui"+nextsequnce;	
      		  	next();	
      		  	});
      		  
    		}
	
	} else{
			if(user.orgid){
      		  	commonapi.getNextSequnce("user",function(err,nextsequnce){
      		  	console.log(""+nextsequnce);
      		  	user._id="uo"+nextsequnce;	
				//next();	
      		  	})
      		  
      		  	
    		} else{
        	  		commonapi.getNextSequnce("user",function(err,nextsequnce){
      		  	console.log(""+nextsequnce);
      		  	user._id="ui"+nextsequnce;	
      		  	//next();	
      		  	});
      		  
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
