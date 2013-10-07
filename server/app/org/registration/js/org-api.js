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
* 
*/

var orgModel = require('./org-model');
var orgHistoryModel = require('./org-history-model'); 
var userModel = require('../../../user/registration/js/user-model');
var mongodb = require("mongodb");
var S=require('string');
var BSON = mongodb.BSONPure;
var verificationTokenModel = require('../../../common/js/verification-token-model');
var commonapi = require('../../../common/js/common-api');
var userapi = require('../../../user/registration/js/user-api');

exports.signupOrganization = function(req,res){
  var name = req.body.name;
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

  var usergrp = [{
    grpname:req.body.grpname,
    //curently invites manuallly set
    invites:"sunil@giantleapsystems.com,neha@giantleapsystems.com"  
  }];
    
  var organization = new orgModel({
     name: name,
     description: description,
     orgtype: orgtype,
     contact: contacts,
     location: [{ address:address }],
     usergrp: usergrp
   } 
  );
  
  //to save an organization
  //1.to save an new organization
  //2.to add amdin user
  //3 to add invite user
  //4/to send email to invites user
  //5 to add new group admin in organization
  //add an organiazation
  addOrganization(organization,function(err,orgid)
  {
    //add an admin user of organization
    if(err)
    {
      console.log("error in adding organization");
    };
    console.log("organization successfully saved");
    var userdata=new userModel({fullname:req.body.fullname,email:req.body.email,password:req.body.password,orgid:orgid});
    //to add an admin user
    userapi.addUser(userdata,req.get('host'),function(result)
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
          addInvitesUserAndSendMail(usergrp,orgid,req.get('host'),function(result)
          {
            if(result=="failure")
            {
              console.log("error in adding invites user in database");
            }
            else
            {
              console.log("invites user and send verification email")
              //send verification mail to invites user
              console.log("adding invites user into database");
              //add user id into grpmembers
              addGroupMembers( usergrp ,orgid ,function( result )
              {
                if( result == "failure")
                {
                  console.log("error in adding grpmembers");
                }
                else
                {
                  console.log("group members added successfully");
                  res.send("organization successfully saved");
                }
              });
              addAdminGroup( req.body.email,orgid,function(result)
                   {
                      if(result=="failure")
                      {
                        console.log("error in adding admingroup in organization");
                      }
                      else
                      {
                        console.log("adming group added in organization");
                      }

                   });
              //add an admingroup
            //  console.log("calling to addadmin group"+req.body.email);
              
              
            }
          });
      }

    })

  });
}
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
      for(var i=0;i<emails.length;i++)
      {
          user=new userModel({email:emails[i],orgid:new BSON.ObjectID(orgid+"")});
          console.log("user["+i+"]"+user);
          userapi.addUser(user,host,function(result)
          {
            if(result=="failure")
            {
              console.log("error in invite user saving");
            }
            else
            {
              console.log("invtes user saved")
              
                callback(result);
              
              //callback(result);
            }
          })
      };
           
    
    //console.log("organization group data"+organization.usergrp)
    //res.send(organization);
};
addGroupMembers=function(usergrp,orgid,callback)
{
  console.log("usergroup data"+usergrp);
  console.log("orgid"+orgid);
  var usergrplength=usergrp.length;
  var invites;
  var grpname;
  var emails=[];
  var j=0;
  for(var i=0;i<usergrplength;i++)
  {
    invites=usergrp[i].invites;
    invites=S(invites);
    grpname=usergrp[i].grpname;
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
    };
  //  emaildata+="]";
    /*to get all userid according to groupname */
    userModel.find({ email:{ $in :emails }},{_id:1},function(err,user)
    {
      if( err )
      {
        console.log("error in finding userid according invites");
      }
      if( user )
      { //add the userid into respective group
        console.log("userid by email"+user);
        var newuser=[];
        for(var i=0;i<user.length;i++)
        {
          newuser[i]=user[i]._id;

        }
        orgModel.update({ _id : new BSON.ObjectID(orgid+""),"usergrp.grpname":grpname},{$push:{"usergrp.$.grpmembers":newuser},$set:{"usergrp.$.invites":""}},function(err,status)
        {
          if( err )
          {
            callback("failure");
            console.log("error in adding grpmembers in usergrp");
          }
          if( status==1 )
          {
            callback("success");
            console.log("successfully added grpmembers into usergrp");
          }
        })
      }

    })
    console.log("email[ "+i+" ]"+emails);
  };
      

}
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
      orgModel.update({ _id:new BSON.ObjectID(orgid+"")},{$push:{usergrp:{grpname:"amdin",grpmembers:user._id}}},function(err,status)
      {
        if(err)
        {
          console.log("error in adding admin group into existing organization");
        }
        else
        {
          console.log("successfully added admin group into existing organization");
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
    organizationHistory.save(function(err, orgHistory) {
      if(err) {
        console.log(err+"error in saving orghistory");
      }
      if(orgHistory) {
        console.log("organization history updated for organization id"+orgid+" by");
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
      function(err, updatestaus) {
        if(err) {
          console.log(err + "error in saving new organization")
        }
        if(updatestaus == 1) { //send invite mean create  user,create token and send mail
          res.send("organization data updated successfully");
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
