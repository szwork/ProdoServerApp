/*
* Overview: common method used 
* Dated:
* Author: Sunil More
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* 27-3-2013 | xyx | Add a new property
* 03-10-2013|sunil|add get brcryptstring method
*/

var nodemailer = require("nodemailer");
//authentication  about send email
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var generateTimeId = require('time-uuid');
var SequenceModel=require('./sequence-model');
var logger=require("./logger");
var smtpTransport = nodemailer.createTransport("SMTP", {
    host: "smtp.giantleapsystems.com", // hostname
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    auth: {
        user: "sunil@giantleapsystems.com",
        pass: "Sunil12345"
      }
});
//get bcrypt string
exports.getbcrypstring=function(data,callback){
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if(err) {
      return next(err);
    }
    bcrypt.hash(data, salt, function(err, hash) {
      if(err) {
        return next(err);
      }
      console.log("hash data"+hash);
      callback(hash)
      });
  });
}
//send an email
exports.sendMail = function(message,callback){
  smtpTransport.sendMail(message, 
 	  function (error, success) {
      if (error){
        // not much point in attempting to send again, so we give up
        // will need to give the user a mechanism to resend verification
        logger.error("Unable to send via Prodonus: " + error.message);
        callback("failure");
      }
      //sending succussful then success
      callback("success"); 
    });
};


exports.getNextSequnce=function(name,callback)
{
console.log("calling to getNextSequnce method");
 SequenceModel.findAndModify(
            { name: name },
            [],
            {$inc: { nextsequence: 1 } },{new:true},function(err,sequencedata)
            {
              if(err)
              {
                console.log(err+"error in sequcne collection");
              }
              console.log("sequencedata"+sequencedata)
              callback(null,sequencedata.nextsequence)

            });
 
  // console.log("return sequence data"+ret);
  
}