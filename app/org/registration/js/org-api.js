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
var userModel = require('../../../user/registration/js/user-model');
var verificationTokenModel = require('../../../common/js/verification-token-model');
var EmailTemplateModel=require('../../../common/js/email-template-model');

//importing require userdefined api
var commonapi = require('../../../common/js/common-api');
var userapi = require('../../../user/registration/js/user-api');

//importing system
var mongodb = require("mongodb");
var S=require('string');
var BSON = mongodb.BSONPure;
var events = require('events');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var logger=require("../../../common/js/logger");

//adding new organization
exports.addOrganization = function(req,res){
 
 
  var organizationdata=req.body;
  logger.emit("organization data"+organizationdata);
  //var userdata=req.body.user;
  //logger.emit("userdata"+userdata);
  var usergrp=organizationdata.usergrp;
  logger.emit("user group data"+usergrp);   
  checkOrganizationValidation(organizationdata,req.user,function(error,success){
    if(error){
      res.send({"error":{"message":error}})
    }else{
      var organization = new orgModel(organizationdata);
        //calling to addorganization method
      logger.emit("log","calling to addOrganization method");
      addOrganization(organization,function(err,orgid){
          //add an admin user of organization
        if(err){
          logger.emit("error",err,req.user.userid);
        }else{
          
          addAdminGroup(req.user.userid,orgid,function(result) {
              if( result.error){
                  res.send(result);
              } else {
                logger.emit("log","added admin group in usergroup")
                logger.emit("log","req.body.usergrp"+req.body.usergrp);
                if( usergrp.length!=0){
                  logger.emit("log","---------------------------");
                  logger.emit("log","calling to add invite user and sendmail");
                  
                  logger.emit("log","---------------------------");
                  addInvitesUserAndSendMail( usergrp ,orgid,req.get('host'),function(result){
                    if( result == "failure") {
                      logger.emit("error","error in inviting user ",req.user.userid);
                      res.send({"error":"error in inviting user and sending verification mail"});
                    } else {

                      logger.emit("log","inviting group invites successfully");
                      logger.emit("log","---------------------------");
                      logger.emit("log","calling to addgroup members");
                      logger.emit("log","---------------------------");
                      //calling to addgroup members method
                      addGroupMembers( usergrp ,orgid ,function( result ){
                          if(result=="failure"){
                            logger.emit("error","error in addding groupmembers into usergroup",req.user.userid);
                          } else{
                            logger.emit("info","add group memberes added successfully",req.user.userid);
                            res.send({"message":"organization saved","info":"organizatiobn saved ,user admin saved,send invite to usergroup"});
                          }
                      });
                      //res.send("organization successfully saved");
                    }
                  });
                } else{
                   logger.emit("log","add group memberes added successfully");
                   res.send({"message":"organization saved","info":"organizatiobn saved ,user admin saved,send invite to usergroup"});
                }
                  }
                });
              }
          })
         }  

  })
 
    }
   
checkOrganizationValidation=function(organization,user,callback){
  if(organization.name==undefined){
    logger.emit("error","please type comapny name",user.userid);
    callback("please type comapny name");
  } else if(organization.orgtype==undefined){
    logger.emit("error","please type comapny name",user.userid);
    callback("please type company name");
  }else if(organization.contact_numbers.length<1){
    logger.emit("error","please give atleast one contact numbers",user.userid);
    callback("please give atleast one contact numbers");
  }else if(organization.location==undefined){
    logger.emit("error","please give a location details",user.userid);    
    callback("please give a location details");
  }else if(organization.terms==false){
    logger.emit("error","please agree the terms and condition",user.userid);        
    callback("please aggree  terms and conditions");
  }else{
    callback(null,"success");
  }
   
  
  
  

  

}
//addorganization method declaration
/*
It save organization and 
callback orgid
*/
addOrganization=function(organization,done){ 
    organization.save(function(err,organization){
      if(err){
        
        logger.emit("error","Error in db to add organization",req.user.userid);
        done(err);
      }else{  
        logger.emit("log","organization data"+organization);
        var orgid = organization.orgid;
        done(null,orgid);
      }
  })
};
/*
crate an new group adming into usergroup
and only add one userid which is admin of the organization
*/
addAdminGroup=function(userid,orgid,callback){
 // logger.emit("admin email"+email);
  userModel.findOne({userid:userid},{userid:1},function(err,user){
    if(err){
      logger.emit("error","User not found according",req.user.userid);
      callback({"error":{"message":"Err in db to find user"}})
    } else if(user){
      orgModel.update({ orgid:orgid},{$push:{usergrp:{grpname:"admin",grpmembers:user.userid}}},function(err,status){
        if(err){
         logger.emit("error","error in adding admin group into existing organization",req.user.userid);
        } else if(status==1){
          logger.emit("log","successfully added admin group into existing organization");
          callback({"success":{"message":"User added into admin group"}});
        }else{
          logger.emit("error","Orgid of"+orgid+" doesn't exist to add admin group",userid);
          callback({"error":{"message":"Orgid of"+orgid+" doesn't exist to add admin group"}});
        }
      })
    }else{
      logger.emit("error","User of userid:"+userid+" doesn't exist",userid)
      //res.send({"error":{"message":"User of userid:"+userid+" doesn't exist"}})
      callback({"error":{"message":"User of userid:"+userid+" doesn't exist"}})
    }
  })
}
/*
save all user according invite email and send verification email

*/
addInvitesUserAndSendMail=function(usergrp,orgid,host,callback){

 
  logger.emit("usergroup data"+usergrp);
  logger.emit("orgid"+orgid);
  var usergrplength=usergrp.length;
  var invites;
  var emails=[];
  var j=0;
  logger.emit("log","usergroup data"+usergrp.invites);
  logger.emit("log","usergrp length"+usergrp.length);
  for(var i=0;i<usergrplength;i++)
  {
    invites=usergrp[i].invites;
    invites=S(invites);
    logger.emit("log","while loop");
    while(invites.length>0)
    {   
      if(invites.contains(',')){
        var pos=invites.indexOf(',');
        emails[j]=invites.substring(0,pos).trim();
        invites=invites.substring(pos+1);

        logger.emit("log","remaining invites"+invites);
        j++;
      } else {
          emails[j]=invites.trim();
          invites=[];
          j++;
      }
    };
    logger.emit("log","email[ "+i+" ]"+emails);
  };
  logger.emit("emails"+emails); 
      //to add an invite user
  var user;
     
  //var i=0;
  var emaillength=emails.length;

  logger.emit("info","inite user length:"+emaillength);
  eventEmitter.on('addinviteuser',function(i){

    if(emaillength>i){
      userModel.findOne({email:emails[i]},{userid:1},function(err,user){
        if(err){

        }else if(user){
          i+=1;
          eventEmitter.emit("addinviteuser",i);
          
      }else{
        user=new userModel({email:emails[i],orgid:orgid});
          userapi.addInviteUser(user,host,function(result){
           // logger.emit("result["+k+"]"+result);
            if(result=="failure"){
              logger.emit("log","error in invite user saving");
              callback(result);
            }
            if(result=="ignore"){
               logger.emit("log","invite user ignored");
                i+=1;
                eventEmitter.emit("addinviteuser",i);
            } else {
               logger.emit("log","invite user added");
               i+=1;
               eventEmitter.emit("addinviteuser",i);
            }
          });

         
      }
    })
  } else {
       callback("success");
  }
});
  var initialvalue=0;
  eventEmitter.emit("addinviteuser",initialvalue);
 
};
/*
it adds userid according to group into groupmembers
so we can identify what is the role to user
*/
addGroupMembers=function(usergrp,orgid,callback){
  
 
  logger.emit("log","usergroup data"+usergrp);
  logger.emit("log","orgid"+orgid);
  var usergrplength=usergrp.length;
  var invites;
  var grpname=[];
  var emaildata=[];
//  var usergrpdata=[];
  var j=0;//number of emails in respective group
  //var k=0;//for usergrpdata
  for(var i=0;i<usergrplength;i++)
  {
    //var grpname;
    var emails=[];
    invites=usergrp[i].invites;
    invites=S(invites);
    grpname[i]=usergrp[i].grpname;
   // var emaildata="[";
    while(invites.length>0)
    {   
      if(invites.contains(',')){
        var pos=invites.indexOf(',');
        emails[j]=invites.substring(0,pos);
        invites=invites.substring(pos+1);

        logger.emit("log","remaining invites"+invites);
        j++;
      } else  {
          emails[j]=invites;
          invites=[];
          j++;
      }
    }
    emaildata[i]=emails;
   // usergrpdata[i]={"grpname":usergrp[i].grpname,"emails":emaildata[i]}
   }; //end of for loop
  //  emaildata+="]";
    /*to get all userid according to groupname */
  logger.emit("log","usergrpdata"+grpname+emaildata);
  //var i=0;
  //var usergrpdatalength=usergrp.length;
  //addgrpmember defination
  //here we open an event
  eventEmitter.on('addgrpmember',function(i){
  

    logger.emit("log","groupname:"+grpname[i]+" emails"+emaildata[i]);
    if(usergrplength>i){ 
      
      userModel.find({ email:{ $in :emaildata[i] }},{userid:1},function(err,user){
        if( err ){
          logger.emit("error","error in finding userid according invites",emaildata[i]);
        }
        if( user.length!=0 )
        { //add the userid into respective group
          logger.emit("log","userid by email");
          var newuser=[];
          for(var p=0;p<user.length;p++)
          {
            newuser[p]=user[p].userid;
            logger.emit("log","newuser["+p+"]"+user[p].userid);
          }
          logger.emit("log","usergrp.grpname"+grpname[i]+" grpmembers"+newuser)
          orgModel.update({ orgid :orgid,"usergrp.grpname":grpname[i]},{$pushAll:{"usergrp.$.grpmembers":newuser},$set:{"usergrp.$.invites":""}},function(err,status){
            if( err ){
              callback("failure");
              logger.emit("error","error in adding grpmembers in usergrp",req.user.userid);
            }
            if(status==1){
              // callback("success");
             
               logger.emit("log","successfully added grpmembers into usergrp");
               i+=1;
               eventEmitter.emit("addgrpmember",i);
            } else {
              logger.emit("log","error in adding group members");
               i+=1;
               eventEmitter.emit("addgrpmember",i);
            }
          });//end of orgmodel update
        }
      })
    } else {
      callback("success");
    }
  });
  eventEmitter.emit("addgrpmember",0);
  
}

 //to update an existing organization
exports.updateOrganization = function(req,res) {
  //value taking from body
  var orgid=req.params.orgid;
  var organizationdata=req.body.organization;
  //to track updated history of organization
    
  /*----currently manulay updated by-------*/
  //to save data into organization history
   orgModel.update({orgid:orgid},{$set:organizationdata},function(err, updatestaus) {
    if(err){
      logger.emit("error",err + "error in saving new organization",req.user.userid)
      res.send({"error":{"message":"error in updating neow organization"}})
    }else if(updatestaus==1){
      organizationHistory.save(function(err, orgHistory) {
        if(err){
           logger.emit("error",err+"error in saving orghistory",req.user.userid);
           res.send({"error":{"message":"error in saving orgHistory"}});
        }
        if(orgHistory){
          logger.emit("log","organization updated for organization id"+orgid+" by");
          res.send({"success":{"message":"organization  updated successfully"}});//end of organization save
        }
      }) 
    }else{
      logger.emit("error","No organization to update",req.user.userid);
      res.send({"error":{"message":"No organization to update"}});
    }
  })
}
 
//invites to group members
exports.invites = function(req,res) { 
  //value taking from parameters
  var orgid = req.params.orgid;
  var usergrp=req.body.usergrp;
  res.send(usergrp);
};//end of invites method


//send an invite email to usergroup members

exports.getAllOrganization = function(req,res) {
  orgModel.find(function(err, organization){
    if(err) {
      logger.emit("error",err+"error in retriving all organiztion details",req.user.userid);
      res.send({"error":{"message":"error in retriving all organiztion details"}})
    }
    if(organization.length!=0) {
      logger.emit("success","get all organization details",req.user.userid);
      res.send(organization);
    } else {
      logger.error("error","doesn't have any organization",req.user.userid);
      res.send({"error":{"message":"doesn't have any organization"}});
    }
  })
};
//delete a particular organization
exports.deleteOrganization = function(req,res){
   var orgid = req.params.orgid;
   orgModel.update(
    {orgid:orgid }, {$set:{status:"deactive"}},
    function(err,updatestaus) {
      if(err) {
        logger.emit("error",err+"error in deleting organization",req.user.userid);
      }
      if(updatestaus==1) {
        logger.emit("log","organization deleted");
        res.send({"success":{"message":"organization deleted"}});
      }
    })//end of Organization update method
};//end of deleteorganizations


//get organization by id
exports.getOrganization = function(req,res) {
  var orgid = req.params.orgid;
  orgModel.findOne({orgid:orgid},function(err,organization) {
    if(err){
      logger.emit("error",err+"error in retriving organization by id",req.user.userid);
      res.send({"error":{"message":"Error in db to get organization"}});
    }else if (organization) {
      logger.emit("log","get organization details");
      res.send({"success":{"message":"","organization":organization}});
    }else{
      logger.emit("error","Organization not found",req.user.userid);
      res.send({"error":{"message":"Organization not found"}});
    }
  })
};
