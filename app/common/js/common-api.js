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

var logger=require("./logger");
var fs = require('fs');

var AWS = require('aws-sdk');
var exec = require('child_process').exec;
var generateId = require('time-uuid');
var path=require("path");
var OrgModel=require("../../org/js/org-model");
var ProductModel=require("../../product/js/product-model");
var CONFIG = require('config').Prodonus;
var UserModel=require("../../user/js/user-model");
// var smtpTransport = nodemailer.createTransport("SMTP", {
//     host: "smtp.ipage.com", // hostname
//     secureConnection: false, // use SSL
//     port: 587, // port for secure SMTP
//     auth: {
//         user: "app@prodonus.com",
//         pass: "App12345$"
//     }
// });

// var smtpTransport = nodemailer.createTransport("SES", {
//     AWSAccessKeyID: "AKIAJ2BXGCZW2235YKYA",
//     AWSSecretKey: "AsgYdCF/B5jGGyXezogxbrrbOZMgK4WAwuxJyj+tf8G/"
// });
// AWS.config.region = 'ap-southeast-1';
// AWS.config.AWS_ACCESS_KEY_ID = "AKIAJOGXRBMWHVXPSC7Q";
// AWS.config.AWS_SECRET_ACCESS_KEY = '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';
AWS.config.update({accessKeyId:'AKIAJOGXRBMWHVXPSC7Q', secretAccessKey:'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'});
AWS.config.update({region:'ap-southeast-1'});
var s3bucket = new AWS.S3();

// exports.sendTestMail=function(req,res){
//    var message = {
//       from: "Sunil More  <sunil@giantleapsystems.com>", // sender address
//       to: "sunilmore690@gmail.com, sunilmore6490@gmail.com", // list of receivers
//       subject: "Hello ", // Subject line
//       // text: "Hello world ", // plaintext body
//       html: "<b>Hello world </b>" // html body
//     }
//     smtpTransport.sendMail(message, 
//     function (error, success) {
//       if (error){
//         // not much point in attempting to send again, so we give up
//         // will need to give the user a mechanism to resend verification
//         logger.error("Unable to send via Prodonus: " + error.message);
//         //callback("failure");
//         res.send(error);
//       }else{
//         res.send(success);
//       }
//       //sending succussful then success
//     });
// }
// exports.loadsequences=function(req,res){
//   var sequencedata=[{
//     name: "user",
//     nextsequence:0
//    },
//    {
//     name: "organization",
//     nextsequence: 0
//   }
//    ];

//       SequenceModel.find({},function(err,sequencedata){
//         if(err){
//             console.error(err);
//         }else if(sequencedata.length==0){
//            SequenceModel.create(sequencedata,function(err,docs){
//             if(err){
//               console.log("error in inserting defaulte sequneces");
//             }
//             else{
//               console.log("default sequneces saved");
//               console.log("sequencedata"+sequencedata);
//               res.send({"success":"initia sequence data saved"});
//               //res.send({"success"})
//             }
//           });
//       var sequence=new SequenceModel({name:"user",nextsequence:0})
//       sequence.save(function(err,docs){

//       })

//         }else{
//           console.log("sequencedata already exists");
//           res.send({"error":"sequence data already exists"});
//         }
//       })
     

// }
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
exports.sendMail = function(message,smtpconfig,callback){
  var smtpTransport = nodemailer.createTransport("SMTP",smtpconfig);
  smtpTransport.sendMail(message, 
 	  function (error, success) {
      if(error){
        logger.error("Unable to send via Prodonus: " + error.message);
        callback("failure");
      }else{
        logger.emit("log","email sent");
       callback("success"); 
      }
      //sending succussful then success
      
    });
};


// exports.getNextSequnce=function(name,callback)
// {
//   console.log("calling to getNextSequnce method");
//   SequenceModel.findAndModify(
//             { name: name },
//             [],
//             {$inc: { nextsequence: 1 } },{new:true},function(err,sequencedata)
//             {
//               if(err)
//               {
//                 logger.error(err+"error in sequcne collection");
//               }
//               console.log("sequencedata"+sequencedata)
//               callback(null,sequencedata.nextsequence)

//             });
 
//   // console.log("return sequence data"+ret);
  
// }
exports.uploadFiles=function(io,__dirname){
  io.of('/api/prodoupload').on('connection', function(socket) {
    var sessionuserid=socket.handshake.user.userid;
    ///action for user profile update
     //action:{user:{userid:}}
     //action for org images upload
     //action:{org:{userid:,orgid:}}
     //action for product images upload
     //action:{product:{userid:,orgid:,prodle:}}
    
    socket.on('uploadFiles', function(file,action) {
      console.log("calling to Upload files");
      ///////////////
      if(action.product==undefined || action.org==undefined || action.user==undefined ||action.productlogo==undefined){
        logger.emit("error","uploadFiles dont't know action");
      }else if(file==undefined ){ 
        if(action.user!=undefined){
          socket.emit("userUploadResponse",{"error":{"message":"Please pass file details or action details"}});
        }else if(action.org!=undefined){
          socket.emit("orgUploadResponse",{"error":{"message":"Please pass file details or action details"}});
        }else if(action.product!=undefined){
          socket.emit("productUploadResponse",{"error":{"message":"Please pass file details or action details"}});
        }else{
          socket.emit("productLogoResponse",{"error":{"message":"Please pass file details or action details"}});
        } 
      }else{
        uploadFile(file,__dirname,action,function(err,uploadresult){
          if(err){
            logger.emit("error",err.message,sessionuserid)
            if(action.user!=undefined){
               socket.emit("userUploadResponse",err);
            }else if(action.org!=undefined){
              socket.emit("orgUploadResponse",err);
            }else if(action.product!=undefined){
              socket.emit("productUploadResponse",err);
            }else{
               socket.emit("productUploadLogoResponse",err);
            }
          }else{
            if(action.user!=undefined){
               socket.emit("userUploadResponse",null,uploadresult);
            }else if(action.org!=undefined){
              socket.emit("orgUploadResponse",null,uploadresult);
            }else if(action.product!=undefined){
              socket.emit("productUploadResponse",null,uploadresult);
            }else if(action.productlogo!=undefined){
              socket.emit("productUploadLogoResponse",null,uploadresult);
            }
          }
       })
      }
    })
  })
}

uploadFile=function(file,dirname,action,callback){
  var file_name=file.filename;
  var file_buffer=file.filebuffer;
  var file_length=file.filelength;  
  var file_type=file.filetype;

  var fileName = dirname + '/tmp/uploads/' + file_name;
  fs.open(fileName, 'a', 0755, function(err, fd) {
    if (err) {
      callback({"error":{"message":"uploadFile fs.open:"+err}})
    }else{
      var ext = path.extname(fileName||'').split('.');
      ext=ext[ext.length - 1];
      console.log("buffer size"+file_buffer.size);
      console.log("file extension"+ext);
      fs.write(fd, file_buffer, null, 'Binary', function(err, written, writebuffer) {
        if(err){
          callback({"error":{"message":"uploadFile fs.write:"+err}})
        }else{
          console.log(written+" bytes are written from buffer");
          var s3filekey=Math.floor((Math.random()*1000)+1)+"."+ext;
           var bucketFolder;
           var params;
           writebuffer= new Buffer(file_buffer, "base64");
          if(action.user!=undefined){//user upload
             bucketFolder="prodonus/user/"+action.user.userid;
             params = {
                         Bucket: bucketFolder,
                         Key: action.user.userid+s3filekey,
                         Body: writebuffer,
                         //ACL: 'public-read-write',
                         ContentType: file_type
                };
             userFileUpload(action.user.userid,params,function(err,result){
              fs.close(fd, function() {
                 exec("rm -rf '"+fileName+"'");
                  console.log('File user saved successful!');
               });
              if(err){
                callback(err);
              }else{
                callback(null,result);
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
              orgFileUpload(action.org.orgid,params,function(err,result){
                if(err){
                  callback(err);
                }else{
                  callback(null,result);
                }
                fs.close(fd, function() {
                  exec("rm -rf '"+fileName+"'");
                    console.log('File saved successful!');
                  });
             })
          }else if(action.product!=undefined){//product uploads
             bucketFolder="prodonus/org/"+action.product.orgid+"/product/"+action.product.prodle;
             params = {
                         Bucket: bucketFolder,
                         Key: action.product.orgid+action.product.prodle+s3filekey,
                         Body: writebuffer,
                         //ACL: 'public-read-write',
                         ContentType: file_type
                };
             productFileUpload(action.product.prodle,params,function(err,result){
              if(err){
                callback(err);
              }else{
                callback(null,result);
              }
              fs.close(fd, function() {
                 exec("rm -rf '"+fileName+"'");
                    console.log('File saved successful!');
                  });
             })
          }else if(action.productlogo!=undefined){//product logo upload
                bucketFolder="prodonus/org/"+action.productlogo.orgid+"/product/"+action.productlogo.prodle;
               params = {
                         Bucket: bucketFolder,
                         Key: action.productlogo.orgid+action.productlogo.prodle+s3filekey,
                         Body: writebuffer,
                         //ACL: 'public-read-write',
                         ContentType: file_type
                };
             productLogoUpload(action.productlogo.prodle,params,function(err,result){
              if(err){
                callback(err);
              }else{
                callback(null,result);
              }
              fs.close(fd, function() {
                 exec("rm -rf '"+fileName+"'");
                    console.log('File saved successful!');
                  });
             })

          }else{
            logger.emit("error","File Upload doen't understand which action to perform");
          }
        }
      });
    }
  })
}

var userFileUpload=function(userid,awsparams,callback){
  s3bucket.putObject(awsparams, function(err, data) {
    if (err) {
      callback({"error":{"message":"s3bucket.putObject:-userFileUpload"+err}})
    } else {
      var params1 = {Bucket: awsparams.Bucket, Key: awsparams.Key,Expires: 60*60*24*365};
      s3bucket.getSignedUrl('getObject',params1, function (err, url) {
        if(err){
          // logger.emit("error","userFileUpload:Error in getting getSignedUrl"+err);
          callback({"error":{"message":"userFileUpload:Error in getting getSignedUrl"+err}});
        }else{
          var newprofileurl=url;
        
          UserModel.update({userid:userid},{$set:{profile_pic:newprofileurl}},function(err,profilepicupdatestatus){
            if(err){
              callback({"error":{"code":"EDOO1","message":"userFileUpload:Dberror"+err}});
            }else if(profilepicupdatestatus==1){
              callback(null,{"success":{"message":"User Profile Pic Updated Successfully","image":newprofileurl}})
            }else{
              callback({"error":{"code":"AU003","message":"Provided userid is wrong"+userid}});
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
      callback({"error":{"message":"s3bucket.putObject:-orgFileUpload"+err}})
    } else {
      logger.emit("log","fileupload saved");
      var params1 = {Bucket: awsparams.Bucket, Key: awsparams.Key,Expires: 60*60*24*365};
      s3bucket.getSignedUrl('getObject', params1, function (err, url) {
        if(err){
          callback({"error":{"message":"orgFileUpload:Error in getting getSignedUrl"+err}});
        }else{
         // var newprofileurl=url;
         var image_data={image:url,imageid:generateId()}
          OrgModel.update({orgid:orgid},{$push:{org_images:image_data}},function(err,orguploadstatus){
            if(err){
              callback({"error":{"code":"EDOO1","message":"orgFileUpload:Dberror"+err}});
            }else if(orguploadstatus==1){
              callback(null,{"success":{"message":"Org images uploaded Successfully"}})
            }else{
              callback({"error":{"code":"AO002","message":"Wrong orgid"+orgid}});
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
      callback({"error":{"message":"s3bucket.putObject:-productFileUpload"+err}})
    } else {
      logger.emit("log","fileupload saved");
      var params1 = {Bucket: awsparams.Bucket, Key: awsparams.Key,Expires: 60*60*24*365};
      s3bucket.getSignedUrl('getObject',params1, function (err, url) {
        if(err){
          callback({"error":{"message":"productFileUpload:Error in getting getSignedUrl"+err}});
        }else{
          var image_data={image:url,imageid:generateId()}
          ProductModel.update({prodle:prodle},{$push:{product_images:image_data}},function(err,productuploadstatus){
            if(err){
              callback({"error":{"code":"EDOO1","message":"orgFileUpload:Dberror"+err}});
            }else if(productuploadstatus==1){
              callback(null,{"success":{"message":"Product images uploaded Successfully"}})
            }else{
              callback({"error":{"code":"AP001","message":"Wrong prodle"+prodle}});
            }
          })
        }
      });
    }
  })  
}
var productLogoUpload=function(prodle,awsparams,callback){
  s3bucket.putObject(awsparams, function(err, data) {
    if (err) {
      callback({"error":{"message":"s3bucket.putObject:-productLogoUpload"+err}})
    } else {
      logger.emit("log","fileupload saved");
      var params1 = {Bucket: awsparams.Bucket, Key: awsparams.Key,Expires: 60*60*24*365};
      s3bucket.getSignedUrl('getObject',params1, function (err, url) {
        if(err){
          callback({"error":{"message":"productLogoUpload:Error in getting getSignedUrl"+err}});
        }else{
          ProductModel.update({prodle:prodle},{$set:{product_logo:url}},function(err,productuploadstatus){
            if(err){
              callback({"error":{"code":"EDOO1","message":"orgFileUpload:Dberror"+err}});
            }else if(productuploadstatus==1){
              callback(null,{"success":{"message":"Product images uploaded Successfully","image":url}})
            }else{
              callback({"error":{"code":"AP001","message":"Wrong prodle"+prodle}});
            }
          })
        }
      });
    }
  })  
}
