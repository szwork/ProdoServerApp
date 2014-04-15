//importing system
var mongodb = require("mongodb");
var events = require('events');
var eventEmitter = new events.EventEmitter();
var logger=require("../../common/js/logger");
var Warranty=require("./warranty");

exports.addUserWarranty=function(req,res){
  var userid = req.params.userid;
  var sessionuserid = req.user.userid;
	console.log("Call addUserWarranty");
    var sessionuserid=req.user.userid;
  	var warrantydata=req.body;
    console.log("req form"+JSON.stringify(req.form));
    var warrantyinvoice=req.files.warrantyinvoice;
    console.log("warrantyinvoice"+JSON.stringify(req.files))
    // logger.emit("log","req warranty body "+JSON.stringify(req.body));
  	var warranty = new Warranty(warrantydata);
  	
    // logger.emit("log","sessionid : "+sessionuserid);
    warranty.removeAllListeners("failedAddUserWarranty");
    warranty.on("failedAddUserWarranty",function(err){
    	logger.emit("error", err.error.message,sessionuserid);
      	// warranty.removeAllListeners();
      	res.send(err);
    });
    warranty.removeAllListeners("successfulAddUserWarranty");
    warranty.on("successfulAddUserWarranty",function(result){
      	logger.emit("info", result.success.message,sessionuserid);
      	// warranty.removeAllListeners();
      	res.send(result);
    });
    if(sessionuserid==userid){
      warranty.addUserWarranty(sessionuserid,warrantyinvoice);
    }else{   
      warranty.emit("failedAddUserWarranty",{"error":{"code":"EA001","message":"Provided userid is not match with session userid"}})
    }
}

exports.updateUserWarranty = function(req, res) {
  var userid = req.params.userid;
  var warrantydata = req.body.warrantydata;
  var warranty_id = req.params.warranty_id;
  var warranty = new Warranty(warrantydata);
  var sessionuserid = req.user.userid;

  warranty.removeAllListeners("failedUpdateWarranty");
    warranty.on("failedUpdateWarranty",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // warranty.removeAllListeners();
      res.send(err);
    });
  warranty.removeAllListeners("successfulWarrantyUpdation");
  warranty.on("successfulWarrantyUpdation",function(result){
    logger.emit("info", result.success.message,sessionuserid);
    // warranty.removeAllListeners();
    res.send(result);
  });
    if(sessionuserid==userid){
      warranty.updateUserWarranty(userid,warranty_id);
    }else{
     warranty.emit("failedUpdateWarranty",{"error":{"code":"EA001","message":"You have not authorize to done this action"}})
    }
}

var isAuthorizedUser=function(userid,sessionuserid){
  var isAdmin = true;//to be done later user is admin
  
  if(userid==sessionuserid || isAdmin){
    return true;
  }else{
    return false;
  }
}

exports.deleteUserWarranty = function(req, res){
  var userid = req.params.userid;
  var warranty_id = req.params.warranty_id;
  var sessionuserid = req.user.userid;
  var warranty = new Warranty();

  warranty.removeAllListeners("failedDeleteUserWarranty");
    warranty.on("failedDeleteUserWarranty",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // warranty.removeAllListeners();
      res.send(err);
    });
  warranty.removeAllListeners("successfulDeleteUserWarranty");
  warranty.on("successfulDeleteUserWarranty",function(result){
    logger.emit("info", result.success.message,sessionuserid);
    // warranty.removeAllListeners();
    res.send(result);
  });

  if(isAuthorizedUser(userid,sessionuserid)){
    warranty.deleteUserWarranty(userid,warranty_id);
  }else{
    warranty.emit("failedDeleteUserWarranty",{"error":{"code":"EA001","message":"You have not authorize to done this action"}})
  }

}

exports.getUserWarranty = function(req,res){
  var userid = req.params.userid;
  var warranty_id = req.params.warranty_id;
  var sessionuserid = req.user.userid;
  var warranty = new Warranty();

  warranty.removeAllListeners("failedGetUserWarranty");
    warranty.on("failedGetUserWarranty",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // warranty.removeAllListeners();
      res.send(err);
    });
  warranty.removeAllListeners("successfulGetUserWarranty");
  warranty.on("successfulGetUserWarranty",function(result){
    logger.emit("info", result.success.message,sessionuserid);
    // warranty.removeAllListeners();
    res.send(result);
  });
  warranty.getUserWarranty(userid,warranty_id);
}

exports.getAllUserWarranty = function(req,res){
  var userid = req.params.userid;
  // var warranty_id = req.params.warranty_id;
  var sessionuserid = req.user.userid;
  var warranty = new Warranty();

  warranty.removeAllListeners("failedGetAllUserWarranty");
    warranty.on("failedGetAllUserWarranty",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // warranty.removeAllListeners();
      res.send(err);
    });
  warranty.removeAllListeners("successfulGetAllUserWarranty");
  warranty.on("successfulGetAllUserWarranty",function(result){
    logger.emit("info", result.success.message,sessionuserid);
    // warranty.removeAllListeners();
    res.send(result);
  });
  warranty.getAllUserWarranty(userid);
}
exports.loadMoreWarranties = function(req,res){
  var userid = req.params.userid;
  // var warranty_id = req.params.warranty_id;
  var sessionuserid = req.user.userid;
  var warranty_id=req.params.warranty_id;
  var warranty = new Warranty();

  warranty.removeAllListeners("failedLoadMoreWarranties");
    warranty.on("failedLoadMoreWarranties",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // warranty.removeAllListeners();
      res.send(err);
    });
  warranty.removeAllListeners("successfulLoadMoreWarranties");
  warranty.on("successfulLoadMoreWarranties",function(result){
    logger.emit("info", result.success.message,sessionuserid);
    // warranty.removeAllListeners();
    res.send(result);
  });
  if(sessionuserid!=userid){
    warranty.emit("failedLoadMoreWarranties",{error:{message:"You have not authorized to see warranties",code:"EA001"}})
  }else{
    warranty.loadMoreWarranties(userid,warranty_id);  
  }
  
}
