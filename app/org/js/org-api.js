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
  var subscriptiondata=req.body.subscription;
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
  organization.removeAllListeners("sendneorguserinviteemail");
  organization.on('sendneorguserinviteemail',function(email,emailtemplate,orgname,grpname){
    var template_description=emailtemplate.description;
    userModel.findOne({email:email},{userid:1,email:1},function(err,user){
      if(err){
        logger.emit("error","error in db to find users",req.user.userid);
      }else if(!user){
        logger.emit("error","user does'nt exists",req.user.userid);
      }else{
        var verificationToken = new verificationTokenModel({_userId: user.userid,tokentype:"inviteuser"});
        verificationToken.createVerificationToken(function (err, token) {
          if (err){  
            logger.emit("error","Error in crating verification token for"+user.userid,req.user.userid);
          }else{
            var html=S(template_description); 
            var url = "http://"+req.get("host")+"/api/verify/"+token;
            html=html.replaceAll("<email>",user.email);
            html=html.replaceAll("<url>",url);
            html=html.replaceAll("<orgname>",orgname);
            html=html.replaceAll("<grpname>",grpname);
            var subject=S(emailtemplate.subject); 
            subject=subject.replaceAll("<orgname>",orgname);
            subject=subject.replaceAll("<grpname>",grpname);
            
            var message = {
              from: "Prodonus  <noreply@prodonus.com>", // sender address
              to: user.email, // list of receivers
              subject:subject.s, // Subject line
              html: html.s // html body
            };
            commonapi.sendMail(message,CONFIG.smtp_general,function(result){
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
    organization.removeAllListeners("sendinvitemail");
    organization.on('sendinvitemail',function(email,emailtemplate,orgname,grpname){//already invite email is registered with
      var template_description=emailtemplate.description;
      userModel.findOne({email:email},{userid:1,email:1},function(err,user){
          if(err){
            logger.emit("error","error in db to find users",req.user.userid);
          }else if(!user){
            logger.emit("error","user does'nt exists",req.user.userid);
          }else{
             var html=S(template_description); 
              html=html.replaceAll("<email>",user.email);
              html=html.replaceAll("<orgname>",orgname);
              html=html.replaceAll("<grpname>",grpname);
              var subject=S(emailtemplate.subject);
              subject=subject.replaceAll("<orgname>",orgname);
              subject=subject.replaceAll("<grpname>",grpname);
             var message = {
                from: "Prodonus  <noreply@prodonus.com>", // sender address
                to: user.email, // list of receivers
                subject:subject.s, // Subject line
                html: html.s // html body
            };
            commonapi.sendMail(message,CONFIG.smtp_general,function(result){
              if (result == "failure") {
                 logger.emit("error","Error in sending invite mail to "+email,req.user.userid);
              }else {
                logger.emit("log","invite sent to"+email); 
              }
            })
        }
      })
    })
    
  
  var sessionuserid=req.user.userid;
  organization.addOrganization(sessionuserid,subscriptiondata);
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
  organization.removeAllListeners("sendorginviteandverification");
  organization.on('sendorginviteandverification',function(email,emailtemplate,orgname,grpname){
    var template_description=emailtemplate.description;
    userModel.findOne({email:email},{userid:1,email:1},function(err,user){
        if(err){
          logger.emit("error","error in db to find users",req.user.userid);
        }else if(!user){
          logger.emit("error","user does'nt exists",req.user.userid);
        }else{
          var verificationToken = new verificationTokenModel({_userId: user.userid,tokentype:"inviteuser"});
          verificationToken.createVerificationToken(function (err, token) {
            if (err){  
                logger.emit("error","Error in crating verification token for"+user.userid,req.user.userid);
            }else{
                var html=S(template_description); 
                var url = "http://"+req.get("host")+"/api/verify/"+token;
                html=html.replaceAll("<email>",user.email);
                html=html.replaceAll("<url>",url);
                html=html.replaceAll("<orgname>",orgname);
                html=html.replaceAll("<grpname>",grpname);
                var subject=S(emailtemplate.subject);
                subject=subject.replaceAll("<orgname>",orgname);
                subject=subject.replaceAll("<grpname>",grpname);
               var message = {
                  from: "Prodonus  <noreply@prodonus.com>", // sender address
                  to: user.email, // list of receivers
                  subject:subject.s, // Subject line
                  html: html.s // html body
              };
              commonapi.sendMail(message,CONFIG.smtp_general,function(result){
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
     })
    organization.removeAllListeners("sendorginvites");
    organization.on('sendorginvites',function(email,emailtemplate,orgname,grpname){//already invite email is registered with
      var template_description=emailtemplate.description;
      userModel.findOne({email:email},{userid:1,email:1},function(err,user){
          if(err){
            logger.emit("error","error in db to find users",req.user.userid);
          }else if(!user){
            logger.emit("error","user does'nt exists",req.user.userid);
          }else{
             var html=S(template_description); 
              html=html.replaceAll("<email>",user.email);
              html=html.replaceAll("<orgname>",orgname);
              html=html.replaceAll("<grpname>",grpname);
              var subject=S(emailtemplate.subject);
              subject=subject.replaceAll("<orgname>",orgname);
              subject=subject.replaceAll("<grpname>",grpname);
             var message = {
                from: "Prodonus  <noreply@prodonus.com>", // sender address
                to: user.email, // list of receivers
                subject:subject.s, // Subject line
                html: html.s // html body
            };
            commonapi.sendMail(message,CONFIG.smtp_general,function(result){
              if (result == "failure") {
                 logger.emit("error","Error in sending invite mail to "+email,req.user.userid);
              }else {
                logger.emit("log","invite sent to"+email); 
              }
            })
        }
      })
    })
    
  
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

exports.deleteOrgImage=function(req,res){s
 
  var sessionuserid=req.user.userid;
  
  var orgimageids=req.params.orgimageids;
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
exports.otherOrgInvites=function(req,res){
  var otherorginvites=req.body.otherorginvites;
  var orgid=req.params.orgid;
  logger.emit("log","REQ BODY orgInvites: "+JSON.stringify(req.body));
  
  var sessionuserid=req.user.userid;
  var organization=new Organization();
  organization.removeAllListeners("failedOtherOrgInvites");
  organization.on("failedOtherOrgInvites",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    res.send(err);
  });
  organization.removeAllListeners("successfulOtherOrgInvites");
  organization.on("successfulOtherOrgInvites",function(result){
    logger.emit("info", result.success.message);
    res.send(result);
  });
  organization.removeAllListeners("sendotherorginvite");
  organization.on("sendotherorginvite",function(otherorginvite_template,inivtedata,user,organization_data){
    var subject=S(otherorginvite_template.subject);
    var template=S(otherorginvite_template.description);
    template=template.replaceAll("<email>",user.email);
    template=template.replaceAll("<fromusername>",user.username);
    template=template.replaceAll("<orgname>",organization_data.name);
    template=template.replaceAll("<name>",inivtedata.name);
    var message = {
        from: "Prodonus  <business@prodonus.com>", // sender address
        to: inivtedata.email, // list of receivers
        subject:subject.s, // Subject line
        html: template.s // html body
      };
    commonapi.sendMail(message,CONFIG.smtp_business, function (result){
      if(result=="failure"){
        logger.emit("error","company inivte not sent to "+message.to+" by"+user.email);
      }else{
        logger.emit("log","Company Invite Sent Successfully to"+message.to+" by"+user.email);
      }
    });
  });
  if(req.user.org.orgid!=orgid){
    logger.emit("log","Given orgid is not match with session userid");
    organization.emit("failedOtherOrgInvites",{"error":{"code":"EA001","message":"You have not authorized to send invite to other company"}});
  }else if(req.user.org.isAdmin==false){
    logger.emit("log","You are not an admin to add org");
    organization.emit("failedOtherOrgInvites",{"error":{"code":"EA001","message":"You have not authorized to send invite to other company"}}); 
  }else{
    //////////////////////////////////////////////////////////////////////
    organization.sendOtherOrgInvites(orgid,otherorginvites,sessionuserid);
    ////////////////////////////////////////////////////////////////////// 
  }
}
exports.OrgCustomerInvites=function(req,res){
  var orgcustomerinvites=req.body.orgcustomerinvites;
  var orgid=req.params.orgid;
  logger.emit("log","REQ BODY OrgCustomerInvites: "+JSON.stringify(req.body));
  
  var sessionuserid=req.user.userid;
  var organization=new Organization();
  organization.removeAllListeners("failedOrgCustomerInvites");
  organization.on("failedOrgCustomerInvites",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    res.send(err);
  });
  organization.removeAllListeners("successfulOrgCustomerInvites");
  organization.on("successfulOrgCustomerInvites",function(result){
    logger.emit("info", result.success.message);
    res.send(result);
  });
  organization.removeAllListeners("sendinviteorgcustomer");
  organization.on("sendinviteorgcustomer",function(orgcustomerinvite_template,orgcustomer,user,organization){
    var subject=S(orgcustomerinvite_template.subject);
    var template=S(orgcustomerinvite_template.description);
    template=template.replaceAll("<email>",user.email);
    template=template.replaceAll("<fromusername>",user.username);
    template=template.replaceAll("<orgname>",organization.name);
    template=template.replaceAll("<customername>",orgcustomer.name);
    
    var message = {
        from: "Prodonus  <noreply@prodonus.com>", // sender address
        to: orgcustomer.email, // list of receivers
        subject:subject.s, // Subject line
        html: template.s // html body
      };
    commonapi.sendMail(message,CONFIG.smtp_general, function (result){
      if(result=="failure"){
        logger.emit("error","Organization Customer invite not sent to "+message.to+" by"+user.email);
      }else{
        logger.emit("log","Organization Customer invite Sent Successfully to"+message.to+" by"+user.email);
      }
    });
  });
  if(req.user.org.orgid!=orgid){
    logger.emit("log","Given orgid is not match with session userid");
    organization.emit("failedOrgCustomerInvites",{"error":{"code":"EA001","message":"You have not authorized to send invite to other company"}});
  }else if(req.user.org.isAdmin==false){
    logger.emit("log","You are not an admin to add org");
    organization.emit("failedOrgCustomerInvites",{"error":{"code":"EA001","message":"You have not authorized to send invite to other company"}}); 
  }else{
    //////////////////////////////////////////////////////////////////////
    organization.sendOrgCustomerInvites(orgid,orgcustomerinvites,sessionuserid);
    ////////////////////////////////////////////////////////////////////// 
  }
}
exports.getMyGroupMembers=function(req,res){

  var orgid=req.params.orgid;
  var sessionuserid=req.user.userid;
  var organization=new Organization();
  organization.removeAllListeners("failedGetMyGroupMembers");
  organization.on("failedGetMyGroupMembers",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    res.send(err);
  });
  organization.removeAllListeners("successfulGetMyGroupMembers");
  organization.on("successfulGetMyGroupMembers",function(result){
    logger.emit("info", result.success.message);
    res.send(result);
  });
  organization.removeAllListeners("getgroupmembers");
  organization.on("getgroupmembers",function(usergrp,usergrpmembers,count){
    if(count<usergrp.length){
      userModel.find({userid:{$in:usergrp[count].grpmembers}},{_id:0,userid:1,username:1,email:1,profile_pic:1},function(err,user){
        if(err){
          organization.emit("failedGetMyGroupMembers",{"error":{"code":"ED001","message":"Database Server Issue"}})
        }else if(!user){
          count+=1;
          organization.emit("getgroupmembers",usergrp,usergrpmembers,count);
        }else{
          usergrpmembers.push({grpid:usergrp[count]._id,grpname:usergrp[count].grpname,grpmembers:user});
          count+=1;
          organization.emit("getgroupmembers",usergrp,usergrpmembers,count);
        }
      })
    }else{
      organization.successfullGetGroupMembers(usergrpmembers);
    }
  });
  if(req.user.org.orgid!=orgid){
    logger.emit("log","Given orgid is not match with session userid");
    organization.emit("failedGetMyGroupMembers",{"error":{"code":"EA001","message":"You have not authorized to get Group Members"}});
  }else if(req.user.org.isAdmin==false){
    logger.emit("log","You are not an admin to see group member details");
    organization.emit("failedGetMyGroupMembers",{"error":{"code":"EA001","message":"You have not authorized to get Group Members"}}); 
  }else{
    /////////////////////////////////
    organization.getMyGroupMembers(orgid);
    //////////////////////////////// 
  }
};
exports.removeOrgGroupMembers=function(req,res){
  var orgid=req.params.orgid;
  var sessionuserid=req.user.userid;
  var grpid=req.params.grpid;
  var organization=new Organization();
  var usermemberid=req.params.userid;
  logger.emit("log","orgid:"+orgid+"grpid:"+grpid+"usermemberid:"+usermemberid);
  organization.removeAllListeners("failedRemoveOrgGroupMembers");
  organization.on("failedRemoveOrgGroupMembers",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    res.send(err);
  });
  organization.removeAllListeners("successfulRemoveOrgGroupMembers");
  organization.on("successfulRemoveOrgGroupMembers",function(result){
    logger.emit("info", result.success.message);
    res.send(result);
  });
  
  if(req.user.org.orgid!=orgid){
    logger.emit("log","Given orgid is not match with session userid");
    organization.emit("failedRemoveOrgGroupMembers",{"error":{"code":"EA001","message":"You have not authorized to remove group members"}});
  }else if(req.user.org.isAdmin==false){
    logger.emit("log","You are not an admin to see group member details");
    organization.emit("failedRemoveOrgGroupMembers",{"error":{"code":"EA001","message":"You have not authorized to remove group members"}}); 
  }else if(sessionuserid==usermemberid){
    organization.emit("failedRemoveOrgGroupMembers",{"error":{"code":"EA001","message":"You can not remove adming group members"}}); 
  }else{
    /////////////////////////////////
    organization.removeOrgGroupMember(req.user,orgid,grpid,usermemberid);
    //////////////////////////////// 
  }
}
exports.broadcastMessage=function(req,res){
  var orgid=req.params.orgid;
  var sessionuserid=req.user.userid;
  var broadcastmessagedata=req.body.broadcast;
  var organization=new Organization();
  
  // logger.emit("log","orgid:"+orgid+"grpid:"+grpid+"usermemberid:"+usermemberid);
  organization.removeAllListeners("failedBroadcastMessage");
  organization.on("failedBroadcastMessage",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    res.send(err);
  });
  organization.removeAllListeners("successfulBroadastMessage");
  organization.on("successfulBroadastMessage",function(result){
    logger.emit("info", result.success.message);
    res.send(result);
  });
  
  if(req.user.org.orgid!=orgid){
    logger.emit("log","Given orgid is not match with session userid");
    organization.emit("failedBroadcastMessage",{"error":{"code":"EA001","message":"You have not authorized to broadcast message"}});
  }else if(req.user.org.isAdmin==false){
    logger.emit("log","You are not an admin to see group member details");
    organization.emit("failedBroadcastMessage",{"error":{"code":"EA001","message":"You have not authorized to broadcast message"}}); 
  }else{
    /////////////////////////////////
    organization.broadCastMessage(req.user,orgid,broadcastmessagedata);
    //////////////////////////////// 
  }
}
exports.getBroadcastMessage=function(req,res){
  var orgid=req.params.orgid;
  var sessionuserid=req.user.userid;
  // var broadcastmessagedata=req.body.broadcast;
  var organization=new Organization();
  
  // logger.emit("log","orgid:"+orgid+"grpid:"+grpid+"usermemberid:"+usermemberid);
  organization.removeAllListeners("failedGetBroadcastMessage");
  organization.on("failedGetBroadcastMessage",function(err){
    logger.emit("error", err.error.message,req.user.userid);
    res.send(err);
  });
  organization.removeAllListeners("successfulGetBroadastMessage");
  organization.on("successfulGetBroadastMessage",function(result){
    logger.emit("info", result.success.message);
    res.send(result);
  });
  
    /////////////////////////////////
    organization.GetBroadCastMessage(orgid);
    //////////////////////////////// 
  
}