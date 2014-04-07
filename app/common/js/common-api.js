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
// var resize=require('resize');
var generateId = require('time-uuid');
var path=require("path");
var userModel=require('../../user/js/user-model');
var OrgModel=require('../../org/js/org-model');
var ProductModel=require('../../product/js/product-model');
var WarrantyModel = require('../../warranty/js/warranty-model');
var exec = require('child_process').exec;
var CONFIG = require('config').Prodonus;
var easyimg = require('easyimage');
var img_format_array=["jpeg","JPEG","JPG","GIF","BMP","jpg","gif","bmp"];
var S=require("string");
var amazonbucket=CONFIG.amazonbucket;
var gm = require('gm').subClass({ imageMagick: true });
var redisClient = require("redis").createClient();
// logger.emit("log","userModel"+userModel);
// logger.emit("log","orgModel"+OrgModel);

// // logger.emit("log",Prouc)
// // var userModel=require("../../user/js/user-model");
// // var smtpTransport = nodemailer.createTransport("SMTP", {
// //     host: "smtp.ipage.com", // hostname
// //     secureConnection: false, // use SSL
// //     port: 587, // port for secure SMTP
// //     auth: {
// //         user: "app@prodonus.com",
// //         pass: "App12345$"
// //     }
// // });

// // var smtpTransport = nodemailer.createTransport("SES", {
// //     AWSAccessKeyID: "AKIAJ2BXGCZW2235YKYA",
// //     AWSSecretKey: "AsgYdCF/B5jGGyXezogxbrrbOZMgK4WAwuxJyj+tf8G/"
// // });
// // AWS.config.region = 'ap-southeast-1';
// // AWS.config.AWS_ACCESS_KEY_ID = "AKIAJOGXRBMWHVXPSC7Q";
// // AWS.config.AWS_SECRET_ACCESS_KEY = '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';
AWS.config.update({accessKeyId:'AKIAJOGXRBMWHVXPSC7Q', secretAccessKey:'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'});
AWS.config.update({region:'ap-southeast-1'});
var s3bucket = new AWS.S3();

// // exports.sendTestMail=function(req,res){
// //    var message = {
// //       from: "Sunil More  <sunil@giantleapsystems.com>", // sender address
// //       to: "sunilmore690@gmail.com, sunilmore6490@gmail.com", // list of receivers
// //       subject: "Hello ", // Subject line
// //       // text: "Hello world ", // plaintext body
// //       html: "<b>Hello world </b>" // html body
// //     }
// //     smtpTransport.sendMail(message, 
// //     function (error, success) {
// //       if (error){
// //         // not much point in attempting to send again, so we give up
// //         // will need to give the user a mechanism to resend verification
// //         logger.error("Unable to send via Prodonus: " + error.message);
// //         //callback("failure");
// //         res.send(error);
// //       }else{
// //         res.send(success);
// //       }
// //       //sending succussful then success
// //     });
// // }
// // exports.loadsequences=function(req,res){
// //   var sequencedata=[{
// //     name: "user",
// //     nextsequence:0
// //    },
// //    {
// //     name: "organization",
// //     nextsequence: 0
// //   }
// //    ];

// //       SequenceModel.find({},function(err,sequencedata){
// //         if(err){
// //             console.error(err);
// //         }else if(sequencedata.length==0){
// //            SequenceModel.create(sequencedata,function(err,docs){
// //             if(err){
// //               console.log("error in inserting defaulte sequneces");
// //             }
// //             else{
// //               console.log("default sequneces saved");
// //               console.log("sequencedata"+sequencedata);
// //               res.send({"success":"initia sequence data saved"});
// //               //res.send({"success"})
// //             }
// //           });
// //       var sequence=new SequenceModel({name:"user",nextsequence:0})
// //       sequence.save(function(err,docs){

// //       })

// //         }else{
// //           console.log("sequencedata already exists");
// //           res.send({"error":"sequence data already exists"});
// //         }
// //       })
     

// // }
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
// //send an email
exports.sendMail = function(message,smtpconfig,callback){
  var smtpTransport = nodemailer.createTransport("SMTP",smtpconfig);

  message.html="<div width=500 height=100 style='background-color:black'><img src='http://prodonus.com/assets/images/prodonus.png'></img><h2><font color=white>Social Network And Warranty Platform for Products</font></h2></div><br>"+message.html;
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


// // exports.getNextSequnce=function(name,callback)
// // {
// //   console.log("calling to getNextSequnce method");
// //   SequenceModel.findAndModify(
// //             { name: name },
// //             [],
// //             {$inc: { nextsequence: 1 } },{new:true},function(err,sequencedata)
// //             {
// //               if(err)
// //               {
// //                 logger.error(err+"error in sequcne collection");
// //               }
// //               console.log("sequencedata"+sequencedata)
// //               callback(null,sequencedata.nextsequence)

// //             });
 
// //   // console.log("return sequence data"+ret);
  
// // }
var checkSocketSession=function(redisreply,file,action,callback){
  var socketreply;
  if(action.user!=undefined){ 
    socketreply="userUploadResponse";
  }else if(action.org!=undefined){
    socketreply="orgUploadResponse";
  }else if(action.product!=undefined){
    socketreply="productUploadResponse";    
  }else if(action.orglogo!=undefined){
    socketreply="orgLogoResponse";    
  }else if(action.productlogo!=undefined){
    socketreply="productLogoResponse";
  }else if(action.warranty!=undefined){
    socketreply="warrantyUploadResponse";
  }else if(action.orgkeyclient!=undefined){
     socketreply="orgKeyClientResponse";
  }else{
    socketreply="noemitevent";
  }
  
  // console.log("redisreply"+JSON.parse(redisreply).passport);
  if(redisreply==null){
    callback(socketreply,null)
  }else if(JSON.parse(redisreply).passport.user==undefined){
    callback(socketreply,null)
  }else{
    callback(null,"insession")
  }
}
exports.uploadFiles=function(io,__dirname){
  io.of('/api/prodoupload').on('connection', function(socket) {
    var sessionuserid=socket.handshake.user.userid;
    ///action for user profile update
     //action:{user:{userid:}}
     //action for org images upload
     //action:{org:{userid:,orgid:}}
     //action for product images upload
     //action:{product:{userid:,orgid:,prodle:}}
    // console.log("sessionid"+JSON.stringify(socket.handshake));
    socket.on('uploadFiles', function(file,action) {
      
      redisClient.get("sess:"+socket.handshake.sessionID, function(err, reply) {
        if(err){
          logger.emit("log","Errrr in get sessionid client");
        }else{
          checkSocketSession(reply,file,action,function(err,result){
            if(err){
              socket.emit(err,{"error":{"code":"AL001","message":"User Session Expired"}});
            }else{
              logger.emit("log","File info"+JSON.stringify(file));
              logger.emit("log","action info"+JSON.stringify(action));
              if(action==null || action==undefined){
                 logger.emit("error","uploadFiles doesn't know action");
              }else if(file==undefined ){ 
                if(action.user!=undefined){
                  socket.emit("userUploadResponse",{"error":{"message":"Please pass file details or action details"}});
                }else if(action.org!=undefined){
                  socket.emit("orgUploadResponse",{"error":{"message":"Please pass file details or action details"}});
                }else if(action.product!=undefined){
                  socket.emit("productUploadResponse",{"error":{"message":"Please pass file details or action details"}});
                }else if(action.warranty!=undefined){
                  socket.emit("warrantyUploadResponse",{"error":{"message":"Please pass file details or action details"}});
                }else if(action.orgkeyclient!=undefined){
                  socket.emit("orgKeyClientResponse",{"error":{"message":"Please pass file details or action details"}});
                }else{
                  socket.emit("productLogoResponse",{"error":{"message":"Please pass file details or action details"}});
                }
              }else{
                var user=socket.handshake.user;
                // logger.emit("log","socket session user"+user);
                uploadFile(file,__dirname,action,user,function(err,uploadresult){
                  if(err){
                    logger.emit("error",err.error.message,sessionuserid)
                    if(action.user!=undefined){
                       socket.emit("userUploadResponse",err);
                    }else if(action.org!=undefined){
                      socket.emit("orgUploadResponse",err);
                    }else if(action.product!=undefined){
                      socket.emit("productUploadResponse",err);
                    }else if(action.warranty!=undefined){
                      socket.emit("warrantyUploadResponse",err);
                    }else if(action.productlogo!=undefined){
                      socket.emit("productUploadLogoResponse",err);
                    }else if(action.orgkeyclient!=undefined){ 
                      socket.emit("orgKeyClientResponse",err);
                    }else{
                      socket.emit("orgUploadLogoResponse",err);
                    }
                  }else{
                    if(action.user!=undefined){
                       socket.emit("userUploadResponse",null,uploadresult);
                    }else if(action.org!=undefined){
                      socket.emit("orgUploadResponse",null,uploadresult);
                    }else if(action.product!=undefined){
                      socket.emit("productUploadResponse",null,uploadresult);
                    }else if(action.warranty!=undefined){
                      socket.emit("warrantyUploadResponse",null,uploadresult);
                    }else if(action.productlogo!=undefined){
                      socket.emit("productUploadLogoResponse",null,uploadresult);
                    }else if(action.orglogo!=undefined){
                      socket.emit("orgUploadLogoResponse",null,uploadresult); 
                    }else if(action.orgkeyclient!=undefined){
                      socket.emit("orgKeyClientResponse",null,uploadresult);
                    }
                  }
               })
              }
            }   
          });
        }
      })
    })
  })
}

uploadFile=function(file,dirname,action,sessionuser,callback){
  var file_name=file.filename;
  var file_buffer=file.filebuffer;
  var file_length=file.filelength;  
  var file_type=file.filetype;

  if(action.user!=undefined){//user upload

    __userFileBuffer(action,file,dirname,action,sessionuser,function(err,result){
      if(err){
        callback(err);
      }else{
        callback(null,result)
      }
    })
    
  }else if(action.org!=undefined){//organization upload
    __orgFileBuffer(action,file,dirname,action,sessionuser,function(err,result){
      if(err){
         callback(err)
      }else{
        callback(null,result)
      }
    })
    
  }else if(action.product!=undefined){//product uploads
    __productFileBuffer(action,file,dirname,action,sessionuser,function(err,result){
      if(err){
         callback(err)
      }else{
        callback(null,result)
      }
    })
    
  }else if(action.warranty!=undefined){//warranty uploads

    __warrantyInvoiceImgBuffer(action,file,dirname,action,sessionuser,function(err,result){
      if(err){
         callback(err)
      }else{
        callback(null,result)
      }
    })
    
  }else if(action.productlogo!=undefined){//product logo upload
    __productLogoFileBuffer(action,file,dirname,action,sessionuser,function(err,result){
      if(err){
        callback(err)
      }else{
        callback(null,result)
      }
    })
  }else if(action.orglogo!=undefined){//Organization logo upload
  __orgLogoFileBuffer(action,file,dirname,action,sessionuser,function(err,result){
      if(err){
        callback(err)
      }else{
        callback(null,result)
      }
    })
  }else  if(action.orgkeyclient!=undefined){
    __orgKeyClientFileBuffer(action,file,dirname,action,sessionuser,function(err,result){
      if(err){
        callback(err)
      }else{
        callback(null,result)
      }
    })
  }else{
    logger.emit("error","File Upload doesn't understand which action to perform");
  }
}


var __userFileBuffer=function(action,file,dirname,action,sessionuser,callback){
  var file_name=file.filename;
  var file_buffer=file.filebuffer;
  var file_length=file.filelength;  
  var file_type=file.filetype;
  // logger.emit("log","file details"+JSON.stringify(file));
  var ext = path.extname(file_name||'').split('.');
  ext=ext[ext.length - 1];
  var fileName = dirname + '/tmp/uploads/' + file_name;
  console.log("filename"+fileName);
  logger.emit("log","ext"+file_type);
  if(!S(file_type).contains("image") || !S(file_type).contains("jpeg") && !S(file_type).contains("gif") && !S(file_type).contains("png") ){
    callback({"error":{"message":"You can upload only image of type jpeg or gif"}});
  }else if(file_length>500000){
    callback({"error":{"message":"You can upload  image of size less than 500 kb"}});
  }else{
    easyimg.info(fileName,function(err,info){
      logger.emit("log","error"+err);
      if(info.width<100 && info.height<128){
        callback({"error":{"message":"Please upload image of atleast width and height 700 and 300 respectively"}})
      }else{
        fs.open(fileName, 'a', 0755, function(err, fd) {
          if (err) {
            callback({"error":{"message":"uploadFile fs.open:"+err}})
          }else{
            fs.write(fd, file_buffer, null, 'Binary', function(err, written, writebuffer) {
              if(err){
                callback({"error":{"message":"uploadFile fs.write:"+err}})
              }else{
                 // easyimg.rescrop({src:fileName, dst:fileName,width:100,height:128,cropwidth:100, cropheight:128},function(err, image) {
                 //  if (err){
                 //    callback({"error":{"message":"__orgFileBuffer thumbnail:"+err}})
                 //  }else{
                    // console.log(written+" bytes are written from buffer");
                    var s3filekey=Math.floor((Math.random()*1000)+1)+"."+ext;
                     var bucketFolder;
                     var params;
                     // writebuffer= new Buffer(file_buffer, "base64");
                    
                      if(action.user.userid!=sessionuser.userid){
                        callback({"error":{"code":"EA001","message":"You are not an authorized to  change user avatar"}});   
                      }else{
                         var currentdate=new Date();

                        var expirydate=currentdate.setFullYear(currentdate.getFullYear()+2); 
                        bucketFolder=amazonbucket+"/user/"+action.user.userid;
                        params = {
                             Bucket: bucketFolder,
                             Key: action.user.userid+s3filekey,
                             Body: writebuffer,
                             Expires:expirydate,
                             ACL: 'public-read',
                             ContentType: file_type
                        };
                        userFileUpload(action.user.userid,params,file_name,function(err,result){
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
                      }
                  //   }
                  // })
                }
              })
            }
          })
        }
      })
    }
  }
var __orgFileBuffer=function(action,file,dirname,action,sessionuser,callback){
  var file_name=file.filename;
  var file_buffer=file.filebuffer;
  var file_length=file.filelength;  
  var file_type=file.filetype;

  var ext = path.extname(file_name||'').split('.');
  ext=ext[ext.length - 1];
  var fileName = dirname + '/tmp/uploads/' + file_name;
  
  if(!S(file_type).contains("image") || !S(file_type).contains("jpeg") && !S(file_type).contains("gif") && !S(file_type).contains('png') ){
    callback({"error":{"message":"You can upload only image of type jpeg or gif"}});
  }else if(file_length>2000000){
    callback({"error":{"message":"You can upload  image of size less than 2mb"}});
  }else{
    easyimg.info(fileName,function(err,info){
      logger.emit("log","error"+err);
      // if(info.width<700 && info.height<470){
      //   callback({"error":{"message":"Please upload image of atleast width and height 700 and 470 respectively"}})
      // }else if((info.width/info.height)<1.5 && (info.width/info.height)>1.78 ){
      //   callback({"error":{"message":"Aspect ratio of image should be 16/9 or 3/2"}});
      // }else{
        fs.open(fileName, 'a', 0755, function(err, fd) {
          if (err) {
            callback({"error":{"message":"uploadFile fs.open:"+err}})
          }else{
            fs.write(fd, file_buffer, null, 'Binary', function(err, written, writebuffer) {
              if(err){
                callback({"error":{"message":"uploadFile fs.write:"+err}})
              }else{
                // gm(fileName).resize(null,370).toBuffer(function (err, buffer) {
                //   if (err){
                //     logger.emit("error","__orgFileBuffer"+err);
                //     callback({"error":{"message":"Upload Issue"}})
                //   }else{
                    var s3filekey=Math.floor((Math.random()*1000)+1)+"."+ext;
                    logger.emit("log","s3filekey:"+s3filekey+" ext:"+ext);
                    var bucketFolder;
                    var params;
                     // writebuffer= new Buffer(file_buffer, "base64");
                    if(sessionuser.org.orgid==null){
                      callback({"error":{"code":"EA001","message":"You are not an organization user "}});   
                    }else{
                      if(action.org.userid!=sessionuser.userid){
                        callback({"error":{"code":"EA001","message":"You are not an authorized to  change user avatar"}});   
                      }else if(sessionuser.org.orgid!=action.org.orgid){
                        callback({"error":{"code":"EA001","message":"You are not authorized to add organization images"}});
                      }else if(sessionuser.org.isAdmin==false){
                        callback({"error":{"code":"EA001","message":"You are not authorized to add organization images"}});
                      }else{
                        // console.log("organization image upload");

                        var currentdate=new Date();
                        var expirydate=currentdate.setFullYear(currentdate.getFullYear()+2); 
                        console.log(expirydate);
                        bucketFolder=amazonbucket+"/org/"+action.org.orgid;
                        console.log("key"+action.org.orgid+s3filekey);
                        params = {
                          Bucket: bucketFolder,
                          Key: action.org.orgid+s3filekey,
                          Body: writebuffer,
                          // Expires:new Date(expirydate),
                          ACL: 'public-read',
                          ContentType: file_type
                        };
                        orgFileUpload(action.org.orgid,params,file_name,function(err,result){
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
                      }
                    }
                //   }
                // })
              }
            })
          }
       })
      // }
    })
  }
}
var __productFileBuffer=function(action,file,dirname,action,sessionuser,callback){
  var file_name=file.filename;
  var file_buffer=file.filebuffer;
  var file_length=file.filelength;  
  var file_type=file.filetype;

  var ext = path.extname(file_name||'').split('.');
  ext=ext[ext.length - 1];
  var fileName = dirname + '/tmp/uploads/' + file_name;
  if(!S(file_type).contains("image") || !S(file_type).contains("jpeg") && !S(file_type).contains("gif") && !S(file_type).contains('png') ){
    callback({"error":{"message":"You can upload only image of type jpeg or gif"}});
  }else if(file_length>2000000){
    callback({"error":{"message":"You can upload  image of size less than 2mb"}});
  }else{
    easyimg.info(fileName,function(err,info){
      logger.emit("log","error"+err);
      // if(info.width<700 && info.height<470){
      //   callback({"error":{"message":"Please upload image of atleast width and height 700 and 470 respectively"}})
      // }else if((info.width/info.height)<1.5 && (info.width/info.height)>1.78 ){
      //   callback({"error":{"message":"Aspect ratio of image should be 16/9 or 3/2"}});
      // }else{
        fs.open(fileName, 'a', 0755, function(err, fd) {
          if (err) {
            callback({"error":{"message":"uploadFile fs.open:"+err}})
          }else{
           
            fs.write(fd, file_buffer, null, 'Binary', function(err, written, writebuffer) {
              if(err){
                callback({"error":{"message":"uploadFile fs.write:"+err}})
              }else{
                // gm(fileName).resize(null,375).toBuffer(function (err, buffer) {
                //   if (err){
                //     logger.emit("error","__productFileBuffer"+err);
                //     callback({"error":{"message":"Upload Issue"}})
                //   }else{
                console.log(written+" bytes are written from buffer");
                    var s3filekey=Math.floor((Math.random()*1000)+1)+"."+ext;
                    var bucketFolder;
                    var params;
                     // writebuffer= new Buffer(file_buffer, "base64");
                    if(sessionuser.org.orgid==null){
                      callback({"error":{"code":"EA001","message":"You are not an organization user "}});   
                    }else{
                      if(action.product.userid!=sessionuser.userid){
                        callback({"error":{"code":"EA001","message":"You are not an authorized to   add product images"}});   
                      }else if(sessionuser.org.orgid!=action.product.orgid){
                        callback({"error":{"code":"EA001","message":"You are not authorized to add product images"}});
                      }else{
                        ProductModel.findOne({prodle:action.product.prodle},{orgid:1},function(err,product){
                          if(err){
                            callback({"error":{"code":"EDOO1","message":"productFileUpload:Dberror"+err}});
                          }else if(!product){
                            callback({"error":{"message":"Wrong Prodle"}});
                          }else{
                            if(product.orgid!=action.product.orgid){
                              callback({"error":{"code":"EA001","message":"It's not your product to add product images"}});
                            }else{
                              var currentdate=new Date();
                               var expirydate=currentdate.setFullYear(currentdate.getFullYear()+2); 
                              bucketFolder=amazonbucket+"/org/"+action.product.orgid+"/product/"+action.product.prodle;
                              params = {
                                Bucket: bucketFolder,
                                Key: action.product.orgid+action.product.prodle+s3filekey,
                                Body: writebuffer,
                                Expires:expirydate,
                                ACL: 'public-read',
                                ContentType: file_type
                              };
                              productFileUpload(action.product.prodle,params,file_name,function(err,result){
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
                            }
                          }
                        })
                      }
                    }
                //   }
                // })
              }
            })
          }
        })
      // }
    })
  }
}
var __orgLogoFileBuffer=function(action,file,dirname,action,sessionuser,callback){
  var file_name=file.filename;
  var file_buffer=file.filebuffer;
  var file_length=file.filelength;  
  var file_type=file.filetype;

 var ext = path.extname(file_name||'').split('.');
  ext=ext[ext.length - 1];
  var fileName = dirname + '/tmp/uploads/' + file_name;
  if(!S(file_type).contains("image") || !S(file_type).contains("jpeg") && !S(file_type).contains("gif") && !S(file_type).contains("png") ){
    callback({"error":{"message":"You can upload only image of type jpeg or gif"}});
  }else if(file_length>500000){
    callback({"error":{"message":"You can upload  image of size less than 1mb"}});
  }else{
    easyimg.info(fileName,function(err,info){
      logger.emit("log","error"+err);
      if(info.width<100 && info.height<128){
        callback({"error":{"message":"Please upload image of atleast width and height 100 and 128 respectively"}})
      }else{
        fs.open(fileName, 'a', 0755, function(err, fd) {
          if (err) {
            callback({"error":{"message":"uploadFile fs.open:"+err}})
          }else{
            fs.write(fd, file_buffer, null, 'Binary', function(err, written, writebuffer) {
              if(err){
                callback({"error":{"message":"uploadFile fs.write:"+err}})
              }else{
                // console.log(written+" bytes are written from buffer");
                var s3filekey=Math.floor((Math.random()*1000)+1)+"."+ext;
                 var bucketFolder;
                 var params;
                 // writebuffer= new Buffer(file_buffer, "base64");
                if(sessionuser.org.orgid==null){
                  callback({"error":{"code":"EA001","message":"You are not an organization user "}});   
                }else{
                  if(action.orglogo.userid!=sessionuser.userid){
                    callback({"error":{"code":"EA001","message":"You are not an authorized to  change user avatar"}});   
                  }else if(sessionuser.org.orgid!=action.orglogo.orgid){
                    callback({"error":{"code":"EA001","message":"You are not an organization user to add Organization logo"}});
                  }else if(sessionuser.org.isAdmin==false){
                    callback({"error":{"code":"EA001","message":"You are not authorized to add product logo"}});
                  }else{
                    var currentdate=new Date();
                    var expirydate=currentdate.setFullYear(currentdate.getFullYear()+2); 
                    bucketFolder=amazonbucket+"/org/"+action.orglogo.orgid;
                    params = {
                             Bucket: bucketFolder,
                             Key: action.orglogo.orgid+s3filekey,
                             Body: writebuffer,
                             Expires:expirydate,
                             ACL: 'public-read',
                             ContentType: file_type
                    };
                    orgLogoUpload(action.orglogo.orgid,params,file_name,function(err,result){
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
                  }
                }
              }
            })
          }
        })
      }
    })
  }
}
var __productLogoFileBuffer=function(action,file,dirname,action,sessionuser,callback){
  var file_name=file.filename;
  var file_buffer=file.filebuffer;
  var file_length=file.filelength;  
  var file_type=file.filetype;

  var ext = path.extname(file_name||'').split('.');
  ext=ext[ext.length - 1];
  var fileName = dirname + '/tmp/uploads/' + file_name;
 if(!S(file_type).contains("image") || !S(file_type).contains("jpeg") && !S(file_type).contains("gif") && !S(file_type).contains("png")  ){
    callback({"error":{"message":"You can upload only image of type jpeg or gif"}});
  }else if(file_length>500000){
    callback({"error":{"message":"You can upload  image of size less than 1mb"}});
  }else{
    easyimg.info(fileName,function(err,info){
      logger.emit("log","error"+err);
      if(info.width<100 && info.height<128){
        callback({"error":{"message":"Please upload image of atleast width and height 100 and 128 respectively"}})
      }else{
        fs.open(fileName, 'a', 0755, function(err, fd) {
          if (err) {
            callback({"error":{"message":"uploadFile fs.open:"+err}})
          }else{
           
            fs.write(fd, file_buffer, null, 'Binary', function(err, written, writebuffer) {
              if(err){
                callback({"error":{"message":"uploadFile fs.write:"+err}})
              }else{
                // console.log(written+" bytes are written from buffer");
                var s3filekey=Math.floor((Math.random()*1000)+1)+"."+ext;
                 var bucketFolder;
                 var params;
                 // writebuffer= new Buffer(file_buffer, "base64");
                if(sessionuser.org.orgid==null){
                  callback({"error":{"code":"EA001","message":"You are not an organization user "}});   
                }else{
                  if(action.productlogo.userid!=sessionuser.userid){
                    callback({"error":{"code":"EA001","message":"You are not an authorized to  change user avatar"}});   
                  }else if(sessionuser.org.orgid!=action.productlogo.orgid){
                    callback({"error":{"code":"EA001","message":"You are not authorized to add product logo"}});
                  }else if(sessionuser.org.isAdmin==false){
                    callback({"error":{"code":"EA001","message":"You are not authorized to add product logo"}});
                  }else{
                    ProductModel.findOne({prodle:action.productlogo.prodle},{orgid:1},function(err,product){
                      if(err){
                        callback({"error":{"code":"EDOO1","message":"productFileUpload:Dberror"+err}});
                      }else if(!product){
                        callback({"error":{"message":"Wrong Prodle"}});
                      }else{
                        if(product.orgid!=action.productlogo.orgid){
                           callback({"error":{"code":"EA001","message":"It is not your product to add product logo"}});
                        }else{
                          var currentdate=new Date();
                          var expirydate=currentdate.setFullYear(currentdate.getFullYear()+2); 
                          bucketFolder=amazonbucket+"/org/"+action.productlogo.orgid+"/product/"+action.productlogo.prodle;
                          params = {
                                   Bucket: bucketFolder,
                                   Key: action.productlogo.orgid+action.productlogo.prodle+s3filekey,
                                   Body: writebuffer,
                                   Expires:expirydate,
                                   ACL: 'public-read',
                                   ContentType: file_type
                          };
                          productLogoUpload(action.productlogo.prodle,params,file_name,function(err,result){
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
                        }
                      }
                    })
                  }
                }
              }
            })
          }
        })
      }
    })
  }
}

var __warrantyInvoiceImgBuffer=function(action,file,dirname,action,sessionuser,callback){
  var file_name=file.filename;
  var file_buffer=file.filebuffer;
  var file_length=file.filelength;  
  var file_type=file.filetype;

  var ext = path.extname(file_name||'').split('.');
  ext=ext[ext.length - 1];
  var fileName = dirname + '/tmp/uploads/' + file_name;
 if(!S(file_type).contains("image") || !S(file_type).contains("jpeg") && !S(file_type).contains("gif")  ){
    callback({"error":{"message":"You can upload only image of type jpeg or gif"}});
  }else if(file_length>500000){
    callback({"error":{"message":"You can upload  image of size less than 1mb"}});
  }else{
    easyimg.info(fileName,function(err,info){
      logger.emit("log","error"+err);
      if(info.width<100 && info.height<128){
        callback({"error":{"message":"Please upload image of atleast width and height 700 and 300 respectively"}})
      }else{
        fs.open(fileName, 'a', 0755, function(err, fd) {
          if (err) {
            callback({"error":{"message":"uploadFile fs.open:"+err}})
          }else{
           
            fs.write(fd, file_buffer, null, 'Binary', function(err, written, writebuffer) {
              if(err){
                callback({"error":{"message":"uploadFile fs.write:"+err}})
              }else{
                // console.log(written+" bytes are written from buffer");
                    var s3filekey=Math.floor((Math.random()*1000)+1)+"."+ext;
                     var bucketFolder;
                     var params;
                     // writebuffer= new Buffer(file_buffer, "base64");
                    
                      if(action.warranty.userid!=sessionuser.userid){
                        callback({"error":{"code":"EA001","message":"You are not an authorized to change user warranty invoice image"}});   
                      }else{
                        var currentdate=new Date();
                        var expirydate=currentdate.setFullYear(currentdate.getFullYear()+2); 
                        bucketFolder=amazonbucket+"/user/"+action.warranty.userid;
                        params = {
                             Bucket: bucketFolder,
                             Key: action.warranty.userid+s3filekey,
                             Body: writebuffer,
                             ACL: 'public-read',
                             Expires:expirydate,
                             ContentType: file_type
                        };
                        warrantyInvoiceImgUpload(action.warranty.warranty_id,params,function(err,result){
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
                      }
              }
            })
          }
        })
      }
    })
  }
}
var __orgKeyClientFileBuffer=function(action,file,dirname,action,sessionuser,callback){
  var file_name=file.filename;
  var file_buffer=file.filebuffer;
  var file_length=file.filelength;  
  var file_type=file.filetype;
  // logger.emit("log","file details"+JSON.stringify(file));
  var ext = path.extname(file_name||'').split('.');
  ext=ext[ext.length - 1];
  var fileName = dirname + '/tmp/uploads/' + file_name;
  console.log("filename"+fileName);
  logger.emit("log","ext"+file_type);
  if(!S(file_type).contains("image") || !S(file_type).contains("jpeg") && !S(file_type).contains("gif") && !S(file_type).contains("png") ){
    callback({"error":{"message":"You can upload only image of type jpeg or gif"}});
  }else if(file_length>500000){
    callback({"error":{"message":"You can upload  image of size less than 500 kb"}});
  }else{
    easyimg.info(fileName,function(err,info){
      logger.emit("log","error"+err);
      if(info.width<100 && info.height<128){
        callback({"error":{"message":"Please upload image of atleast width and height 700 and 300 respectively"}})
      }else{
        fs.open(fileName, 'a', 0755, function(err, fd) {
          if (err) {
            callback({"error":{"message":"uploadFile fs.open:"+err}})
          }else{
            fs.write(fd, file_buffer, null, 'Binary', function(err, written, writebuffer) {
              if(err){
                callback({"error":{"message":"uploadFile fs.write:"+err}})
              }else{
                 // easyimg.rescrop({src:fileName, dst:fileName,width:100,height:128,cropwidth:100, cropheight:128},function(err, image) {
                 //  if (err){
                 //    callback({"error":{"message":"__orgFileBuffer thumbnail:"+err}})
                 //  }else{
                    // console.log(written+" bytes are written from buffer");
                    var s3filekey=Math.floor((Math.random()*1000)+1)+"."+ext;
                     var bucketFolder;
                     var params;
                     // writebuffer= new Buffer(file_buffer, "base64");
                    
                      if(sessionuser.org.orgid==null){
                        callback({"error":{"code":"EA001","message":"You are not an organization user "}});   
                      }else{
                        if(action.orgkeyclient.userid!=sessionuser.userid){
                          callback({"error":{"code":"EA001","message":"You are not an authorized to  add organization key client"}});   
                        }else if(sessionuser.org.orgid!=action.orgkeyclient.orgid){
                          callback({"error":{"code":"EA001","message":"You are not an organization user to add organization key client"}});
                        }else if(sessionuser.org.isAdmin==false){
                          callback({"error":{"code":"EA001","message":"You are not authorized toadd organization key client"}});
                        }else if(action.orgkeyclient.clientname==undefined){
                          callback({"error":{"code":"AV001","message":"Please pass org client name"}});
                        }else{
                          var currentdate=new Date();
                          var expirydate=currentdate.setFullYear(currentdate.getFullYear()+2); 
                          bucketFolder=amazonbucket+"/org/"+action.orgkeyclient.orgid+"/keyclient";
                          params = {
                             Bucket: bucketFolder,
                             Key: action.orgkeyclient.orgid+s3filekey,
                             Body: writebuffer,
                             Expires:expirydate,
                             ACL: 'public-read',
                             ContentType: file_type
                          };
                        orgKeyClientFileUpload(action.orgkeyclient.orgid,params,file_name,action.orgkeyclient.clientname,function(err,result){
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
                      }
                  //   }
                  // })
                }
              }
              })
            }
          })
        }
      })
    }
  }
var userFileUpload=function(userid,awsparams,filename,callback){

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
          var newprofileurl={bucket:params1.Bucket,key:params1.Key,image:url};
          
          userModel.findAndModify({userid:userid},[],{$set:{profile_pic:newprofileurl}},{new:false},function(err,userprofiledata){
            if(err){
              callback({"error":{"code":"EDOO1","message":"userFileUpload:Dberror"+err}});
            }else if(userprofiledata){
              var userprofile=userprofiledata.profile_pic;
              if(userprofile==undefined){
                  logger.emit("log","First time logo changed");
              }else{
                var awsdeleteparams={Bucket:userprofile.bucket,Key:userprofile.key};
                logger.emit("log",awsdeleteparams);
                s3bucket.deleteObject(awsdeleteparams, function(err, deleteuserlogostatus) {
                  if (err) {
                    logger.emit("error","Profile pic not deleted from amzon s3 bucket "+err,userprofiledata.userid);
                  }else if(deleteuserlogostatus){
                    logger.emit("log","Profile pic delete from Amazon S3");
                  }
                }) 
              }
              callback(null,{"success":{"message":"User Profile Pic Updated Successfully","image":newprofileurl,"filename":filename}})
            }else{
              callback({"error":{"code":"AU003","message":"Provided userid is wrong"+userid}});
            }
          })
        }
      });
    }
  }) 
}
var orgFileUpload=function(orgid,awsparams,filename,callback){
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
         var image_data={bucket:params1.Bucket,key:params1.Key,image:url,imageid:generateId()}
          OrgModel.update({orgid:orgid},{$push:{org_images:image_data}},function(err,orguploadstatus){
            if(err){
              callback({"error":{"code":"EDOO1","message":"orgFileUpload:Dberror"+err}});
            }else if(orguploadstatus==1){
              callback(null,{"success":{"message":"Org image uploaded Successfully","filename":filename}})
            }else{
              callback({"error":{"code":"AO002","message":"Wrong orgid"+orgid}});
            }
          })
        }
      });
    }
  })  
}
var productFileUpload=function(prodle,awsparams,filename,callback){
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
          var image_data={bucket:params1.Bucket,key:params1.Key,image:url,imageid:generateId()}
          ProductModel.update({prodle:prodle},{$push:{product_images:image_data}},function(err,productuploadstatus){
            if(err){
              callback({"error":{"code":"EDOO1","message":"orgFileUpload:Dberror"+err}});
            }else if(productuploadstatus==1){
              callback(null,{"success":{"message":"Product image uploaded Successfully","filename":filename}})
            }else{
              callback({"error":{"code":"AP001","message":"Wrong prodle"+prodle}});
            }
          })
        }
      });
    }
  })  
}
var productLogoUpload=function(prodle,awsparams,filename,callback){
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
          var product_logo_object={bucket:params1.Bucket,key:params1.Key,image:url};
          ProductModel.findAndModify({prodle:prodle},[],{$set:{product_logo:product_logo_object}},{new:false},function(err,productlogodata){
            if(err){
              callback({"error":{"code":"EDOO1","message":"orgFileUpload:Dberror"+err}});
            }else if(productlogodata){
              var productlogo=productlogodata.product_logo;
              if(productlogo==undefined){
                logger.emit("log","First time check for product logo");
              }else{
                var awsdeleteparams={Bucket:productlogo.bucket,Key:productlogo.key};
                s3bucket.deleteObject(awsdeleteparams, function(err, deleteproductlogostatus) {
                  if (err) {
                    logger.emit("error"," product not  deleted from amzon s3 bucket for prodle"+productlogodata.prodle);
                  }else if(deleteproductlogostatus){
                    logger.emit("log","product logo deleted from Amazon S3");
                  }
                })  
              }
              
              callback(null,{"success":{"message":"Product images uploaded Successfully","image":url,"filename":filename}})
            }else{
              callback({"error":{"code":"AP001","message":"Wrong prodle"+prodle}});
            }
          })
        }
      });
    }
  })  
}
var orgLogoUpload=function(orgid,awsparams,filename,callback){
  s3bucket.putObject(awsparams, function(err, data) {
    if (err) {
      callback({"error":{"message":"s3bucket.putObject:-orgLogoUpload"+err}})
    } else {
      logger.emit("log","fileupload saved");
      var params1 = {Bucket: awsparams.Bucket, Key: awsparams.Key,Expires: 60*60*24*365};
      s3bucket.getSignedUrl('getObject',params1, function (err, url) {
        if(err){
          callback({"error":{"message":"orgLogoUpload:Error in getting getSignedUrl"+err}});
        }else{
          var org_logo_object={bucket:params1.Bucket,key:params1.Key,image:url};
          OrgModel.findAndModify({orgid:orgid},[],{$set:{org_logo:org_logo_object}},{new:false},function(err,orglogodata){
            if(err){
              callback({"error":{"code":"EDOO1","message":"orgLogoUpload:Dberror"+err}});
            }else if(orglogodata){
              var orglogo=orglogodata.org_logo;
              if(orglogo==undefined){
                logger.emit("log","first time product logog chanes");
              }else{
                var awsdeleteparams={Bucket:orglogo.bucket,Key:orglogo.key};
                s3bucket.deleteObject(awsdeleteparams, function(err, deleteorglogostatus) {
                  if (err) {
                    logger.emit("error","organization logo not  deleted from amzon s3 bucket for orgid"+orglogodata.orgid);
                  }else if(deleteorglogostatus){
                    logger.emit("log","orglogo  deleted from Amazon S3");
                  }
                }) 
              }
              
              callback(null,{"success":{"message":"Organization logo changes  Successfully","image":url,"filename":filename}})
            }else{
              callback({"error":{"code":"AO002","message":"Wrong orgid"+orgid}});
            }
          })
        }
      });
    }
  })  
}

var warrantyInvoiceImgUpload=function(warranty_id,awsparams,callback){
  s3bucket.putObject(awsparams, function(err, data) {
    if (err) {
      callback({"error":{"message":"s3bucket.putObject:-warrantyInvoiceImgUpload"+err}})
    } else {
      logger.emit("log","fileupload saved");
      var params1 = {Bucket: awsparams.Bucket, Key: awsparams.Key,Expires: 60*60*24*365};
      s3bucket.getSignedUrl('getObject',params1, function (err, url) {
        if(err){
          callback({"error":{"message":"warrantyInvoiceImgUpload:Error in getting getSignedUrl "+err}});
        }else{
          var warrany_invoice_object={bucket:params1.Bucket,key:params1.Key,image:url}
          WarrantyModel.update({warranty_id:warranty_id},{$set:{invoice_image:warrany_invoice_object}},function(err,warrantyuploadstatus){
            if(err){
              callback({"error":{"code":"EDOO1","message":"warrantyInvoiceImgUpload:Dberror "+err}});
            }else if(warrantyuploadstatus==1){
              callback(null,{"success":{"message":"Warranty invoice image uploaded successfully","image":url}})
            }else{
              callback({"error":{"code":"AP001","message":"Wrong warranty_id "+warranty_id}});
            }
          })
        }
      });
    }
  })  
}
var orgKeyClientFileUpload =function(orgid,awsparams,filename,orgclientname,callback){
  s3bucket.putObject(awsparams, function(err, data) {
    if (err) {
      callback({"error":{"message":"s3bucket.putObject:-orgLogoUpload"+err}})
    } else {
      logger.emit("log","fileupload saved");
      var params1 = {Bucket: awsparams.Bucket, Key: awsparams.Key,Expires: 60*60*24*365};
      s3bucket.getSignedUrl('getObject',params1, function (err, url) {
        if(err){
          callback({"error":{"message":"orgLogoUpload:Error in getting getSignedUrl"+err}});
        }else{
          var org_key_client_object={clientname:orgclientname,bucket:params1.Bucket,key:params1.Key,image:url,clientid:generateId()};
           OrgModel.update({orgid:orgid},{$push:{keyclients:org_key_client_object}},function(err,orgkeyclientsuploadstatus){
            if(err){
              callback({"error":{"code":"EDOO1","message":"orgFileUpload:Dberror"+err}});
            }else if(orgkeyclientsuploadstatus==1){
              callback(null,{"success":{"message":"Org Clients uploaded successfully","filename":filename}})
            }else{
              callback({"error":{"code":"AO002","message":"Wrong orgid"+orgid}});
            }
          })
        }
      });
    }
  })  
}
