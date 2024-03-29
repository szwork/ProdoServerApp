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
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;
var generateTimeId = require('time-uuid');
var productModel=require("../../product/js/product-model");
var TrendModel = require("../../featuretrending/js/feature-trending-model");
 var logger=require("./logger");
var fs = require('fs');
var AWS = require('aws-sdk');
var generateId = require('time-uuid');
var path=require("path");
var userModel=require('../../user/js/user-model');
var OrgModel=require('../../org/js/org-model');
var blogModel = require("../../blog/js/blog-model");
var MarketingModel = require('../../marketing/js/marketing-model');
var ProductModel=require('../../product/js/product-model');
var DashboardPoolModel = require("../../dashboard/js/dashboard-charts-model");
var CampaignModel = require('../../productcampaign/js/product-campaign-model');
var WarrantyModel = require('../../warranty/js/warranty-model');
var exec = require('child_process').exec;
var CONFIG = require('config').Prodonus;
var easyimg = require('easyimage');
var img_format_array=["jpeg","JPEG","JPG","GIF","BMP","jpg","gif","bmp"];
var S=require("string");
var amazonbucket=CONFIG.amazonbucket;
var gm = require('gm').subClass({ imageMagick: true });
var redisClient = require("redis").createClient();

AWS.config.update({accessKeyId:'AKIAJOGXRBMWHVXPSC7Q', secretAccessKey:'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'});
AWS.config.update({region:'ap-southeast-1'});
var s3bucket = new AWS.S3();

exports.getOrganizationAnalyticsData=function(organizations,callback){
  var orgids=[];
  for(var i=0;i<organizations.length;i++){
      orgids.push(organizations[i].orgid);
  }
  productModel.aggregate({$match:{orgid:{$in:orgids},status:"active"}},{$group:{_id:"$orgid",productcount:{$sum:1}}},function(err,products){
    if(err){
     callback({error:{code:"ED001",message:"Database Issue"+err}})
    }else if(products.length==0){
      var organalyticsarray=[]
      for(var i=0;i<organizations.length;i++){
          var organalyticsdata=JSON.stringify(organizations[i]);
          organalyticsdata=JSON.parse(organalyticsdata)
          organalyticsdata.productcount=0;
          organalyticsdata.followedcount=0;
          organalyticsdata.commentcount=0;
          organalyticsdata.campaign=[];
          organalyticsarray.push(organalyticsdata);      
      }
      callback(null,{success:{message:"Get Organization analytics successfully",organalytics:organalyticsarray}})
    }else{
      var organalytics=[];
      var productorgids=[];
      for(var i=0;i<products.length;i++){
        productorgids.push(products[i]._id);
      }
      console.log("productscounts"+JSON.stringify(products))
      for(var i=0;i<organizations.length;i++){
        console.log("tesing"+productorgids.indexOf(organizations[i].orgid))
        if(productorgids.indexOf(organizations[i].orgid)>=0){
          var organalytic=JSON.stringify(organizations[i])
          organalytic=JSON.parse(organalytic);
          console.log("ddd"+organizations[i].orgid+""+products[productorgids.indexOf(organizations[i].orgid)].productcount);
          organalytic.productcount=products[productorgids.indexOf(organizations[i].orgid)].productcount;
          console.log(organizations[i]);
          // organizations[i].productcount=products[productorgids.indexOf(organizations[i].orgid)].productcount;
           organalytics.push(organalytic)
        }else{
          var organalytic=JSON.stringify(organizations[i])
          organalytic=JSON.parse(organalytic);
          organalytic.productcount=0;
          organalytics.push(organalytic)
        }
      }
      logger.emit("log","org data with product count"+JSON.stringify(organalytics));
    
      _orgdatawithProductCommentCountAndFollowedCount(organalytics,function(err,result){
          if(err){
             callback(err)
          }else{
            callback(null,result);
          }
      })
    }
  })
}

var _orgdatawithProductCommentCountAndFollowedCount=function(organalytics,callback){
  TrendModel.aggregate({$match:{status:"active"}},{$group:{_id:"$orgid",followedcount:{$sum:"$followedcount"},commentcount:{$sum:"$commentcount"}}},function(err,trendingbyorg){
    if(err){
      callback({error:{code:"ED001",message:"Database Issue"+err}})
    }else{
      if(trendingbyorg.length==0){
        _orgdataWithProductCampaign(organalytics,function(err,result){
            if(err){
             callback(err)
            }else{
              callback(null,result);
            }
          });
      }else{
        var organalyticsarray=[];
        var trendingbyorgids=[];
        for(var i=0;i<trendingbyorg.length;i++){
          trendingbyorgids.push(trendingbyorg[i]._id);
        }
        for(var i=0;i<organalytics.length;i++){
          if(trendingbyorgids.indexOf(organalytics[i].orgid)>=0){
            var organalytic=JSON.stringify(organalytics[i]);
            organalytic=JSON.parse(organalytic);
            organalytic.followedcount=trendingbyorg[trendingbyorgids.indexOf(organalytics[i].orgid)].followedcount;
            organalytic.commentcount=trendingbyorg[trendingbyorgids.indexOf(organalytics[i].orgid)].commentcount;
            organalyticsarray.push(organalytic)
          }else{
            var organalytic=JSON.stringify(organalytics[i]);
            organalytic=JSON.parse(organalytic);
            organalytic.followedcount=0;
            organalytic.commentcount=0;
            organalyticsarray.push(organalytic)
          }
          }
          _orgdataWithProductCampaign(organalyticsarray,function(err,result){
            if(err){
             callback(err)
            }else{
              callback(null,result);
            }
          });
      }
    }
  })
}

var _orgdataWithProductCampaign=function(organalyticsarray,callback){
  var a=new Date();
  var today=new Date(a.getFullYear()+"/"+(a.getMonth()+1)+"/"+a.getDate());
  CampaignModel.aggregate({$match:{status:"active",startdate:{$lte:today},enddate:{$gte:today}}},{$group:{_id:"$orgid",campaign:{$addToSet:{campaign_id:"$campaign_id",name:"$name",bannertext:"$bannertext",banner_image:"$banner_image",description:"$description",orgid:"$orgid",prodle:"$prodle"}}}},function(err,campaignbyorg){
    if(err){
      callback({error:{code:"ED001",message:"Database Issue"+err}})
    }else{
      if(campaignbyorg.length==0){

        var organalyticsarraydata=[]
        for(var i=0;i<organalyticsarray.length;i++){
          var organalyticsdata=JSON.stringify(organalyticsarray[i]);
          organalyticsdata=JSON.parse(organalyticsdata)
          organalyticsdata.campaign=[];
          organalyticsarraydata.push(organalyticsdata);      
        }
        callback(null,{success:{message:"Organization analytics getting successfully",organalytics:organalyticsarraydata}});
      }else{
        var organalyticsarrayproductcampaign=[];
        var trendingbyorgids=[];
        for(var i=0;i<campaignbyorg.length;i++){
          trendingbyorgids.push(campaignbyorg[i]._id);
        }
        for(var i=0;i<organalyticsarray.length;i++){
          if(trendingbyorgids.indexOf(organalyticsarray[i].orgid)>=0){
            var organalytic=JSON.stringify(organalyticsarray[i]);
            organalytic=JSON.parse(organalytic);
            organalytic.campaign=campaignbyorg[trendingbyorgids.indexOf(organalyticsarray[i].orgid)].campaign;
            organalyticsarrayproductcampaign.push(organalytic)
          }else{
            var organalytic=JSON.stringify(organalyticsarray[i]);
            organalytic=JSON.parse(organalytic);
            organalytic.campaign=[];
              organalyticsarrayproductcampaign.push(organalytic)
          }
        }
        callback(null,{success:{message:"Organization analytics getting successfully",organalytics:organalyticsarrayproductcampaign}});
      }
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
// //send an email
exports.sendMail = function(message,smtpconfig,callback){
  var smtpTransport = nodemailer.createTransport("SMTP",smtpconfig);

  message.html="<div width=500 height=100 style='background-color:black'><img src='http://prodonus.com/assets/images/prodonus.png'></img><h2><font color=white>Reach. Share. Know. </font></h2></div><br>"+message.html;
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
  }else if(action.campaign!=undefined){
    socketreply="campaignUploadResponse";
  }else if(action.warranty!=undefined){
    socketreply="warrantyUploadResponse";
  }else if(action.orgkeyclient!=undefined){
    socketreply="orgKeyClientResponse";
  }else if(action.blog!=undefined){
    socketreply="blogUploadResponse";
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
    socket.on('addWarranty',function(userid,warrantydata,file){
       redisClient.get("sess:"+socket.handshake.sessionID, function(err, reply) {
        if(err){
           socket.emit("addWarrantyResponse",{"error":{"code":"","message":"User Session Expired"}});
        }else if(reply==null){
        socket.emit("addWarrantyResponse",{"error":{"code":"","message":"User Session Expired"}});
        }else if(JSON.parse(reply).passport.user==undefined){
          socket.emit("addWarrantyResponse",{"error":{"code":"","message":"User Session Expired"}});
        }else if(userid!=socket.handshake.user.userid){
          socket.emit("addWarrantyResponse",{"error":{"code":"","message":"You have not authorized to add Warranty"}});
        }else{
          ///////////////////////////////////////////////////
          _validateAddWarrantyData(userid,warrantydata,file,userid)
          ////////////////////////////////////////////////
        }          
        })
    })
    
    var _validateAddWarrantyData=function(userid,warrantydata,file,userid){
      if(warrantydata==undefined){
        socket.emit("addWarrantyResponse",{"error":{"code":"AV001","message":"Please provide data to add warranty"}});
      }else if(warrantydata.name==undefined){
        socket.emit("addWarrantyResponse",{"error":{"code":"AV001","message":"Please pass prdouct name"}});
      }else if(warrantydata.model_no==undefined){
       socket.emit("addWarrantyResponse",{"error":{"code":"AV001","message":"Please pass model number"}});
      // }else if(warrantydata.model_name==undefined){
      //     socket.emit("addWarrantyResponse",{"error":{"code":"AV001","message":"please pass model name"}});
      }else if(warrantydata.serial_no==undefined){
        socket.emit("addWarrantyResponse",{"error":{"code":"AV001","message":"please pass serial number"}});
      }else if(warrantydata.purchase_date==undefined){
        socket.emit("addWarrantyResponse",{"error":{"code":"AV001","message":"please pass date of purchase"}});
      }else if(warrantydata.purchase_location==undefined){
        socket.emit("addWarrantyResponse",{"error":{"code":"AV001","message":"please pass purchase location"}});
      }else if(warrantydata.purchase_location.city==undefined || warrantydata.purchase_location.city==""){
        socket.emit("addWarrantyResponse",{"error":{"code":"AV001","message":"please pass city in purchase location"}});
      }else if(warrantydata.purchase_location.country==undefined || warrantydata.purchase_location_country==""){
        socket.emit("addWarrantyResponse",{"error":{"code":"AV001","message":"please pass country in purchase location"}});
      }else if(warrantydata.expirydate==undefined){
        socket.emit("addWarrantyResponse",{"error":{"code":"AV001","message":"please pass expiry date"}});
      // }else if(warrantydata.description==undefined){
        // socket.emit("addWarrantyResponse",{"error":{"code":"AV001","message":"please pass description "}});
      }else if(warrantydata.warranty_type==undefined || warrantydata.warranty_type==""){
        socket.emit("addWarrantyResponse",{"error":{"code":"AV001","message":"please pass warranty type "}});
      }else if(["extended","standard"].indexOf(warrantydata.warranty_type.toLowerCase())<0){
        socket.emit("addWarrantyResponse",{"error":{"code":"AV001","message":"Warranty type should be extended or standard"}});
      }else{
        ///////////////////////////////////////////////////////
        _validateWarrantyInvoiceFile(userid,warrantydata,file,userid);
        ///////////////////////////////////////////////////////
      }
    }
    var _validateWarrantyInvoiceFile=function(userid,warrantydata,file,userid){
      var file_name=file.filename;
      var file_buffer=file.filebuffer;
      var file_length=file.filelength;  
      var file_type=file.filetype;
      // logger.emit("log","file details"+JSON.stringify(file));
      var ext = path.extname(file_name||'').split('.');
      ext=ext[ext.length - 1];
      var fileName = __dirname + '/tmp/uploads/' + file_name;
      
      if(!S(file_type).contains("image") && !S(file_type).contains("pdf") ){
        callback({"error":{"message":"You can upload only image of type jpeg or gif"}});
      }else if(file_length>1000000){
        socket.emit("addWarrantyResponse",{"error":{"message":"You can upload  image of size less than 1mb"}});
      }else{
        fs.open(fileName, 'a', 0755, function(err, fd) {
          if (err) {
           socket.emit("addWarrantyResponse",{"error":{"message":"_validateWarrantyInvoiceFile fs.open:"+err}})
          }else{
            fs.write(fd, file_buffer, null, 'Binary', function(err, written, writebuffer) {
              if(err){
                socket.emit("addWarrantyResponse",{"error":{"message":"_validateWarrantyInvoiceFile fs.write:"+err}})
              }else{
                var s3filekey=Math.floor((Math.random()*1000)+1)+"."+ext;
                var bucketFolder;
                var params;
                var currentdate=new Date();
                var expirydate=currentdate.setFullYear(currentdate.getFullYear()+2); 
                bucketFolder=amazonbucket+"/user/"+userid+"/warranty";
                params = {
                   Bucket: bucketFolder,
                   Key: userid+s3filekey,
                   Body: writebuffer,
                   Expires:expirydate,
                   ACL: 'public-read',
                   ContentType: file_type
               };
               fs.close(fd, function() {
                  exec("rm -rf '"+fileName+"'");
                             
                });
               //////////////////////////////////////////////////
               _addWarrantyWithInvoice(userid,warrantydata,params,file_type)
               //////////////////////////////////////////////////
              }
            })
          }
        })
      }
    }
    var _addWarrantyWithInvoice=function(userid,warrantydata,awsparams,file_type){
      s3bucket.putObject(awsparams, function(err, data) {
        if (err) {
          socket.emit("addWarrantyResponse",{"error":{"message":"s3bucket.putObject:-_addWarrantyWithInvoice"+err}})
        } else {
          var params1 = {Bucket: awsparams.Bucket, Key: awsparams.Key,Expires: 60*60*24*365};
          s3bucket.getSignedUrl('getObject', params1, function (err, url) {
            if(err){
              socket.emit("addWarrantyResponse",{"error":{"message":"_addWarrantyWithInvoice:Error in getting getSignedUrl"+err}});
            }else{
             var invoice_image={bucket:params1.Bucket,key:params1.Key,image:url,filetype:file_type}
             warrantydata.invoice_image=invoice_image;
             var warranty_object=new WarrantyModel(warrantydata);
             warranty_object.save(function(err,warranty){
              if(err){
                socket.emit("addWarrantyResponse",{"error":{"message":"Database Isssue"}});
              }else{
                socket.emit("addWarrantyResponse",null,{"success":{"message":"Warranty Added successfully","warranty_id":warranty.warranty_id,"invoiceimage":url}});
              }
             })
            }
          });
        }
      })  
    }

    socket.on('addMarketingData',function(userid,marketingdata,file){
      console.log("addMarketingData1");
      redisClient.get("sess:"+socket.handshake.sessionID, function(err, reply) {
        console.log("addMarketingData2");
        if(err){
          socket.emit("addMarketingDataResponse",{"error":{"code":"","message":"User Session Expired"}});
        }else if(reply==null){
          socket.emit("addMarketingDataResponse",{"error":{"code":"","message":"User Session Expired"}});
        }else if(JSON.parse(reply).passport.user==undefined){
          socket.emit("addMarketingDataResponse",{"error":{"code":"","message":"User Session Expired"}});
        }else if(userid!=socket.handshake.user.userid){
          socket.emit("addMarketingDataResponse",{"error":{"code":"","message":"You have not authorized to add marketing data"}});
        }else if(socket.handshake.user.isAdmin==false){
          socket.emit("addMarketingDataResponse",{"error":{"code":"","message":"You have not authorized to add marketing data"}});
        }else{
          console.log("addMarketingData3");
          ///////////////////////////////////////////////////          
          _validateAddMarketingData(userid,marketingdata,file,userid);
          ////////////////////////////////////////////////
        }          
      })
    })

    var _validateAddMarketingData=function(userid,marketingdata,file,userid){
      if(marketingdata==undefined){
        socket.emit("addMarketingDataResponse",{"error":{"code":"AV001","message":"Please provide marketing data"}});
      }else if(marketingdata.name==undefined){
        socket.emit("addMarketingDataResponse",{"error":{"code":"AV001","message":"Please pass name"}});
      }else if(marketingdata.description==undefined){
        socket.emit("addMarketingDataResponse",{"error":{"code":"AV001","message":"Please pass description"}});
      }else{
        ///////////////////////////////////////////////////////
        _validateAddMarketingDataFile(userid,marketingdata,file,userid);
        ///////////////////////////////////////////////////////
      }
    }

    var _validateAddMarketingDataFile=function(userid,marketingdata,file,userid){
      var file_name=file.filename;
      var file_buffer=file.filebuffer;
      var file_length=file.filelength;  
      var file_type=file.filetype;
      // logger.emit("log","file details"+JSON.stringify(file));
      var ext = path.extname(file_name||'').split('.');
      ext=ext[ext.length - 1];
      var fileName = __dirname + '/tmp/uploads/' + file_name;
      
      if(!S(file_type).contains("image") ){
        callback({"error":{"message":"You can upload only image of type jpeg or gif"}});
      }else if(file_length>1000000){
        socket.emit("addMarketingDataResponse",{"error":{"message":"You can upload  image of size less than 1mb"}});
      }else{
        fs.open(fileName, 'a', 0755, function(err, fd) {
          if (err) {
           socket.emit("addMarketingDataResponse",{"error":{"message":"_validateAddMarketingData fs.open:"+err}})
          }else{
            fs.write(fd, file_buffer, null, 'Binary', function(err, written, writebuffer) {
              if(err){
                socket.emit("addMarketingDataResponse",{"error":{"message":"_validateAddMarketingData fs.write:"+err}})
              }else{
                var s3filekey=Math.floor((Math.random()*1000)+1)+"."+ext;
                var bucketFolder;
                var params;
                var currentdate=new Date();
                var expirydate=currentdate.setFullYear(currentdate.getFullYear()+2); 
                bucketFolder=amazonbucket+"/user/"+userid+"/marketing";
                params = {
                   Bucket: bucketFolder,
                   Key: userid+s3filekey,
                   Body: writebuffer,
                   Expires:expirydate,
                   ACL: 'public-read',
                   ContentType: file_type
               };
               fs.close(fd, function() {
                  exec("rm -rf '"+fileName+"'");
                             
                });
               //////////////////////////////////////////////////
               _addMarketingDataWithImages(userid,marketingdata,params)
               //////////////////////////////////////////////////
              }
            })
          }
        })
      }
    }

    var _addMarketingDataWithImages=function(userid,marketingdata,awsparams){
      s3bucket.putObject(awsparams, function(err, data) {
        if (err) {
          socket.emit("addMarketingDataResponse",{"error":{"message":"s3bucket.putObject:-_addMarketingDataWithImages"+err}});
        } else {
          var params1 = {Bucket: awsparams.Bucket, Key: awsparams.Key,Expires: 60*60*24*365};
          s3bucket.getSignedUrl('getObject', params1, function (err, url) {
            if(err){
              socket.emit("addMarketingDataResponse",{"error":{"message":"_addMarketingDataWithImages:Error in getting getSignedUrl"+err}});
            }else{
             var marketing_image={bucket:params1.Bucket,key:params1.Key,image:url};
             marketingdata.artwork=marketing_image;
             var marketing_object = new MarketingModel(marketingdata);
             marketing_object.save(function(err,marketing){
              if(err){
                socket.emit("addMarketingDataResponse",{"error":{"message":"Database Isssue"}})
              }else{
                socket.emit("addMarketingDataResponse",null,{"success":{"message":"MarketingData Added successfully","marketing_id":marketing.marketing_id,"invoiceimage":url}});
              }
             })
            }
          });
        }
      })  
    }

    socket.on('addDashboardCharts',function(userid,dashboarddata,file){
      console.log("addDashboardCharts");
      redisClient.get("sess:"+socket.handshake.sessionID, function(err, reply) {
        console.log("addDashboardCharts");
        if(err){
          socket.emit("addDashboardChartResponse",{"error":{"code":"","message":"User Session Expired"}});
        }else if(reply==null){
          socket.emit("addDashboardChartResponse",{"error":{"code":"","message":"User Session Expired"}});
        }else if(JSON.parse(reply).passport.user==undefined){
          socket.emit("addDashboardChartResponse",{"error":{"code":"","message":"User Session Expired"}});
        }else if(userid!=socket.handshake.user.userid){
          socket.emit("addDashboardChartResponse",{"error":{"code":"","message":"You have not authorized to add dsahboard details"}});
        }else if(socket.handshake.user.isAdmin==false){
          socket.emit("addDashboardChartResponse",{"error":{"code":"","message":"You have not authorized to add dsahboard details"}});
        }else{
          console.log("addDashboardCharts");
          ///////////////////////////////////////////////////          
          _validateAddDashboardData(userid,dashboarddata,file);
          ////////////////////////////////////////////////
        }          
      })
    })

    var _validateAddDashboardData=function(userid,dashboarddata,file){
      if(dashboarddata==undefined){
        socket.emit("addDashboardChartResponse",{"error":{"code":"AV001","message":"Please provide marketing data"}});
      }else if(dashboarddata.chartname==undefined){
        socket.emit("addDashboardChartResponse",{"error":{"code":"AV001","message":"Please pass chartname"}});
      }else if(dashboarddata.description==undefined){
        socket.emit("addDashboardChartResponse",{"error":{"code":"AV001","message":"Please pass description"}});
      }else if(dashboarddata.query==undefined){
        socket.emit("addDashboardChartResponse",{"error":{"code":"AV001","message":"Please pass query detail"}});
      }else if(dashboarddata.query.queryid==undefined){
        socket.emit("addDashboardChartResponse",{"error":{"code":"AV001","message":"Please pass queryid"}});
      }else if(dashboarddata.query.queryname==undefined){
        socket.emit("addDashboardChartResponse",{"error":{"code":"AV001","message":"Please pass queryname"}});
      }else{
        ///////////////////////////////////////////////////////
        _validateAddDashboardDataFile(userid,dashboarddata,file);
        ///////////////////////////////////////////////////////
      }
    }

    var _validateAddDashboardDataFile=function(userid,dashboarddata,file){
      var file_name=file.filename;
      var file_buffer=file.filebuffer;
      var file_length=file.filelength;  
      var file_type=file.filetype;
      // logger.emit("log","file details"+JSON.stringify(file));
      var ext = path.extname(file_name||'').split('.');
      ext=ext[ext.length - 1];
      var fileName = __dirname + '/tmp/uploads/' + file_name;
      
      if(!S(file_type).contains("image") ){
        callback({"error":{"message":"You can upload only image of type jpeg or gif"}});
      }else if(file_length>1000000){
        socket.emit("addDashboardChartResponse",{"error":{"message":"You can upload  image of size less than 1mb"}});
      }else{
        fs.open(fileName, 'a', 0755, function(err, fd) {
          if (err) {
           socket.emit("addDashboardChartResponse",{"error":{"message":"_validateAddDashboardDataFile fs.open:"+err}})
          }else{
            fs.write(fd, file_buffer, null, 'Binary', function(err, written, writebuffer) {
              if(err){
                socket.emit("addDashboardChartResponse",{"error":{"message":"_validateAddDashboardDataFile fs.write:"+err}});
              }else{
                var s3filekey=Math.floor((Math.random()*1000)+1)+"."+ext;
                var bucketFolder;
                var params;
                var currentdate=new Date();
                var expirydate=currentdate.setFullYear(currentdate.getFullYear()+2); 
                bucketFolder=amazonbucket+"/user/"+userid+"/dsahboard";
                params = {
                   Bucket: bucketFolder,
                   Key: userid+s3filekey,
                   Body: writebuffer,
                   Expires:expirydate,
                   ACL: 'public-read',
                   ContentType: file_type
               };
               fs.close(fd, function() {
                  exec("rm -rf '"+fileName+"'");                             
                });
               //////////////////////////////////////////////////
               _addDashboardDataWithImages(userid,dashboarddata,params);
               //////////////////////////////////////////////////
              }
            })
          }
        })
      }
    }

    var _addDashboardDataWithImages=function(userid,dashboarddata,awsparams){
      s3bucket.putObject(awsparams, function(err, data) {
        if (err) {
          socket.emit("addDashboardChartResponse",{"error":{"message":"s3bucket.putObject:-_addDashboardDataWithImages"+err}});
        } else {
          var params1 = {Bucket: awsparams.Bucket, Key: awsparams.Key,Expires: 60*60*24*365};
          s3bucket.getSignedUrl('getObject', params1, function (err, url) {
            if(err){
              socket.emit("addDashboardChartResponse",{"error":{"message":"_addDashboardDataWithImages:Error in getting getSignedUrl"+err}});
            }else{
             var dashboard_chart={bucket:params1.Bucket,key:params1.Key,image:url};
             dashboarddata.charts=dashboard_chart;
             var dashboard_obj = new DashboardPoolModel(dashboarddata);
             dashboard_obj.save(function(err,upload_result){
              if(err){
                socket.emit("addDashboardChartResponse",{"error":{"message":"Database Isssue "+err}});
              }else{
                socket.emit("addDashboardChartResponse",null,{"success":{"message":"Dashboard Chart Added successfully","chartname":upload_result.chartname,"chartimage":url}});
              }
             })
            }
          });
        }
      })  
    }

    //add product campaign
     socket.on('addProductCampaign',function(userid,orgid,prodle,campaigndata,file){
       redisClient.get("sess:"+socket.handshake.sessionID, function(err, reply) {
        if(err){
           socket.emit("addProductCampaignResponse",{"error":{"code":"","message":"User Session Expired"}});
        }else if(reply==null){
        socket.emit("addProductCampaignResponse",{"error":{"code":"","message":"User Session Expired"}});
        }else if(JSON.parse(reply).passport.user==undefined){
          socket.emit("addProductCampaignResponse",{"error":{"code":"","message":"User Session Expired"}});
        }else if(userid!=socket.handshake.user.userid){
          socket.emit("addProductCampaignResponse",{"error":{"code":"","message":"You have not authorized to add Warranty"}});
        }else{
          logger.emit("log","CAMPAING DATA"+JSON.stringify(campaigndata))
          ///////////////////////////////////////////////////
          _isValidOrgIDForProductCampaign(campaigndata,orgid,prodle,userid,file)
          ////////////////////////////////////////////////
        }          
        })
      })
    
    var _isValidOrgIDForProductCampaign = function(campaigndata,orgid,prodle,sessionuserid,file){
    OrgModel.findOne({orgid:orgid,status:{$ne:"deactive"}}).lean().exec(function(err,org){
      if(err){
        socket.emit("addProductCampaignResponse",{"error":{"code":"ED001","message":"Error in db to find Product Campain : " +err}});
      }else if(org){
        //////////////////////////////////////////////////
        _isValidProdleForProductCampaign(campaigndata,orgid,prodle,sessionuserid,file);
        //////////////////////////////////////////////////
      }else{      
        socket.emit("addProductCampaignResponse",{"error":{"code":"AP001","message":"Provided orgid is wrong"}});
      }
    })
  }

var _isValidProdleForProductCampaign = function(campaigndata,orgid,prodle,sessionuserid,file){
  ProductModel.findOne({orgid:orgid,prodle:prodle,status:{$ne:"deactive"}}).lean().exec(function(err,org){
    if(err){
      socket.emit("addProductCampaignResponse",{"error":{"code":"ED001","message":"Error in db to find Product Campain : " +err}});
    }else if(org){
      //////////////////////////////////////////////////
      _validateProductCampaignData(campaigndata,orgid,prodle,sessionuserid,file);
      //////////////////////////////////////////////////
    }else{      
      socket.emit("addProductCampaignResponse",{"error":{"code":"AP001","message":"You can not add campaign for the product which does not exist in the organization"}});
    }
  })
}

var _validateProductCampaignData = function(campaigndata,orgid,prodle,sessionuserid,file) {
  //validate the product campain data
  if(campaigndata==undefined){
    socket.emit("addProductCampaignResponse",{"error":{"code":"AV001","message":"Please provide data to add product campain"}});
  }else if(campaigndata.name==undefined){
    socket.emit("addProductCampaignResponse",{"error":{"code":"AV001","message":"Please pass name"}});
  }else if(campaigndata.productname==undefined){
    socket.emit("addProductCampaignResponse",{"error":{"code":"AV001","message":"Please pass productname"}});
  }else if(campaigndata.category==undefined){
    socket.emit("addProductCampaignResponse",{"error":{"code":"AV001","message":"Please pass category"}});
  }else if(campaigndata.description==undefined){
      socket.emit("addProductCampaignResponse",{"error":{"code":"AV001","message":"please pass product description "}});
  }else if(campaigndata.startdate==undefined){
      socket.emit("addProductCampaignResponse",{"error":{"code":"AV001","message":"please pass start date"}});
  }else if(campaigndata.enddate==undefined){
      socket.emit("addProductCampaignResponse",{"error":{"code":"AV001","message":"please pass end date"}});
  }else if(file==undefined){
    socket.emit("addProductCampaignResponse",{"error":{"code":"AV001","message":"please pass campaign banner file"}});
  }else{
      _validateProductCampaginBannerFile(campaigndata,orgid,prodle,sessionuserid,file);      
  }
};
    var _validateProductCampaginBannerFile=function(campaigndata,orgid,prodle,sessionuserid,file){
      var file_name=file.filename;
      var file_buffer=file.filebuffer;
      var file_length=file.filelength;  
      var file_type=file.filetype;
      // logger.emit("log","file details"+JSON.stringify(file));
      var ext = path.extname(file_name||'').split('.');
      ext=ext[ext.length - 1];
      var fileName = __dirname + '/tmp/uploads/' + file_name;
      
      if(!S(file_type).contains("image")){
        socket.emit("addProductCampaignResponse",{"error":{"message":"You can upload only image "}});
      }else if(file_length>1000000){
        socket.emit("addProductCampaignResponse",{"error":{"message":"You can upload  image of size less than 1mb"}});
      }else{
        fs.open(fileName, 'a', 0755, function(err, fd) {
          if (err) {
           socket.emit("addProductCampaignResponse",{"error":{"message":"_validateWarrantyInvoiceFile fs.open:"+err}})
          }else{
            fs.write(fd, file_buffer, null, 'Binary', function(err, written, writebuffer) {
              if(err){
                socket.emit("addProductCampaignResponse",{"error":{"message":"_validateWarrantyInvoiceFile fs.write:"+err}})
              }else{
                var s3filekey=Math.floor((Math.random()*1000)+1)+"."+ext;
                var bucketFolder;
                var params;
                var currentdate=new Date();
                var expirydate=currentdate.setFullYear(currentdate.getFullYear()+2); 
                bucketFolder=amazonbucket+"/org/"+orgid+"/campaign/"+prodle;
                params = {
                   Bucket: bucketFolder,
                   Key: sessionuserid+orgid+prodle+s3filekey,
                   Body: writebuffer,
                   Expires:expirydate,
                   ACL: 'public-read',
                   ContentType: file_type
               };
               fs.close(fd, function() {
                  exec("rm -rf '"+fileName+"'");
                             
                });
               //////////////////////////////////////////////////
               _addProductCampaignWithBanner(sessionuserid,campaigndata,orgid,prodle,params)
               //////////////////////////////////////////////////
              }
            })
          }
        })
      }
    }
    var _addProductCampaignWithBanner=function(userid,campaigndata,orgid,prodle,awsparams){
      s3bucket.putObject(awsparams, function(err, data) {
        if (err) {
          socket.emit("addProductCampaignResponse",{"error":{"message":"s3bucket.putObject:-_addProductCampaignWithBanner"+err}})
        } else {
          var params1 = {Bucket: awsparams.Bucket, Key: awsparams.Key,Expires: 60*60*24*365};
          s3bucket.getSignedUrl('getObject', params1, function (err, url) {
            if(err){
              socket.emit("addProductCampaignResponse",{"error":{"message":"_addProductCampaignWithBanner:Error in getting getSignedUrl"+err}});
            }else{
             var campaign_banner_image={bucket:params1.Bucket,key:params1.Key,image:url}
             campaigndata.banner_image=campaign_banner_image;
             campaigndata.orgid=orgid;
             campaigndata.prodle=prodle;
             var product_campaign_object=new CampaignModel(campaigndata);
             product_campaign_object.save(function(err,product_campaign){
              if(err){
                socket.emit("addProductCampaignResponse",{"error":{"message":"Database Isssue"}});
              }else{
                socket.emit("addProductCampaignResponse",null,{"success":{"message":"Product Campaign Added successfully","campaign_id":product_campaign.campaign_id,"bannerimage":url}});
              }
             })
            }
          });
        }
      })  
    }
    socket.on('uploadFiles', function(file,action) {      
      redisClient.get("sess:"+socket.handshake.sessionID, function(err, reply) {
        if(err){
          logger.emit("log","Errrr in get sessionid client");
        }else{ 
          if(action==undefined){
            logger.emit("error","uploadFiles doesn't know action");
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
                }else if(action.campaign!=undefined){
                  if(action.campaign.campaignbanner==undefined){
                    socket.emit("campaignUploadResponse",{"error":{"message":"Please pass file details or action details"}});
                  }else{
                    socket.emit("campaignBannerUploadResponse",{"error":{"message":"Please pass file details or action details"}});;
                  }
                  // socket.emit("campaignUploadResponse",{"error":{"message":"Please pass file details or action details"}});
                }else if(action.warranty!=undefined){
                  socket.emit("warrantyUploadResponse",{"error":{"message":"Please pass file details or action details"}});
                }else if(action.orgkeyclient!=undefined){
                  socket.emit("orgKeyClientResponse",{"error":{"message":"Please pass file details or action details"}});
                }else if(action.blog!=undefined){
                  socket.emit("blogUploadResponse",{"error":{"message":"Please pass file details or action details"}});
                }else{
                  socket.emit("productLogoResponse",{"error":{"message":"Please pass file details or action details"}});
                }
              }else{
                var user=socket.handshake.user;
                // logger.emit("log","socket session user"+user);
                uploadFile(file,__dirname,action,user,function(err,uploadresult){
                  if(err){
                    logger.emit("error",err.error.message,sessionuserid);
                    if(action.user!=undefined){
                      socket.emit("userUploadResponse",err);
                    }else if(action.org!=undefined){
                      socket.emit("orgUploadResponse",err);
                    }else if(action.product!=undefined){
                      socket.emit("productUploadResponse",err);
                    }else if(action.campaign!=undefined){
                      if(action.campaign.campaignbanner==undefined){
                        socket.emit("campaignUploadResponse",err);
                      }else{
                        socket.emit("campaignBannerUploadResponse",err);
                      }                      
                    }else if(action.warranty!=undefined){
                      socket.emit("warrantyUploadResponse",err);
                    }else if(action.productlogo!=undefined){
                      socket.emit("productUploadLogoResponse",err);
                    }else if(action.orgkeyclient!=undefined){ 
                      socket.emit("orgKeyClientResponse",err);
                    }else if(action.blog!=undefined){ 
                      socket.emit("blogUploadResponse",err);
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
                    }else if(action.campaign!=undefined){
                      if(action.campaign.campaignbanner==undefined){
                        socket.emit("campaignUploadResponse",null,uploadresult);
                      }else{
                        socket.emit("campaignBannerUploadResponse",null,uploadresult);
                      }
                    }else if(action.warranty!=undefined){
                      socket.emit("warrantyUploadResponse",null,uploadresult);
                    }else if(action.productlogo!=undefined){
                      socket.emit("productUploadLogoResponse",null,uploadresult);
                    }else if(action.orglogo!=undefined){
                      socket.emit("orgUploadLogoResponse",null,uploadresult); 
                    }else if(action.blog!=undefined){
                      socket.emit("blogUploadResponse",null,uploadresult); 
                    }else if(action.orgkeyclient!=undefined){
                      socket.emit("orgKeyClientResponse",null,uploadresult);
                    }
                  }
               })
              }
            }   
          });
        }
        }
      })
    })
  

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
    
  }else if(action.campaign!=undefined){//campaign uploads
      console.log("uploadFile action.campaign");
    __campaignImgBuffer(action,file,dirname,action,sessionuser,function(err,result){
      if(err){
         callback(err)
      }else{
        callback(null,result)
      }
    })
    
  }else if(action.warranty!=undefined){//warranty uploads
      console.log("uploadFile action.campaign");
    __warrantyImageBuffer(action,file,dirname,action,sessionuser,function(err,result){
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
  }else  if(action.blog!=undefined){
    console.log("uploadFile action.blog");
    __blogFileBuffer(action,file,dirname,action,sessionuser,function(err,result){
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
 if(!S(file_type).contains("image") || !S(file_type).contains("jpeg") && !S(file_type).contains("gif") && !S(file_type).contains("png")   ){
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
                callback({"error":{"message":"uploadFile fs.write:"+err}});
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

var __campaignImgBuffer=function(action,file,dirname,action,sessionuser,callback){
  console.log("__campaignImgBuffer");
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
    callback({"error":{"message":"You can upload image of size less than 1mb"}});
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
                    
                      if(action.campaign.userid!=sessionuser.userid){
                        callback({"error":{"code":"EA001","message":"You are not an authorized to change user campaign image"}});   
                      }else{
                        var currentdate=new Date();
                        var expirydate=currentdate.setFullYear(currentdate.getFullYear()+2); 
                        bucketFolder=amazonbucket+"/org/"+action.campaign.orgid+"/campaign/"+action.campaign.prodle;
                        params = {
                             Bucket: bucketFolder,
                             Key: action.campaign.userid+s3filekey,
                             Body: writebuffer,
                             ACL: 'public-read',
                             Expires:expirydate,
                             ContentType: file_type
                        };
                        if(action.campaign.campaignbanner!=undefined){
                           campaignBannerImageChange(action.campaign.campaign_id,params,file_name,function(err,result){
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
                           campaignImgUpload(action.campaign.campaign_id,params,file_name,function(err,result){
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

var __warrantyImageBuffer=function(action,file,dirname,action,sessionuser,callback){
  console.log("__warrantyImageBuffer");
  var file_name=file.filename;
  var file_buffer=file.filebuffer;
  var file_length=file.filelength;
  var file_type=file.filetype;

  var ext = path.extname(file_name||'').split('.');
  ext=ext[ext.length - 1];
  var fileName = dirname + '/tmp/uploads/' + file_name;
  if(!S(file_type).contains("image") && !S(file_type).contains("pdf") ){
    callback({"error":{"message":"You can upload only image of type jpeg or gif"}});
  }else if(file_length>500000){
    callback({"error":{"message":"You can upload image of size less than 1mb"}});
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
                        callback({"error":{"code":"EA001","message":"You are not an authorized to change user campaign image"}});   
                      }else{
                        var currentdate=new Date();
                        var expirydate=currentdate.setFullYear(currentdate.getFullYear()+2); 
                        bucketFolder=amazonbucket+"/user/"+action.warranty.userid+"/warranty";
                        params = {
                             Bucket: bucketFolder,
                             Key: action.warranty.userid+s3filekey,
                             Body: writebuffer,
                             ACL: 'public-read',
                             Expires:expirydate,
                             ContentType: file_type
                        };
                        warrantyImageUpload(action.warranty.warranty_id,params,file_name,file_type,function(err,result){
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

var __blogFileBuffer = function(action,file,dirname,action,sessionuser,callback){
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
  if(!S(file_type).contains("image") || !S(file_type).contains("jpeg") && !S(file_type).contains("gif") && !S(file_type).contains("png") && !S(file_type).contains("jpg") ){
    callback({"error":{"message":"You can upload only image of type jpeg or gif"}});
  }else if(file_length>500000){
    callback({"error":{"message":"You can upload  image of size less than 500 kb"}});
  }else{
    easyimg.info(fileName,function(err,info){
      logger.emit("log","error"+err);
      if(info.width<100 && info.height<128){
        callback({"error":{"message":"Please upload image of atleast width and height 700 and 300 respectively"}});
      }else{
        fs.open(fileName, 'a', 0755, function(err, fd) {
          if (err) {
            callback({"error":{"message":"uploadFile fs.open:"+err}});
          }else{
            fs.write(fd, file_buffer, null, 'Binary', function(err, written, writebuffer) {
              if(err){
                callback({"error":{"message":"uploadFile fs.write:"+err}});
              }else{
                 
                    var s3filekey=Math.floor((Math.random()*1000)+1)+"."+ext;
                     var bucketFolder;
                     var params;
                     // writebuffer= new Buffer(file_buffer, "base64");
                    
                      if(sessionuser.author.authorid==null){
                        callback({"error":{"code":"EA001","message":"You are not an author user "}});   
                      }else{
                        if(action.blog.userid!=sessionuser.userid){
                          callback({"error":{"code":"EA001","message":"You are not an authorized to add blog data"}});   
                        }else if(sessionuser.author.isAdmin==false){
                          callback({"error":{"code":"EA001","message":"You are not authorized to add blog data"}});
                        }else{
                          var currentdate=new Date();
                          var expirydate=currentdate.setFullYear(currentdate.getFullYear()+2); 
                          bucketFolder=amazonbucket+"/blog/user/"+action.blog.userid+"/"+action.blog.blogid;
                          params = {
                             Bucket: bucketFolder,
                             Key: action.blog.authorid+s3filekey,
                             Body: writebuffer,
                             Expires:expirydate,
                             ACL: 'public-read',
                             ContentType: file_type
                          };
                          console.log("action : ############ : "+JSON.stringify(action));
                        blogFileUpload(action.blog.blogid,params,file_name,function(err,result){
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

var campaignImgUpload=function(campaign_id,awsparams,filename,callback){
  s3bucket.putObject(awsparams, function(err, data) {
    if (err) {
      callback({"error":{"message":"s3bucket.putObject:-campaignImgUpload"+err}})
    } else {
      logger.emit("log","fileupload saved");
      var params1 = {Bucket: awsparams.Bucket, Key: awsparams.Key,Expires: 60*60*24*365};
      s3bucket.getSignedUrl('getObject',params1, function (err, url) {
        if(err){
          callback({"error":{"message":"campaignImgUpload:Error in getting getSignedUrl "+err}});
        }else{
          var campaignImg_object={bucket:params1.Bucket,key:params1.Key,image:url,imageid:generateId()}
          CampaignModel.update({campaign_id:campaign_id},{$push:{artwork:campaignImg_object}},function(err,campaignuploadstatus){
            if(err){
              callback({"error":{"code":"EDOO1","message":"campaignImgUpload:DBerror "+err}});
            }else if(campaignuploadstatus==1){
              callback(null,{"success":{"message":"Campaign image uploaded successfully","image":url,"filename":filename}})
            }else{
              callback({"error":{"code":"AP001","message":"Wrong campaign_id "+campaign_id}});
            }
          })
        }
      });
    }
  })  
}
var campaignBannerImageChange=function(campaign_id,awsparams,filename,callback){
  s3bucket.putObject(awsparams, function(err, data) {
    if (err) {
      callback({"error":{"message":"s3bucket.putObject:-campaignBannerImageChange"+err}})
    } else {
      logger.emit("log","fileupload saved");
      var params1 = {Bucket: awsparams.Bucket, Key: awsparams.Key,Expires: 60*60*24*365};
      s3bucket.getSignedUrl('getObject',params1, function (err, url) {
        if(err){
          callback({"error":{"message":"campaignBannerImageChange:Error in getting getSignedUrl "+err}});
        }else{
         var banner_image_object={bucket:params1.Bucket,key:params1.Key,image:url};
          CampaignModel.findAndModify({campaign_id:campaign_id},[],{$set:{banner_image:banner_image_object}},{new:false},function(err,campaignimagedata){
            if(err){
              callback({"error":{"code":"EDOO1","message":"Campaign Image:Dberror"+err}});
            }else if(campaignimagedata){
              CampaignModel.findAndModify({campaign_id:campaign_id},[],{$unset:{bannertext:1}},{new:false},function(err,campaigndata){
                if(err){
                  logger.emit("error","Error in db to update campaign");
                }else if(campaigndata){
                  logger.emit("log","Banner text remove successfully");
                }else{
                  logger.emit("error","Wrong Campaign id to unset bannertext");
                } 
              });
              var banner_image=campaignimagedata.banner_image;
              if(banner_image==undefined){
                logger.emit("log","first time banner_image changes");
              }else{
                var awsdeleteparams={Bucket:campaignimagedata.bucket,Key:campaignimagedata.key};
                s3bucket.deleteObject(awsdeleteparams, function(err, deleteorglogostatus) {
                  if (err) {
                    logger.emit("error","Campaign Banner Image not  deleted from amzon s3 bucket for campaign_id"+campaignimagedata.campaign_id);
                  }else if(deleteorglogostatus){
                    logger.emit("log","Campaign Banner Image deleted from Amazon S3");
                  }
                }) 
              }
              
              callback(null,{"success":{"message":"Banner Image Changed  Successfully","image":url,"filename":filename}})
            }else{
              callback({"error":{"code":"AO002","message":"Wrong campaign_id"+campaign_id}});
            }
          })
        }
      });
    }
  })  
}

var warrantyImageUpload=function(warranty_id,awsparams,filename,filetype,callback){
  s3bucket.putObject(awsparams, function(err, data) {
    if (err) {
      callback({"error":{"message":"s3bucket.putObject:-warrantyImageUpload"+err}})
    } else {
      logger.emit("log","fileupload saved");
      var params1 = {Bucket: awsparams.Bucket, Key: awsparams.Key,Expires: 60*60*24*365};
      s3bucket.getSignedUrl('getObject',params1, function (err, url) {
        if(err){
          callback({"error":{"message":"warrantyImageUpload:Error in getting getSignedUrl "+err}});
        }else{
          var warranty_img_object={bucket:params1.Bucket,key:params1.Key,image:url,filetype:filetype};

          WarrantyModel.update({warranty_id:warranty_id},{$set:{invoice_image:warranty_img_object}},function(err,warrantyuploadstatus){
            if(err){
              callback({"error":{"code":"EDOO1","message":"warrantyImageUpload:DBerror "+err}});
            }else if(warrantyuploadstatus==1){
              callback(null,{"success":{"message":"Campaign image uploaded successfully","image":url,"filename":filename}})
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
})
}

var blogFileUpload =function(blogid,awsparams,filename,callback){
  s3bucket.putObject(awsparams, function(err, data){
    if (err) {
      callback({"error":{"message":"s3bucket.putObject:-blogFileUpload"+err}});
    }else{
      logger.emit("log","fileupload saved");
      var params1 = {Bucket: awsparams.Bucket, Key: awsparams.Key,Expires: 60*60*24*365};
      s3bucket.getSignedUrl('getObject',params1, function (err, url) {
        if(err){
          callback({"error":{"message":"blogFileUpload : Error in getting getSignedUrl"+err}});
        }else{
          var blog_object={bucket:params1.Bucket,key:params1.Key,image:url,imageid:generateId()};
           blogModel.update({blogid:blogid},{$push:{blog_images:blog_object}},function(err,blogupdatestatus){
            if(err){
              callback({"error":{"code":"EDOO1","message":"blogFileUpload : DBerror : "+err}});
            }else if(blogupdatestatus==1){
              callback(null,{"success":{"message":"Blog data uploaded successfully","filename":filename}});
            }else{
              callback({"error":{"code":"AO002","message":"Wrong blogid"+blogid}});
            }
          })
        }
      });
    }
  })  
}
