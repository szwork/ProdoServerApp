/*
* Overview: Organization Model
* Dated:
* Author: Sunil More
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* 27-3/2013 | xyx | Add a new property
* 08-10-2013|Sunil|added method addOrganization,sendInvite,addedGroupMember
*/
//impprting alll required model
var orgModel = require('./org-model');
var orgHistoryModel = require('./org-history-model'); 
var userModel = require('../../user/js/user-model');
var verificationTokenModel = require('../../common/js/verification-token-model');
var EmailTemplateModel=require('../../common/js/email-template-model');

var CONFIG = require('config').Prodonus;
//importing require userdefined api
var commonapi = require('../../common/js/common-api');
var userapi = require('../../user/js/user-api');

//importing system
var mongodb = require("mongodb");
var S=require('string');
var BSON = mongodb.BSONPure;
var events = require('events');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var logger=require("../../common/js/logger");
var Organization=require("./org");

//adding new organization

exports.addOrganization = function(req,res){
 
  
  var organizationdata=req.body.organization;
  var organization=new Organization(organizationdata);
  logger.emit("log","organization data"+JSON.stringify(req.body));
  //var userdata=req.body.user;
  //logger.emit("userdata"+userdata);
  organization.removeAllListeners("successfulOrgAdd");
  organization.on("successfulOrgAdd",function(result){
    logger.emit("info",result.success.message);
    organization.removeAllListeners();
    res.send(result);
  });
  organization.removeAllListeners("failedOrgAdd");
  organization.on("failedOrgAdd",function(err){
    logger.emit("error",err.error.message,req.user.userid);
    organization.removeAllListeners();
    res.send(err);
  })
  organization.removeAllListeners("sendinvitemail");
  organization.on('sendinvitemail',function(userdata,emailtemplatedata,orgname,i){
    var emailtemplate=S(emailtemplatedata.description);
    logger.emit("log","calling to sendinvitemail"+i);
    // logger.emit("log")
    logger.emit("log","userdata"+JSON.stringify(userdata));
    // if(userdata.length>i){
      userModel.findOne({email:userdata[i].email},{userid:1},function(err,user){
        if(err){
          logger.emit("error","error in db to find users",req.user.userid);
        }else if(!user){
          logger.emit("error","user does'nt exists",req.user.userid);
        }else{
          var verificationToken = new verificationTokenModel({_userId: user.userid,tokentype:"user"});
          verificationToken.createVerificationToken(function (err, token) {
            if (err){  
                logger.emit("error","Error in crating verification token for"+user.userid,req.user.userid);
            }else{
                
                var html=S(emailtemplate);
                logger.emit("log",""+html);
                var url = "http://"+req.get("host")+"/api/verify/"+token;
                html=html.replaceAll("<email>",user.email);
                html=html.replaceAll("<url>",url);
                var subject=S(emailtemplatedata.subject);
                subject=subject.replaceAll("<companyname>",orgname);
               var message = {
                  from: "Prodonus  <sunil@giantleapsystems.com>", // sender address
                  to: userdata[i].email, // list of receivers
                  subject:subject.s, // Subject line
                  html: html.s // html body
              };
              logger.emit("log","message:"+JSON.stringify(message)+"\n email:"+userdata[i].email);
              commonapi.sendMail(message,function(result){
                if (result == "failure") {
                 logger.emit("error","Error in sending invite mail to "+userdata[i].email,req.user.userid);
                 
                 logger.emit("log","message not sent to :"+userdata[i].email);
                 // organization.emit("sendinvitemail",userdata,emailtemplatedata,orgname,i);
                 //i+=1;
                 //organization.emit("sendinvitemail",userdata,emailtemplatedata,orgname,i);
              } else {
                  
                    logger.emit("log","message  sent to :"+userdata[i].email);
                   // organization.emit("sendinvitemail",userdata,emailtemplatedata,orgname,i);
                  }
              })
            }
          })
        }
      })
    // } else {
    //   logger.emit("log","successfully sent invite email");
    // }
  });
  var sessionuserid=req.user.userid;
  organization.addOrganization(sessionuserid);
}
 //to update an existing organization
exports.updateOrganization = function(req, res) {
  var orgid=req.params.orgid;
  var orgdata=req.body.organization;
  var organization = new Organization(orgdata);
  var sessionuserid=req.user.userid;
  organization.removeAllListeners("failedOrgUpdation");
    organization.on("failedOrgUpdation",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // organization.removeAllListeners();
      res.send(err);
    });
  organization.removeAllListeners("successfulOrgUpdation");
  organization.on("successfulOrgUpdation",function(result){
    logger.emit("info", result.success.message,sessionuserid);
    // organization.removeAllListeners();
    res.send(result);
  });
    
    var isAdmin=req.user.org.isAdmin;
    if(req.user.org.orgid==orgid || isAdmin)
    {
      organization.updateOrganization(orgid);
    }else{
       organization.emit("failedOrgUpdation",{"error":{"code":"EA001","message":"You have not authorize to done this action"}})
    }
    
}
 exports.deleteOrganization = function(req, res) {
  var orgid=req.params.orgid;
  var sessionuserid=req.user.userid;
  var organization=new Organization();
  organization.removeAllListeners("failedOrgDeletion");
      organization.on("failedOrgDeletion",function(err){
        logger.emit("error", err.error.message,req.user.userid);
        // organization.removeAllListeners();
        res.send(err);
      });
     organization.removeAllListeners("successfulOrgDeletion");
      organization.on("successfulOrgDeletion",function(result){
        logger.emit("info", result.success.message);
        // organization.removeAllListeners();
        res.send(result);
      });
     var isAdmin=req.user.org.isAdmin;
     if(req.user.org.orgid==orgid || isAdmin) {
      //////////////////////
      organization.deleteOrganization(orgid,sessionuserid);
     }else{
       organization.emit("failedOrgDeletion",{"error":{"code":"EA001","message":"You have not authorize to done this action"}})
     }
}
//
exports.getOrganization = function(req, res) {
  var orgid=req.params.orgid;
  var sessionuserid=req.user.userid;
  var organization=new Organization();
  organization.removeAllListeners("failedOrganizationGet");
  organization.on("failedOrganizationGet",function(err){
      logger.emit("error", err.error.message,req.user.userid);
      // organization.removeAllListeners();
      res.send(err);
    });
  organization.removeAllListeners("successfulOrganizationGet");
  organization.on("successfulOrganizationGet",function(result){
    logger.emit("info", result.success.message);
      // organization.removeAllListeners();
    res.send(result);
  });
  organization.getOrganization(orgid);

};
exports.getAllOrganization = function(req, res) {
  
  var sessionuserid=req.user.userid;
  var organization=new Organization();
  organization.removeAllListeners("failedOrganizationGetAll");
  organization.on("failedOrganizationGetAll",function(err){
      logger.emit("error", err.error.message,req.user.userid);
      // organization.removeAllListeners();
      res.send(err);
    });
 organization.removeAllListeners("successfulOrganizationGetAll");
    organization.on("successfulOrganizationGetAll",function(result){
      logger.emit("info", result.success.message);
      // organization.removeAllListeners();
      res.send(result);
    });
    organization.getAllOrganization();
}

///
//
exports.getOrgAddressByCriteria=function(req,res){
  var OrgCriteriaData=req.query;
  logger.emit("log","req query getOrgAddressByCriteria"+JSON.stringify(OrgCriteriaData));
  var orgid=req.params.orgid;
   
  var sessionuserid=req.user.userid;
  var organization=new Organization();
  organization.removeAllListeners("failedGetOrgAddressByCriteria");
  organization.on("failedGetOrgAddressByCriteria",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    res.send(err);
  });
  organization.removeAllListeners("successfulGetOrgAddressByCriteria");
  organization.on("successfulGetOrgAddressByCriteria",function(result){
    logger.emit("info", result.success.message);
    res.send(result);
  });
  // if(req.user.orgid==orgid){
  //   organization.getOrgAddressByCriteria(OrgCriteriaData,orgid);  
  // }
  organization.getOrgAddressByCriteria(OrgCriteriaData,orgid);
}
exports.addOrgAddress=function(req,res){
  var orgaddressdata=req.body.location;
  logger.emit("log","req body addOrgAddress :\n"+JSON.stringify(orgaddressdata));
  // orgaddressdata=orgaddressdata.orgaddress;  
  var orgid=req.params.orgid;
  var sessionuserid=req.user.userid;
  var organization=new Organization();
  organization.removeAllListeners("failedaddOrgAddress");
  organization.on("failedaddOrgAddress",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    res.send(err);
  });
  organization.removeAllListeners("successfuladdOrgAddress");
  organization.on("successfuladdOrgAddress",function(result){
    logger.emit("info", result.success.message);
    res.send(result);
  });
  if(req.user.org.orgid!=orgid){
    logger.emit("log","Given orgid is not match with session userid");
    organization.emit("failedaddOrgAddress",{"error":{"code":"EA001","message":"You have not authorized to add Organization Address"}});
  }else if(req.user.org.isAdmin==false){
    logger.emit("log","You are not an admin to add org");
    organization.emit("failedaddOrgAddress",{"error":{"code":"EA001","message":"You have not authorized to add Organization Address"}}); 
  }else{
    /////////////////////////////////
    organization.addOrgAddress(orgid,orgaddressdata);
    //////////////////////////////// 
  }
}
exports.updateOrgAddress=function(req,res){
  var orgaddressdata=req.body.location;
  logger.emit("log","req body updateOrgAddress :\n"+JSON.stringify(orgaddressdata));
  // orgaddressdata=orgaddressdata.orgaddress;  
  var orgid=req.params.orgid;
  var orgaddressid=req.params.orgaddressid;
  var sessionuserid=req.user.userid;
  var organization=new Organization();
  organization.removeAllListeners("failedUpdateAddress");
  organization.on("failedUpdateAddress",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    res.send(err);
  });
  organization.removeAllListeners("successfulUpdateAddress");
  organization.on("successfulUpdateAddress",function(result){
    logger.emit("info", result.success.message);
    res.send(result);
  });
  if(req.user.org.orgid!=orgid){
    logger.emit("log","Given orgid is not match with session userid");
    organization.emit("failedUpdateAddress",{"error":{"code":"EA001","message":"You have not authorized to update Organization Address"}});
  }else if(req.user.org.isAdmin==false){
    logger.emit("log","You are not an admin to add org");
    organization.emit("failedUpdateAddress",{"error":{"code":"EA001","message":"You have not authorized to update Organization Address"}}); 
  }else{
    /////////////////////////////////
    organization.updateOrgAddress(orgid,orgaddressid,orgaddressdata);
    //////////////////////////////// 
  }
}
exports.deleteOrgAddress=function(req,res){
  
  
  // orgaddressdata=orgaddressdata.orgaddress;  
  var orgid=req.params.orgid;
  var orgaddressid=req.params.orgaddressid;
  var sessionuserid=req.user.userid;
  var organization=new Organization();
  organization.removeAllListeners("failedDeleteOrgAddress");
  organization.on("failedDeleteOrgAddress",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    res.send(err);
  });
  organization.removeAllListeners("successfulDeleteOrgAddress");
  organization.on("successfulDeleteOrgAddress",function(result){
    logger.emit("info", result.success.message);
    res.send(result);
  });
  if(req.user.org.orgid!=orgid){
    logger.emit("log","Given orgid is not match with session userid");
    organization.emit("failedDeleteOrgAddress",{"error":{"code":"EA001","message":"You have not authorized to delete Organization Address"}});
  }else if(req.user.org.isAdmin==false){
    logger.emit("log","You are not an admin to add org");
    organization.emit("failedDeleteOrgAddress",{"error":{"code":"EA001","message":"You have not authorized to delete Organization Address"}}); 
  }else{
    /////////////////////////////////
    organization.deleteOrgAddress(orgid,orgaddressid);
    //////////////////////////////// 
  }
}
//////////////////
//old code
///////////////
//invites to group members
exports.orginvites = function(req,res) { 
  //value taking from parameters
  var usergrp=req.body.usergrp;
  var orgid=req.params.orgid;
  logger.emit("log","REQ BODY orgInvites: "+JSON.stringify(req.body));
  
  var sessionuserid=req.user.userid;
  var organization=new Organization();
  organization.removeAllListeners("failedOrgInvites");
  organization.on("failedOrgInvites",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    res.send(err);
  });
  organization.removeAllListeners("successfulOrgInvites");
  organization.on("successfulOrgInvites",function(result){
    logger.emit("info", result.success.message);
    res.send(result);
  });
  organization.removeAllListeners("sendEmailToInvitees");
  organization.on('sendEmailToInvitees',function(email,emailtemplate,orgname,grpname){
    var template_description=emailtemplate.description;
    
    
      userModel.findOne({email:email},{userid:1,email:1},function(err,user){
        if(err){
          logger.emit("error","error in db to find users",req.user.userid);
        }else if(!user){
          logger.emit("error","user does'nt exists",req.user.userid);
        }else{
          var verificationToken = new verificationTokenModel({_userId: user.userid,tokentype:"user"});
          verificationToken.createVerificationToken(function (err, token) {
            if (err){  
                logger.emit("error","Error in crating verification token for"+user.userid,req.user.userid);
            }else{
                var html=S(template_description); 
                var url = "http://"+req.get("host")+"/api/verify/"+token;
                html=html.replaceAll("<email>",user.email);
                html=html.replaceAll("<url>",url);
                html=html.replaceAll("<orgname>",orgname);
                html=html.replaceAll("<grpname",grpname);
                
               var message = {
                  from: "Prodonus  <noreply@prodonus.com>", // sender address
                  to: user.email, // list of receivers
                  subject:emailtemplate.subject, // Subject line
                  html: html.s // html body
              };
              commonapi.sendMail(message,function(result){
                if (result == "failure") {
                   logger.emit("error","Error in sending invite mail to "+email,req.user.userid);
                }else {
                  logger.emit("log","invite sent to"+email); 
                }
              })
            }
          })
        }
      })
    
  });
  if(req.user.org.orgid!=orgid){
    logger.emit("log","Given orgid is not match with session userid");
    organization.emit("failedOrgInvites",{"error":{"code":"EA001","message":"You have not authorized to add Organization invites"}});
  }else if(req.user.org.isAdmin==false){
    logger.emit("log","You are not an admin to add org");
    organization.emit("failedOrgInvites",{"error":{"code":"EA001","message":"You have not authorized to add Organization invites"}}); 
  }else{
    //////////////////////////////////////
    organization.orgInvites(orgid,usergrp);
    ////////////////////////////////////// 
  }
  
};//end of invites method


//send an invite email to usergroup members


//delete a particular organization

exports.deleteOrgImage=function(req,res){
 
  var sessionuserid=req.user.userid;
  
  var orgimageids=req.body.orgimageids;
  var orgid=req.params.orgid;
  logger.emit("log","prodle\nsessionuserid"+sessionuserid+" prodleimageid:"+orgimageids+"orgid:"+orgid+"prodleimageids:"+JSON.stringify(orgimageids));
  
  var organization= new Organization();
     // product.setMaxListeners(0); 
  organization.removeAllListeners("failedDeleteOrgImage");
  organization.on("failedDeleteOrgImage",function(err){
    logger.emit("log","error:"+err.error.message+":"+sessionuserid);
    logger.emit("error", err.error.message,sessionuserid);
    // product.removeAllListeners();
    res.send(err);
     // eventEmitter.removeListener(this);
  });
  organization.removeAllListeners("successfulDeleteOrgImage");
  organization.on("successfulDeleteOrgImage",function(result){
    //logger.emit("log","Getting Product details successfully");
    logger.emit("info", result.success.message,sessionuserid);
    // product.removeAllListeners();

    res.send(result);
    // eventEmitter.removeListener(this);
  });
   if(req.user.org.orgid!=orgid){
    logger.emit("error","given orgid does not match with session orgid");
    organization.emit("failedDeleteOrgImage",{"error":{"code":"EA001","message":"You have not authorized to delete Org image"}}); 
   }else if(req.user.org.isAdmin==false){
    logger.emit("log","You are not an admin to delete product image");
    organization.emit("failedDeleteOrgImage",{"error":{"code":"EA001","message":"You have not authorized to delete Org image"}}); 
  }else{
    ////////////////////////////////////////////////////////////
    organization.deleteOrgImage(orgimageids,req.user.org.orgid);
    //////////////////////////////////////////////// ///////////
  }
}
