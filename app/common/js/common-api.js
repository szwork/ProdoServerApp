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
var fs = require('fs');
var FileUploadModel=require("./file-upload-model");
var AWS = require('aws-sdk');
var exec = require('child_process').exec;

var path=require("path");
var OrgModel=require("../../org/js/org-model");
var ProductModel=require("../../product/js/product-model");
var UserModel=require("../../user/js/user-model");
var smtpTransport = nodemailer.createTransport("SMTP", {
    host: "smtp.giantleapsystems.com", // hostname
    secureConnection: true, // use SSL
    port: 465, // port for secure SMTP
    auth: {
        user: "sunil@giantleapsystems.com",
        pass: "Sunil12345"
      }
});
// AWS.config.region = 'ap-southeast-1';
// AWS.config.AWS_ACCESS_KEY_ID = "AKIAJOGXRBMWHVXPSC7Q";
// AWS.config.AWS_SECRET_ACCESS_KEY = '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';
AWS.config.update({accessKeyId:'AKIAJOGXRBMWHVXPSC7Q', secretAccessKey:'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'});
AWS.config.update({region:'ap-southeast-1'});
var s3bucket = new AWS.S3();
exports.removeListner=function(emitter){
     emitter.removeAllListener(function()
        {
                console.log('removing "message" listener');
        });

}
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
exports.uploadFiles=function(file,dirname,action,callback){
  var file_name=file.filename;
  var file_buffer=file.filebuffer;
  var file_length=file.filelength;  
  var file_type=file.filetype;

  var fileName = dirname + '/tmp/uploads/' + file_name;
  fs.open(fileName, 'a', 0755, function(err, fd) {
    if (err) {
      callback(err)
    }else{
      var ext = path.extname(fileName||'').split('.');
      ext=ext[ext.length - 1];
      console.log("buffer size"+file_buffer.size);
      console.log("file extension"+ext);
      fs.write(fd, file_buffer, null, 'Binary', function(err, written, writebuffer) {
        if(err){
          callback(err);
        }else{
          console.log(written+" bytes are written from buffer");
          var s3filekey=Math.floor((Math.random()*1000)+1)+"."+ext;
           var bucketFolder;
           var params;
          if(action.user!=undefined){//user upload
             bucketFolder="prodonus/user/"+action.user.userid;
             params = {
                         Bucket: bucketFolder,
                         Key: action.user.userid+s3filekey,
                         Body: writebuffer,
                         //ACL: 'public-read-write',
                         ContentType: file_type
                };
             userFileUpload(action.user.userid,params,function(err,imagelocation){
              fs.close(fd, function() {
                 exec("rm -rf '"+fileName+"'");
                  console.log('File user saved successful!');
               });
              if(err){
                callback(err);
              }else{
                callback(null,imagelocation);
              }
            })
          }else if(action.org!=undefined){//organization upload
            console.log("organization image upload");
             bucketFolder="prodonus/org/"+action.org.orgid;

             console.log("key"+action.org.orgid+s3filekey);
             params = {
                         Bucket: bucketFolder,
                         Key: action.org.orgid+s3filekey,
                         Body: writebuffer,
                         //ACL: 'public-read-write',
                         ContentType: file_type
                };
             orgFileUpload(action.org.orgid,params,function(err,imagelocation){
                if(err){
                  console.log("org upload error"+err);
                   callback(err);
                }else{
                  callback(null,imagelocation);
                }
                fs.close(fd, function() {
                  exec("rm -rf '"+fileName+"'");
                    console.log('File saved successful!');
                  });
             })
          }else{//product uploads
             bucketFolder="prodonus/org/"+action.product.orgid+"/product/"+action.product.prodle;
             params = {
                         Bucket: bucketFolder,
                         Key: action.product.orgid+action.product.prodle+s3filekey,
                         Body: writebuffer,
                         //ACL: 'public-read-write',
                         ContentType: file_type
                };
             productFileUpload(action.product.prodle,params,function(err,imagelocation){
              if(err){
                console.log("product fileupload error"+err);
                callback(err);
              }else{
                callback(null,imagelocation);
              }
              fs.close(fd, function() {
                 exec("rm -rf '"+fileName+"'");
                    console.log('File saved successful!');
                  });
             })
          }
          ///////S3-AMAZON BUCKET/////
        
        }
      });
    }
  })
}

var userFileUpload=function(userid,awsparams,callback){
  s3bucket.putObject(awsparams, function(err, data) {
    if (err) {
      console.log(err)
      callback(err)
    } else {
      logger.emit("log","fileupload saved");
      var params1 = {Bucket: awsparams.Bucket, Key: awsparams.Key,Expires: 60*60*24*365};
      s3bucket.getSignedUrl('getObject',params1, function (err, url) {
        if(err){
          logger.emit("error","Error in getting getSignedUrl"+err);
          callback(err);
        }else{
          var newprofileurl=url;
          console.log("url"+newprofileurl);
          UserModel.update({userid:userid},{$set:{profile_pic:newprofileurl}},function(err,profilepicupdatestatus){
            if(err){
              callback(err);
            }else if(profilepicupdatestatus==1){
              callback(null,newprofileurl)
            }else{
              callback("provided is wrong");
            }
          })
        }
      });
    }
  }) 
}
var orgFileUpload=function(orgid,awsparams,callback){
 s3bucket.putObject(awsparams, function(err, data) {
    if (err) {
      console.log(err)
      callback(err)
    } else {
      logger.emit("log","fileupload saved");
      var params1 = {Bucket: awsparams.Bucket, Key: awsparams.Key,Expires: 60*60*24*365};
      s3bucket.getSignedUrl('getObject', params1, function (err, url) {
        if(err){
          logger.emit("log","Error in getting getSignedUrl"+err);
          callback(err);
        }else{
         // var newprofileurl=url;
          OrgModel.update({orgid:orgid},{$push:{org_images:{image:url}}},function(err,orguploadstatus){
            if(err){
              logger.emit("log","Error in updatin"+err);
              callback(err);
            }else if(orguploadstatus==1){
              callback(null,url)
            }else{
              callback("provided orgid is wrong");
            }
          })
        }
      });
    }
  })  
}
var productFileUpload=function(prodle,awsparams,callback){
  s3bucket.putObject(awsparams, function(err, data) {
    if (err) {
      console.log(err)
      callback(err)
    } else {
      logger.emit("log","fileupload saved");
      var params1 = {Bucket: awsparams.Bucket, Key: awsparams.Key,Expires: 60*60*24*365};
      s3bucket.getSignedUrl('getObject',params1, function (err, url) {
        if(err){
          logger.emit("error","Error in getting getSignedUrl");
          callback(err);
        }else{
          // var newprofileurl=url;

          ProductModel.update({prodle:prodle},{$push:{product_images:{image:url}}},function(err,productuploadstatus){
            if(err){
              callback(err);
            }else if(productuploadstatus==1){
              callback(null,url)
            }else{
              callback("provided prodle is wrong");
            }
          })
        }
      });
    }
  })  
}