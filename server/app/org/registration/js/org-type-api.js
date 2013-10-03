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

var orgType = require('../models/org-type-model');

exports.addOrgType = function(req,res){
  var orgtypename = req.body.orgtypename;
  var orgtype = new OrgType( {orgtypename: orgtypename} );
  orgtype.save(function(err,orgtype){
    if(err){
      console.log(err+"error in saving new orgtype ");
    }
    res.send(orgtype);
   });
});

}
//get all organization type
exports.getOrgType = function(req,res){
  orgType.find({},{_id:0},function(err,orgtype){
    if(err){
      console.log(err+"error in geting all orgtype");
    }
    if(orgtype){
      res.send(orgtype);
    }
  })
};
