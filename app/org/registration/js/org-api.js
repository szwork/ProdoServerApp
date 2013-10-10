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
var eventEmitter = new events.EventEmitter();


//adding new organization
exports.signupOrganization = function(req,res)
{
  /*var name = req.body.name;
  var description = req.body.description;
  var orgtype = req.body.orgtype;
  var contacts = req.body.contacts;
  var contractid = req.body.contractid;
  var region = req.body.region;
  var address = {
    add1: req.body.address1,
    add2: req.body.address2,
    add3: req.body.address3,
    country: req.body.country,
    state: req.body.state,
    city: req.body.city
  };

  var user = {
    fullname: req.body.fullname,
    email: req.body.email,
    password: req.body.password
  }

  var usergrp = /*[
  {
    grpname:req.body.grpname,
    //curently invites manuallly set
    invites:"sunil@giantleapsystems.com,sunilmore690@facebook.com"  
  },
  {
    grpname:"Marketing",
    //curently invites manuallly set
    invites:"sunilmore6490@gmail.com"  
  }];
  req.body.usergrp;*/

  var organizationdata=req.body.organization;
  console.log("organization data"+organizationdata);
  var userdata=req.body.user;
  console.log("userdata"+userdata);
  var usergrp=req.body.organization.usergrp;
  console.log("user group data"+usergrp);   
  var organization = new orgModel(organizationdata);
  
  //to save an organization
  //1.to save an new organization
  //2.to add amdin user
  //3 .to add new group admin in organization
  //to add invite user
  //4/to send email to invites user
  //5 
  //add an organiazation
  userModel.find({email:userdata.email},function(err,users)
  {
      if(err)
      {
        console.log("error in database checking email id already exists or not");
        res.send({"error":"error in database checking email id already exists or not"});
      }
      if(users.length!=0)
      {
        console.log("email id already exists for organization save");
        res.send({"exception":"email aleready exists for organization"});
      }
      else
      {
        addOrganization(organization,function(err,orgid)
        {
          //add an admin user of organization
          if(err)
          {
            console.log("error in adding organization");
          }
          console.log("organization successfully saved");
          var user=new userModel(userdata);
          //to add an admin user
          userapi.addUser(user,req.get('host'),function(result)
          {
            if(result=="failure")
            {
              console.log("add an admin user unsuccessfull");
              res.send("errror in saving organization user");
            }
            else
            {
                //to add an invites user
                console.log("admin user successfully saved for organization");
                console.log("---------------------------");
                console.log("calling to  add admin group method");
                    
                console.log("---------------------------");
                addAdminGroup( req.body.user.email,orgid,function(result)
                {
                  if( result=="failure" )
                  {
                    console.log("error in adding admin group in database");
                    res.send({"error":"adding adming group into usergroup"})
                  }
                  else
                  {
                    console.log("added admin group in usergroup")
                    //send verification mail to invites user
                    //console.log("adding invites user into database");
                    //add user id into grpmembers
                    /*
                      If no group added or no invities added 

                    */
                    console.log("req.body.usergrp"+req.body.usergrp);
                    if( usergrp!=undefined )
                    {
                      console.log("---------------------------");
                      console.log("calling to add invite user and sendmail ");
                      
                      console.log("---------------------------");
                      addInvitesUserAndSendMail( usergrp ,orgid,req.get('host'),function(result)
                      {
                        if( result == "failure")
                        {
                          console.log("error in inviting user ");
                          res.send({"error":"error in inviting user and sending verification mail"});
                        }
                        else
                        {
                          console.log("inviteing group invites successfully");
                          console.log("---------------------------");
                          console.log("calling to addgroup members");
                          console.log("---------------------------");
                          addGroupMembers( usergrp ,orgid ,function( result )
                          {
                              if(result=="failure")
                              {
                                console.log("error in addding groupmembers into usergroup");
                              }
                              else
                              {
                                console.log("add group memberes added successfully");
                                res.send({"message":"organization saved","info":"organizatiobn saved ,user admin saved,send invite to usergroup"});
                              }

                           });
                          //res.send("organization successfully saved");
                        }
                      });
                    }
                    else
                    {
                       console.log("add group memberes added successfully");
                       res.send({"message":"organization saved","info":"organizatiobn saved ,user admin saved,send invite to usergroup"});
                    }
                  }
                });
              }

           })
    })
  }
  })
}

//addorganization method declaration
/*
It save organization and 
callback orgid
*/
addOrganization=function(organization,done)
{ 
    organization.save(function(err,organization)
    {
      if(err){
      console.log(err+"error in saving new organization");
      done(err);
    }
    if(organization)
    {
      console.log("organization data"+organization);
      var orgid = organization._id;
      done(null,orgid);

    }
    else
    {
      console.log("organization saved blank");
      done(err);
    }
  })
};
/*
save all user according invite email and send verification email

*/
addInvitesUserAndSendMail=function(usergrp,orgid,host,callback)
{
  console.log("usergroup data"+usergrp);
  console.log("orgid"+orgid);
  var usergrplength=usergrp.length;
  var invites;
  var emails=[];
  var j=0;
  console.log("usergroup data"+usergrp.invites);
  console.log("usergrp length"+usergrp.length);
  for(var i=0;i<usergrplength;i++)
  {
    invites=usergrp[i].invites;
    invites=S(invites);
    console.log("while loop");
    while(invites.length>0)
    {   
      if(invites.contains(','))
      {
        var pos=invites.indexOf(',');
        emails[j]=invites.substring(0,pos);
        invites=invites.substring(pos+1);

        console.log("remaining invites"+invites);
        j++;
      }
      else
      {
          emails[j]=invites;
          invites=[];
          j++;
      }
    };
    console.log("email[ "+i+" ]"+emails);
  };
      console.log("email[]"+emails); 
      //to add an invite user
      var user;
     
      var i=0;
      var emaillength=emails.length;
      eventEmitter.on('addinviteuser',function(i)
      {
        if(emaillength!=i)
        {
          user=new userModel({email:emails[i],orgid:new BSON.ObjectID(orgid+"")});
          userapi.addInviteUser(user,host,function(result)
          {
           // console.log("result["+k+"]"+result);
            if(result=="failure")
            {
              console.log("error in invite user saving");
              callback(result);
            }
            if(result=="ignore")
            {
                console.log("invite user ignored");
               i+=1;
              eventEmitter.emit("addinviteuser",i);
            }
            else
            {
               console.log("invite user ignored");
               i+=1;
              eventEmitter.emit("addinviteuser",i);
              
              //callback(result);
            }
          });

        }
        else
        {
          callback("success");
        }
      });
      eventEmitter.emit("addinviteuser",i);
      
           
};
/*
it adds userid according to group into groupmembers
so we can identify what is the role to user
*/
addGroupMembers=function(usergrp,orgid,callback)
{
  console.log("usergroup data"+usergrp);
  console.log("orgid"+orgid);
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
      if(invites.contains(','))
      {
        var pos=invites.indexOf(',');
        emails[j]=invites.substring(0,pos);
        invites=invites.substring(pos+1);

        console.log("remaining invites"+invites);
        j++;
      }
      else
      {
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
    console.log("usergrpdata"+grpname+emaildata);
    var i=0;
  //var usergrpdatalength=usergrp.length;
  //addgrpmember defination
  //here we open an event
  eventEmitter.on('addgrpmember',function(i)
  {
    console.log("groupname:"+grpname[i]+" emails"+emaildata[i]);
    if(usergrplength!=i)
    { 
      userModel.find({ email:{ $in :emaildata[i] }},{_id:1},function(err,user)
      {
        if( err )
        {
          console.log("error in finding userid according invites");
        }
        if( user )
        { //add the userid into respective group
          console.log("userid by email"+user);
          var newuser=[];
          for(var p=0;p<user.length;p++)
          {
            newuser[p]=user[p]._id;
            console.log("newuser["+p+"]"+newuser[p]._id);
          }
          console.log("usergrp.grpname"+grpname[i]+" grpmembers"+newuser)
          orgModel.update({ _id : new BSON.ObjectID(orgid+""),"usergrp.grpname":grpname[i]},{$pushAll:{"usergrp.$.grpmembers":newuser},$set:{"usergrp.$.invites":""}},function(err,status)
          {
            if( err )
            {
              callback("failure");
              console.log("error in adding grpmembers in usergrp");
            }
            if(status==1)
            {
              // callback("success");
                console.log("successfully added grpmembers into usergrp");
           
              i+=1;
              eventEmitter.emit("addgrpmember",i);
             }
             else
             {
              console.log("error in adding group members")
             }
          });//end of orgmodel update
        }
      })
    }
    else
    {
      callback("success");
    }
  });
  eventEmitter.emit("addgrpmember",i);
}
/*
crate an new group adming into usergroup
and only add one userid which is admin of the organization
*/
addAdminGroup=function(email,orgid,callback)
{
  console.log("admin email"+email);
  userModel.find({email:email},{_id:1},function(err,user)
  {
    if(err)
    {
      console.log("error in finding admin email for organization");
    }
    else
    {
      console.log()
      orgModel.update({ _id:new BSON.ObjectID(orgid+"")},{$push:{usergrp:{grpname:"admin",grpmembers:user[0]._id}}},function(err,status)
      {
        if(err)
        {
          console.log("error in adding admin group into existing organization");
        }
        else
        {
          console.log("successfully added admin group into existing organization");
          callback("success");
        }
      })
    }
  })
}
 //to update an existing organization
 exports.updateOrganization = function(req,res) {
  //value taking from body
  var name = req.body.name;
  var description = req.body.description;
  var orgtype = req.body.orgtype;
  var contacts = req.body.contacts;
  var contractid = req.body.contractid;
  var region = req.body.region;
  //value taking from parameter
  var orgid = req.params.orgid;

  var address = {
    add1: req.body.address1,
    add2: req.body.address2,
    add3: req.body.address3,
    country: req.body.country,
    state: req.body.state,
    city: req.body.city
  };
  
  //to track updated history of organization
    var organizationHistory = new orgHistoryModel({orgid:new BSON.ObjectID(orgid),updatedby:"sunil current session user"});
  /*----currently manulay updated by-------*/
  //to save data into organization history
    organizationHistory.save(function(err, orgHistory) 
    {
      if(err)
       {
         console.log(err+"error in saving orghistory");
         res.send({"error":"error in saving orgHistory"});
       }
      if(orgHistory)
       {
        console.log("organization history updated for organization id"+orgid+" by");
     //   res.send({"success":"organization history updated");
       }
    });//end of organization save
           //to update an organization
    orgModel.update(
      {_id:new BSON.ObjectID(orgid)},
      {$set:
          {
            name:name,
            description:description,
            orgtype:orgtype,
            contact:contacts,
            location:[{address:address}]
          }
      },
      function(err, updatestaus) 
      {
        if(err)
        {
          console.log(err + "error in saving new organization")
          res.send({"error":"error in updating neow organization"})
        }
        if(updatestaus == 1)
        { //send invite mean create  user,create token and send mail
          res.send({"success":"organization data updated successfully"});
        }
      }
    )//end of organization update
};

//invites to group members
exports.invites = function(req,res) { 
  //value taking from parameters
  var orgid = req.params.orgid;
  //currently manually set usergrp data
  var usergrp = [
                 {
                  grpname:"Service Engineers",
                  invites:"neha@giantleapsystems.com"
                 },
                {
                  grpname:"Production Engineers",
                  invites:"sunil@giantleapsystems.com,sunilmore6490@gmail.com"
                }
              ];

};//end of invites method


//send an invite email to usergroup members

exports.getAllOrganization = function(req,res) {
  orgModel.find(function(err, organization)
  {
    if(err) {
      console.log(err+"errrro in retriving all organiztion details");
    }
    if(organization.length>0) {
      res.send(organization);
    }
    else {
      res.send("doesn't have any organization");
    }
  })
};
//delete a particular organization
exports.deleteOrganization = function(req,res)
{
   var orgid = req.params.orgid;
   orgModel.update(
    {_id:new BSON.ObjectID(orgid) }, {$set:{status:"closed"}},
    function(err,updatestaus) {
      if(err) {
        console.log(err+"error in deleting organization");
      }
      if(updatestaus==1) {
        console.log("organization deleted");
        res.send("organization deleted");
      }
    })//end of Organization update method
};//end of deleteorganizations


//get organization by id
exports.getOrganizationById = function(req,res) {
  var orgid = req.params.orgid;
  orgModel.find({_id:new BSON.ObjectID(orgid)},function(err,organization) {
    if(err){
      console.log(err+"error in retriving organization by id")
    }
    else if (organization) {
      res.send(organization);
    }
  })
};
