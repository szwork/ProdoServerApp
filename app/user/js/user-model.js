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
// var commonapi=require('../../common/js/common-api');
var shortId = require('shortid');
var logger=require("../../common/js/logger")
var userSchema = mongoose.Schema({
  userid:{type:String},
  usertype:{type:String},//type many be individual,company or manufacturer
  fullname:{type:String},
  username:{type:String,required: true, unique: true},
  firstname: { type: String },
  lastname:{type:String},
  dob:{type:Date,default:null},
  gender:{type:String,default:null},
  phone:{type:String,default:null},
  mobile:{type:String,default:null},
  email: { type: String, required: true, unique: true },
  password: { type: String},
  // isOtpPassword:{type:Boolean,default:false},
  verified: { type:Boolean, default:false },//after verifying email sets true
  address:{
    address1:{type:String,default:null},
    address2:{type:String,default:null},
    address3:{type:String,default:null},
    city:{type:String,default:null},
    state:{type:String,default:null},
    country:{type:String,default:null},
    zipcode:{type:String,default:null}
   },
  org:{orgid:{type:String,default:null},orgname:{type:String},orgtype:{type:String,default:null},isAdmin:{type:Boolean,default:null}},
  // orgid: { type:String, ref: 'Organization'}pe,
  // isAdmin:{type:Boolean,default:false},
  subscription:{
    planid:{type:String,ref:"Subscription",default:null} ,//referencing from Subscription 
    planstartdate:{type:Date,default:null} , 
    planexpirydate:{type:Date,default:null},
    discountcode:{type:String,ref:"discount",default:null}
  },
  payment:{paymentid:{type:String,ref:"payment",default:null}},
  payment_history:[{paymentid:{type:String,ref:"payment"}}],
  products_followed: [{prodle:{type:String,ref:"product"},orgid:{type:String,ref:"organizations"}}], //list of prodle - product ids handles #12934xyz
  products_recommends:[{prodle:{type:String,ref:"product"} ,orgid:{type:String,ref:"organizations"}, rating:{type:String} ,repeat_value:{type:String}}], //list of prodles
  status:{type:String,default:"active"},
  terms:{type:Boolean},
  adddate:{ type:Date,default:Date.now },
  updatedate:{ type:Date},
  removedate:{ type:Date},
  profile_pic:{type:String,default:null},
  isAdmin:{type:Boolean,default:false}
});

//Encrypt the password and generate the idwhen you save.
userSchema.pre('save', function(next) {
  console.log("calling to user save pre");  
  var user = this;
  logger.emit("log","userdata in pre"+user);
  user.userid="u"+shortId.generate();
  logger.emit("log","shortid"+user.userid);
  if(user.password!=undefined){
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
  }else{
    next();
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
 userSchema.set('redisCache', true);
  userSchema.set('expires', 90);
//Seed a user
var User = mongoose.model('User', userSchema);
// mongooseRedisCache(mongoose, {
//        host: "localhost",
//        port: "6379"
      
//      })
module.exports = User;
