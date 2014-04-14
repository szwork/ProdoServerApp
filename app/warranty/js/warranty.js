/*
* Overview: Warranty 
* Dated:
* Author: Ramesh Kunhiraman
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* 26-02-2014|Dinesh|Add a Warranty 
*/

var events = require("events");
var logger = require("../../common/js/logger");
var ProductModel = require("../../product/js/product-model");
var WarrantyModel = require("./warranty-model");
var AWS = require('aws-sdk');
var CONFIG=require("config").Prodonus;
var amazonbucket=CONFIG.amazonbucket;
var S=require("string");
var exec = require('child_process').exec;
AWS.config.update({accessKeyId:'AKIAJOGXRBMWHVXPSC7Q', secretAccessKey:'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'});
AWS.config.update({region:'ap-southeast-1'});
var s3bucket = new AWS.S3();
var fs=require("fs");
var path=require("path");
var Warranty = function(warrantydata) {
	this.warranty = warrantydata;
};
 
Warranty.prototype = new events.EventEmitter;
module.exports = Warranty;

Warranty.prototype.addUserWarranty = function(sessionuserid,warrantyinvoice){
	var self = this;
	var warrantydata = this.warranty;
	// console.log("WarrantyData : " + JSON.stringify(warrantydata));
	////////////////////////////////////////////////////////////
	_validateWarrantyData(self,warrantydata,sessionuserid,warrantyinvoice);
	//////////////////////////////////////////////////////////
}

var _validateWarrantyData = function(self,warrantydata,sessionuserid,warrantyinvoice){
	// //validate warranty data
	// if(warrantydata==undefined){
	// 	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"Please provide data to add warranty"}});
	// }else if(warrantydata.name==undefined){
	// 	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"Please pass prdouct name"}});
	// }else if(warrantydata.model_no==undefined){
	// 	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"Please pass model number"}});
	// }else if(warrantydata.model_name==undefined){
	//   	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"please pass model name"}});
	// }else if(warrantydata.serial_no==undefined){
	//   	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"please pass serial number"}});
	// }else if(warrantydata.purchase_date==undefined){
	//   	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"please pass date of purchase"}});
	// }else if(warrantydata.purchase_location==undefined){
	//   	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"please pass purchase location"}});
	// }else if(warrantydata.purchase_location_city==undefined){
	//   	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"please pass city in purchase location"}});
	// }else if(warrantydata.purchase_location_country==undefined){
	//   	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"please pass country in purchase location"}});
	// }else if(warrantydata.expirydate==undefined){
	//   	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"please pass expiry date"}});
	// }else if(warrantydata.description==undefined){
	//   	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"please pass description "}});
	// }else if(warrantydata.warranty_type==undefined || warrantydata.warranty_type==""){
	// 	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"please pass warranty type "}});
	// }else if(["extended","standard"].indexOf(warrantydata.warranty_type.toLowerCase())<0){
	//   	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"Warranty type should be extended or standard"}});
	// }else if(warrantyinvoice==undefined){
	// 	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"please upload warrantyinvoice "}});
	// }else if(warrantyinvoice.originalFilename==""){
	// 	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"Please upload  ddwarrantyinvoice"}});
	// }else if(!S(warrantyinvoice.type).contains("image") && !S(warrantyinvoice.type).contains("pdf")){
	// 	self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"Please upload only image or pdf"}});
	// }else{

	// 	if(warrantydata.prodle==""){
	// 		///////////////////////////////////////
	// 		_validateWarrantyInvoice(self,warrantydata,sessionuserid,warrantyinvoice)
	// 		//////////////////////////////////////
			
	// 	}else{
	// 		_checkProdleIsValid(self,warrantydata,sessionuserid,warrantyinvoice);
	// 	}	
	// }
};

var _checkProdleIsValid = function(self,warrantydata,sessionuserid,warrantyinvoice){

	ProductModel.findOne({prodle:warrantydata.prodle},function(err,productdata){
		if(err){
			self.emit("failedAddUserWarranty",{"error":{"code":"ED001","message":" function:_checkProdleIsValid \nError in db to find product err message: "+err}});
		}else if(!productdata){
			self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"Wrong prodle"}});
		}else{
			///////////////////////////////////
			_checkWarrantyAlreadyExist(self,warrantydata,sessionuserid,warrantyinvoice);
			///////////////////////////////////
		}
	})
}

var _checkWarrantyAlreadyExist = function(self,warrantydata,sessionuserid,warrantyinvoice){
	warrantydata.userid = sessionuserid;
	WarrantyModel.findOne({prodle:warrantydata.prodle,userid:warrantydata.userid},function(err,warranty){
		if(err){
			self.emit("failedAddUserWarranty",{"error":{"code":"ED001","message":"Error in db to find warranty err message: "+err}});
		}else if(!warranty){
			///////////////////////////////////////
			_validateWarrantyInvoice(self,warrantydata,sessionuserid,warrantyinvoice)
			//////////////////////////////////////
			
		}else{
			self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"Warranty Already Exist"}});
		}
	})	
}
var _validateWarrantyInvoice=function(self,warrantydata,sessionuserid,warrantyinvoice){
	///////////////////////////////////
			_addUserWarranty(self,warrantydata,sessionuserid,warrantyinvoice);
			///////////////////////////////////			
}
var _addUserWarranty = function(self,warrantydata,sessionuserid,warrantyinvoice){

	var purchaseDate = new Date(warrantydata.purchase_date);
	var expiryDate = new Date(warrantydata.expirydate);

	// console.log("Date " + purchaseDate);
	// var day = purchaseDate.getDate();
	purchaseDate.setDate(purchaseDate.getDate()+1);
	expiryDate.setDate(expiryDate.getDate()+1);
	// console.log("NewDate " + purchaseDate);
	if(purchaseDate == "Invalid Date"){
		self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"Invalid purchase date"}});
	}else if(expiryDate == "Invalid Date"){
		self.emit("failedAddUserWarranty",{"error":{"code":"AV001","message":"Invalid expiry date"}});
	}else{
		warrantydata.purchase_date = purchaseDate;
		warrantydata.expirydate = expiryDate;
		warrantydata.userid = sessionuserid;
		var warranty = new WarrantyModel(warrantydata);
		warranty.save(function(err,warranty_data){
		 	if(err){
		  		self.emit("failedAddUserWarranty",{"error":{"code":"ED001","message":"Error in db to add new warranty "+ err}});	
		  	}else{

		  		//////////////////////////////////////////////////////////////
		  		_associateInvocieImageToWarranty(self,warranty,warrantyinvoice,sessionuserid)
		  		/////////////////////////////////////////////////////////////
		  		
		  	}
		})	
	}
	
}
var _associateInvocieImageToWarranty=function(self,warranty,warrantyinvoice,sessionuserid){
	fs.readFile(warrantyinvoice.path,function (err, data) {
  		if(err){
  			logger.emit("error","File Read Issue:_associateInvocieImageToWarranty,err:"+err,sessionuserid);
  			self.emit("failedAddUserWarranty",{"error":{"message":"Warranty Invoice Read Issue"}});		
  		}else{
  			var ext = path.extname(warrantyinvoice.originalFilename||'').split('.');
  			ext=ext[ext.length - 1];
  			 var s3filekey=Math.floor((Math.random()*1000)+1)+"."+ext;
		    var bucketFolder;
		    var params;
		    bucketFolder=amazonbucket+"/user/"+sessionuserid+"/warranty"+warranty.warranty_id;
      	    params = {
	             Bucket: bucketFolder,
	             Key:warranty.warranty_id+s3filekey,
	             Body: data,
	             //ACL: 'public-read-write',
	             ContentType: warrantyinvoice.type
            };
            ////////////////////////////////////////////////////////////
            _addWarrantyInvoiceFileToAmazonServer(self,params,warranty.warranty_id,sessionuserid,warrantyinvoice);
            ////////////////////////////////////////////////////////////////////////////
  			
  		}
  	});
}
var _addWarrantyInvoiceFileToAmazonServer=function(self,awsparams,warranty_id,userid,warrantyinvoice){
	s3bucket.putObject(awsparams, function(err, data) {
    if (err) {
      self.emit("failedAddUserWarranty",{"error":{"message":"s3bucket.putObject:-_addProviderLogoToAmazonServer"+err}})
    } else {
      var params1 = {Bucket: awsparams.Bucket, Key: awsparams.Key,Expires: 60*60*24*365};
      s3bucket.getSignedUrl('getObject',params1, function (err, url) {
        if(err){
          self.emit("failedAddUserWarranty",{"error":{"message":"userFileUpload:Error in getting getSignedUrl"+err}});
        }else{
          var newprofileurl={bucket:params1.Bucket,key:params1.Key,image:url};
          // console.log("providerid"+providerid);
          WarrantyModel.update({warranty_id:warranty_id},{$set:{invoice_image:newprofileurl}},function(err,warrantyinvoiceimage){
            if(err){
              self.emit("failedAddUserWarranty",{"error":{"code":"EDOO1","message":"userFileUpload:Dberror"+err}});
            }else if(warrantyinvoiceimage==0){
            	self.emit("failedAddUserWarranty",{"error":{"message":"warranty id wrong"}});
            }else{
              
			 exec("rm -rf "+"../../../"+warrantyinvoice.path);
              console.log("rm -rf "+"../../../"+warrantyinvoice.path);               
               //////////////////////////////           
              _successfulWarrantyAdd(self,url)
              ///////////////////////////////////
            }
          })
        }
      });
    }
  }) 
}
var _successfulWarrantyAdd = function(self,url){
	logger.log("log","successfulAddUserWarranty");
	self.emit("successfulAddUserWarranty",{"success":{"message":"Warranty added sucessfully","image":url}})
}

Warranty.prototype.updateUserWarranty = function(userid,warranty_id){
	var self = this;
	var warrantydata = this.warranty;
	// console.log("WarrantyData : " + JSON.stringify(warrantydata));
	////////////////////////////////////////////////
	_validateUpdateWarrantyData(self,userid,warranty_id);
	////////////////////////////////////////////////
}

var _validateUpdateWarrantyData = function(self,userid,warranty_id){
	//validate warranty update data
	var warrantydata = self.warranty;
	if(warrantydata==undefined){
		self.emit("failedUpdateWarranty",{"error":{"code":"AV001","message":"Please provide data to add warranty"}});
	}else {
	  	_updateUserWarranty(self,userid,warranty_id,warrantydata);
	}
};

var _updateUserWarranty = function(self,userid,warranty_id,warrantydata){
	var modifieddate = new Date();
	console.log("userid " + userid+ " warranty_id : "+warranty_id);
	warrantydata.modified_date = modifieddate;
	WarrantyModel.update({userid:userid,warranty_id:warranty_id},{$set:warrantydata}).lean().exec(function(err,warrantyupdatestatus){
		if(err){
			self.emit("failedUpdateWarranty",{"error":{"code":"ED001","message":"Error in db to update warranty"}});
		}else if(warrantyupdatestatus!=1){
			self.emit("failedUpdateWarranty",{"error":{"code":"AP001","message":"userid or warranty_id is wrong"}});
		}else{
			////////////////////////////////
			_successfulUpdateWarranty(self);
			////////////////////////////////
		}
	})
}

var _successfulUpdateWarranty = function(self){
	logger.emit("log","_successfulUpdateProduct");
	self.emit("successfulWarrantyUpdation", {"success":{"message":"Warranty Updated Successfully"}});
}

Warranty.prototype.deleteUserWarranty = function(userid,warranty_id){	
	var self = this;
	////////////////////////////////////////////
	_deleteUserWarranty(self,userid,warranty_id);
	////////////////////////////////////////////
}

var _deleteUserWarranty = function(self,userid,warranty_id){
	console.log("Delete UserId " + userid + " Warranty_id " + warranty_id);
	WarrantyModel.update({userid:userid,warranty_id:warranty_id},{$set:{removedate:new Date(),status:'deactive'}},function(err,userupdatestatus){
		if(err){
			self.emit("failedDeleteUserWarranty",{"error":{"code":"ED001","message":"Error in db to update user data"}});
		}else if(userupdatestatus!=1){
			self.emit("failedDeleteUserWarranty",{"error":{"code":"AU005","message":"Provided userid or Warranty is wrong"}});
		}else{
			/////////////////////////////////////
			_successfulUserWarrantyDeletion(self);
			/////////////////////////////////////
		}
	})
}

var _successfulUserWarrantyDeletion = function(self){
	logger.emit("log","_successfulDeleteUserWarranty");
	self.emit("successfulDeleteUserWarranty", {"success":{"message":"User Warranty Deleted Successfully"}});
}

Warranty.prototype.getUserWarranty = function(userid,warranty_id){
	var self = this;
	/////////////////////////////////////////
	_getUserWarranty(self,userid,warranty_id);
	/////////////////////////////////////////
}

var _getUserWarranty = function(self,userid,warranty_id){
	console.log("_getUserWarranty " + userid+" "+warranty_id);
	WarrantyModel.findOne({status:"active",userid:userid,warranty_id:warranty_id},function(err,warranty){
		if(err){
			self.emit("failedGetUserWarranty",{"error":{"code":"ED001","message":"Error in db to find warranty err message: "+err}})
		}else if(!warranty){
			self.emit("failedGetUserWarranty",{"error":{"code":"AV001","message":"User warranty does not exist"}})
		}else{
			_successfulGetUserWarranty(self,warranty);
		}
	});
}

var _successfulGetUserWarranty = function(self,doc){
	logger.emit("log","_successfulGetUserWarranty");
	self.emit("successfulGetUserWarranty", {"success":{"message":"Getting Warranty details Successfully","Warranty":doc}});
}

Warranty.prototype.getAllUserWarranty = function(userid){
	var self = this;
	/////////////////////////////////////////
	_getAllUserWarranty(self,userid);
	/////////////////////////////////////////
}

var _getAllUserWarranty = function(self,userid){
	console.log("_getAllUserWarranty " + userid);
	WarrantyModel.find({status:"active",userid:userid},function(err,warranty){
		if(err){
			self.emit("failedGetAllUserWarranty",{"error":{"code":"ED001","message":"Error in db to find warranty err message: "+err}})
		}else if(!warranty){
			self.emit("failedGetAllUserWarranty",{"error":{"code":"AV001","message":"User warranty does not exist"}})
		}else{
			_successfulGetAllUserWarranty(self,warranty);
		}
	});
}

var _successfulGetAllUserWarranty = function(self,doc){
	logger.emit("log","_successfulGetAllUserWarranty");
	self.emit("successfulGetAllUserWarranty", {"success":{"message":"Getting Warranty details Successfully","Warranty":doc}});
}