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
  logger.emit("organization data"+organizationdata);
  //var userdata=req.body.user;
  //logger.emit("userdata"+userdata);
  
  organization.on("successfulOrgAdd",function(result){
    logger.emit("info",result.success.message);
    organization.removeAllListeners();
    res.send(result);
  });
  organization.on("failedOrgAdd",function(err){
    logger.emit("error",err.error.message,req.user.userid);
    organization.removeAllListeners();
    res.send(err);
  })
  organization.on('sendinvitemail',function(userdata,emailtemplatedata,orgname,i){
    var emailtemplate=S(emailtemplatedata.description);
    logger.emit("log",userdata);
    if(userdata.length>i){
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
                var url = "http://"+req.get("host")+"/api/verify/"+token;
                html=emailtemplate.replaceAll("<email>",user.email);
                html=emailtemplate.replaceAll("<url>",url);
                
               var message = {
                  from: "Prodonus  <noreply@prodonus.com>", // sender address
                  to: userdata[i].email, // list of receivers
                  subject:emailtemplatedata.subject, // Subject line
                  html: html.s // html body
              };
              commonapi.sendMail(message,function(result){
                if (result == "failure") {
                   logger.emit("error","Error in sending invite mail to "+userdata[i].email,req.user.userid);
                  
                   organization.emit("sendinvitemail",userdata,emailtemplatedata,orgname,i);
                   //i+=1;
                   //organization.emit("sendinvitemail",userdata,emailtemplatedata,orgname,i);
                } else {
                   i+=1;
                   organization.emit("sendinvitemail",userdata,emailtemplatedata,orgname,i);
                  }
              })
            }
          })
        }
      })
    } else {
      logger.emit("log","successfully sent invite email");
    }
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
    organization.on("failedOrgUpdation",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      organization.removeAllListeners();
      res.send(err);
    });

    organization.on("successfulOrgUpdation",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      organization.removeAllListeners();
      res.send(result);
    });
    
    var isAdmin=false;
    if(req.user.orgid==orgid || isAdmin)
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
      organization.on("failedOrgDeletion",function(err){
        logger.emit("error", err.error.message,req.user.userid);
        organization.removeAllListeners();
        res.send(err);
      });

      organization.on("successfulOrgDeletion",function(result){
        logger.emit("info", result.success.message);
        organization.removeAllListeners();
        res.send(result);
      });
     var isAdmin=false;
     if(req.user.orgid==orgid || isAdmin) {
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
  organization.on("failedOrganizationGet",function(err){
      logger.emit("error", err.error.message,req.user.userid);
      organization.removeAllListeners();
      res.send(err);
    });

    organization.on("successfulOrganizationGet",function(result){
      logger.emit("info", result.success.message);
      organization.removeAllListeners();
      res.send(result);
    });
    organization.getOrganization(orgid);

};
exports.getAllOrganization = function(req, res) {
  
  var sessionuserid=req.user.userid;
  var organization=new Organization();
  organization.on("failedOrganizationGetAll",function(err){
      logger.emit("error", err.error.message,req.user.userid);
      organization.removeAllListeners();
      res.send(err);
    });

    organization.on("successfulOrganizationGetAll",function(result){
      logger.emit("info", result.success.message);
      organization.removeAllListeners();
      res.send(result);
    });
    organization.getAllOrganization();
}





//////////////////
//old code
///////////////
//invites to group members
exports.invites = function(req,res) { 
  //value taking from parameters
  var orgid = req.params.orgid;
  var usergrp=req.body.usergrp;
  res.send(usergrp);
};//end of invites method


//send an invite email to usergroup members


//delete a particular organization

