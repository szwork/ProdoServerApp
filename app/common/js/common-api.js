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
exports.loadsequences=function(req,res){
  var sequencedata=[{
    name: "user",
    nextsequence:0
   },
   {
    name: "organization",
    nextsequence: 0
  }
   ];

      SequenceModel.find({},function(err,sequencedata){
        if(err){
            console.error(err);
        }else if(sequencedata.length==0){
          /* SequenceModel.create(sequencedata,function(err,docs){
            if(err){
              console.log("error in inserting defaulte sequneces");
            }
            else{
              console.log("default sequneces saved");
              console.log("sequencedata"+sequencedata);
              res.send({"success":"initia sequence data saved"});
              //res.send({"success"})
            }
          });*/
      var sequence=new SequenceModel({name:"user",nextsequence:0})
      sequence.save(function(err,docs){

      })

        }else{
          console.log("sequencedata already exists");
          res.send({"error":"sequence data already exists"});
        }
      })
     

}
//get bcrypt string
exports.getbcrypstring=function(data,callback){
  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if(err) {
      callback(err);
    }else{
      bcrypt.hash(data+"", salt, function(err, hash) {
        console.log(err);
        if(err) {
          callback(err);
        }else{
          callback(null,hash)  
        }
      });
    }
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
      }else{
        callback("success"); 
      }
      //sending succussful then success
      
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
                logger.error(err+"error in sequcne collection");
              }
              console.log("sequencedata"+sequencedata)
              callback(null,sequencedata.nextsequence)

            });
 
  // console.log("return sequence data"+ret);
  
}