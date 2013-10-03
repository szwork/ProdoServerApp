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
var userModel = require('../../user/registration/js/user-model');
var mongodb = require("mongodb");

var BSON = mongodb.BSONPure;
var verificationTokenModel = require('../../common/js/verification-token-model');
var commonapi = require('../../common/js/common-api');
var userapi = require('../../user/registration/js/user-api');

exports.addOrganization = function(req,res){
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
    fullname: req.body.fullname;
    email: req.body.email;
    password: req.body.password;
  }

  var usergrp = {
    grpname:req.body.grpname,
    //curently invites manuallly set
    invites:[{email:"sunil@giantleapsystems.com"},{email:"neha@giantleapsystems.com"}]  
  };
    
  var organization = new orgModel({
     name: name,
     description: description,
     orgtype: orgtype,
     contact: contacts,
     location: [{ address:address }],
     usergrp: [ usergrp ]
   } 
  );
  
  //to save an organization
  organization.save(function(err,organization) {
    if(err){
      console.log(err+"error in saving new organization")
    }
    if(organization){
      console.log("organization data"+organization);
      var orgid = organization._id;
      var usergrp = organization.usergrp;
      console.log("usergroup data"+usergrp);
      console.log("orgid"+orgid);
      //call function send invite to grop members
       sendInviteMailToGroupMembers(usergrp,orgid,req.get('host') ,function(result) {
        if(result=="success") {
          console.log("successfully send emails");
          res.send("successfully added new organization");
        }
        else {
          res.send("problem in adding new organization");
        }
      });
    }
    //console.log("organization group data"+organization.usergrp)
    //res.send(organization);
  });
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
  if(usergrp != undefined) {
    //pass a list of email to send invitation
    sendInviteMailToGroupMembers(usergrp,orgid,req.get('host'), function(result) {
      if(result == "success"){
        console.log("successfully send emails");
        //we have to push into grpmembers
        res.send("organization data updated successfully");
      }
    });//end of sendInviteMail          
  }
};//end of invites method


//send an invite email to usergroup members
sendInviteMailToGroupMembers = function(usergrp,orgid,host,callback) {
  var k = 0;//to calculate how many emails in usergroup
  var emails = [];
  var lengthofdata = usergrp.length;
  console.log("length of user" + lengthofdata);
  
  //for loop start
  for(var i = 0; i < lengthofdata; i++) {
    var invities = usergrp[i].invites;
    console.log("grpmembersdata"+invities);
    if(invities != undefined)
    {
      var grpmemberslength = invities.length;
      for(var j = 0;j < grpmemberslength; j++) {  
        if(invities[j].email!=undefined) { 
          emails[k+1]=invities[j].email;
          console.log(invities[j].email);
          k++;
        }
      }//end of for loop for grpmemberslength
    }//end of if loop for invities
  }//for loop end for lengthdata
  console.log(emails);
  var emaildata = [];
  var j = 0;
  for(i = 0; i < emails.length; i++)
  {
    if(emails[i] != undefined) { 
      emaildata[j] = emails[i];
      j++;
      //console.log(ema)
    }
  }
  console.log("emaildata"+emaildata);
  for(var i=0;i<emaildata.length;i++) { 
    console.log("email"+emaildata[i]);
    if(emaildata[i]!=undefined)  {
      console.log("email["+i+"]"+emaildata[i]);
      User.find({email:emaildata[i]},function(err,userdata) {
        if(err) {
          console.log("error in check email aleready exists orn not")
        }
     //   console.log("userdata"+userdata);
        console.log("length of userdata"+userdata.length);
        if(userdata.length <=0 ) {
          console.log("userdata"+userdata);
        //  console.log("email "+invities[i].e);
          console.log("new emails data"+emaildata[i]);
          var user = new User({email:emaildata[i],orgid:new BSON.ObjectID(orgid+"")});
        //creating new user with invite emails
          userapi.adduser(user,host,function(result) {
            console.log("result"+result);
            if(result == "success") {
              console.log("successfully added new user and verfication mail sent to your email id");
              //res.send("successfully added new user and verfication mail sent to your email id");          
            }
            else {
            console.log("problem in adding new user and ");
            //res.send("problem in adding new user and ");               
            }
          });
        }//end of if(!userdata) 
      })//end of User.find function
    } //end of emails[i]!=undefined
  }//end of for loop emails.length
}//end of send invite method
    

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
