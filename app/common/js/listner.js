var events = require('events');
var eventEmitter = new events.EventEmitter();
var userapi=require("../../user/registration/js/user-api");
var userModel=require("../../user/registration/js/user-model");
var orgModel=require("../../org/registration/js/org-model");
var orgapi=require("../../org/registration/js/org-api");
eventEmitter.on('addgrpmember',function(currentdata){
    var grpmemberaddedlength=currentdata;
    var usergrplength=usergrplength;
    logger.emit("log","groupname:"+grpname[grpmemberaddedlength]+" emails"+emaildata[grpmemberaddedlength]);
    if(usergrplength>grpmemberaddedlength){ 
      
      userModel.find({ email:{ $in :emaildata[grpmemberaddedlength] }},{userid:1},function(err,user){
        if( err ){
          logger.emit("error","error in finding userid according invites",emaildata[grpmemberaddedlength]);
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
          logger.emit("log","usergrp.grpname"+grpname[grpmemberaddedlength]+" grpmembers"+newuser)
          orgModel.update({ orgid :orgid,"usergrp.grpname":grpname[grpmemberaddedlength]},{$pushAll:{"usergrp.$.grpmembers":newuser},$set:{"usergrp.$.invites":""}},function(err,status){
            if( err ){
              callback("failure");
              logger.emit("error","error in adding grpmembers in usergrp",req.user.userid);
            }
            if(status==1){
              // callback("success");
             
               logger.emit("log","successfully added grpmembers into usergrp");
               grpmemberaddedlength+=1;
               eventEmitter.emit("addgrpmember",grpmemberaddedlength);
            } else {
              logger.emit("log","error in adding group members");
               grpmemberaddedlength+=1;
               eventEmitter.emit("addgrpmember",grpmemberaddedlength);
            }
          });//end of orgmodel update
        }
      })
    } else {
      callback("success");
    }
  });
eventEmitter.on('addinviteuser',function(value){
    var addedinvitevalue=value;
    if(emaillength>addedinvitevalue){
      userModel.findOne({email:emails[i]},{userid:1},function(err,user){
        if(err){

        }else if(!user){
          user=new userModel({email:emails[i],orgid:orgid});
          userapi.addInviteUser(user,host,function(result){
           // logger.emit("result["+k+"]"+result);
            if(result=="failure"){
              logger.emit("log","error in invite user saving");
              callback(result);
            }
            if(result=="ignore"){
               logger.emit("log","invite user ignored");
                addedinvitevalue+=1;
                eventEmitter.emit("addinviteuser",addedinvitevalue);
            } else {
               logger.emit("log","invite user added");
               addedinvitevalue+=1;
               eventEmitter.emit("addinviteuser",addedinvitevalue);
            }
          });

      }else{
         addedinvitevalue+=1;
         eventEmitter.emit("addinviteuser",addedinvitevalue);
      }
    })
  } else {
       callback("success");
  }
});
exports.eventEmitter=eventEmitter;