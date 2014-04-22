/*
* Overview: Product Campain
* Dated:
* Author: Dinesh Sawant
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* 21-04-2014 | Dinesh | Add a new property
* 
*/
var events = require("events");
var logger = require("../../common/js/logger");
var OrgModel = require("../../org/js/org-model");
var ProductModel = require("../../product/js/product-model");
var ProductCampaignModel = require("./product-campaign-model");
var CONFIG = require('config').Prodonus;
var AWS = require('aws-sdk');
AWS.config.update({accessKeyId:'AKIAJOGXRBMWHVXPSC7Q', secretAccessKey:'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'});
AWS.config.update({region:'ap-southeast-1'});
var s3bucket = new AWS.S3();
var S=require("string");
var ProductCampaign = function(campaigndata) {
	this.productcampaign = campaigndata;
};

ProductCampaign.prototype = new events.EventEmitter;
module.exports = ProductCampaign;

ProductCampaign.prototype.addProductCampaign=function(orgid,prodle,sessionuserid){
	var self=this;
	var campaigndata = this.productcampaign;
	/////////////////////////////////////////////////////
	_isValidOrgID(self,campaigndata,orgid,prodle,sessionuserid);
	/////////////////////////////////////////////////////
}

var _isValidOrgID = function(self,campaigndata,orgid,prodle,sessionuserid){
	OrgModel.findOne({orgid:orgid,status:{$ne:"deactive"}}).lean().exec(function(err,org){
		if(err){
			self.emit("failedAddProductCampaign",{"error":{"code":"ED001","message":"Error in db to find Product Campain : " +err}});
		}else if(org){
			//////////////////////////////////////////////////
			_isValidProdle(self,campaigndata,orgid,prodle,sessionuserid);
			//////////////////////////////////////////////////
		}else{			
			self.emit("failedAddProductCampaign",{"error":{"code":"AP001","message":"Provided orgid is wrong"}});
		}
	})
}

var _isValidProdle = function(self,campaigndata,orgid,prodle,sessionuserid){
	ProductModel.findOne({orgid:orgid,prodle:prodle,status:{$ne:"deactive"}}).lean().exec(function(err,org){
		if(err){
			self.emit("failedAddProductCampaign",{"error":{"code":"ED001","message":"Error in db to find Product Campain : " +err}});
		}else if(org){
			//////////////////////////////////////////////////
			_validateProductCampaignData(self,campaigndata,orgid,prodle,sessionuserid);
			//////////////////////////////////////////////////
		}else{			
			self.emit("failedAddProductCampaign",{"error":{"code":"AP001","message":"You can not add campaign for the product which does not exist in the organization"}});
		}
	})
}

var _validateProductCampaignData = function(self,campaigndata,orgid,prodle,sessionuserid) {
	//validate the product campain data
	if(campaigndata==undefined){
	 	self.emit("failedAddProductCampaign",{"error":{"code":"AV001","message":"Please provide data to add product campain"}});
	}else if(campaigndata.name==undefined){
		self.emit("failedAddProductCampaign",{"error":{"code":"AV001","message":"Please pass name"}});
	}else if(campaigndata.productname==undefined){
		self.emit("failedAddProductCampaign",{"error":{"code":"AV001","message":"Please pass productname"}});
	}else if(campaigndata.category==undefined){
		self.emit("failedAddProductCampaign",{"error":{"code":"AV001","message":"Please pass category"}});
	}else if(campaigndata.description==undefined){
	  	self.emit("failedAddProductCampaign",{"error":{"code":"AV001","message":"please pass product description "}});
	}else if(campaigndata.startdate==undefined){
	  	self.emit("failedAddProductCampaign",{"error":{"code":"AV001","message":"please pass start date"}});
	}else if(campaigndata.enddate==undefined){
	  	self.emit("failedAddProductCampaign",{"error":{"code":"AV001","message":"please pass end date"}});
	}else{
	  	_addProductCampaign(self,campaigndata,orgid,prodle);	   	
	}
};

var _addProductCampaign=function(self,campaigndata,orgid,prodle){

	var startDate = new Date(campaigndata.startdate);
	var endDate = new Date(campaigndata.enddate);
	console.log("startDate 1 : " + startDate);
	startDate.setDate(startDate.getDate()+1);
	endDate.setDate(endDate.getDate()+1);

	console.log("startDate 2 : " + startDate);
	if(startDate == "Invalid Date"){
		self.emit("failedAddProductCampaign",{"error":{"code":"AV001","message":"Invalid start date"}});
	}else if(endDate == "Invalid Date"){
		self.emit("failedAddProductCampaign",{"error":{"code":"AV001","message":"Invalid end date"}});
	}else{
		campaigndata.prodle=prodle;
		campaigndata.orgid=orgid;
		campaigndata.startdate = startDate;
		campaigndata.enddate = endDate;
		var productcampaign = new ProductCampaignModel(campaigndata);
		productcampaign.save(function(err,product_campaign_data){
		 	if(err){
		  		self.emit("failedAddProductCampaign",{"error":{"code":"ED001","message":"Error in db to add new product campain : "+err}});	
		  	}else{
		  		//////////////////////////////////
		  		_successfulProductCampaignAdd(self);
		  		/////////////////////////////////	  
		  	}
		});
	}
	
}

var _successfulProductCampaignAdd=function(self){
	logger.log("log","_successfulProductCampaignAdd");
	self.emit("successfulAddProductCampaign",{"success":{"message":"Product Campaign added sucessfully"}});
}

ProductCampaign.prototype.updateProductCampaign=function(orgid,campaign_id,sessionuserid){
	var self=this;
	var campaigndata = this.productcampaign;
	/////////////////////////////////////////////////////
	_validateUpdateProductCampaignData(self,campaigndata,orgid,campaign_id,sessionuserid);
	/////////////////////////////////////////////////////
}

var _validateUpdateProductCampaignData = function(self,campaigndata,orgid,campaign_id,sessionuserid) {
	//validate the product campain data
	if(campaigndata==undefined){
	 	self.emit("failedUpdateProductCampaign",{"error":{"code":"AV001","message":"Please provide data to update product campain"}});
	}else{
	  	_updateProductCampaignData(self,campaigndata,orgid,campaign_id);	   	
	}
};

var _updateProductCampaignData = function(self,campaigndata,orgid,campaign_id){
	ProductCampaignModel.update({orgid:orgid,campaign_id:campaign_id},{$set:campaigndata}).lean().exec(function(err,productupdatestatus){
		if(err){
			self.emit("failedUpdateProductCampaign",{"error":{"code":"ED001","message":"Error in db to update product"}});
		}else if(productupdatestatus!=1){
			self.emit("failedUpdateProductCampaign",{"error":{"code":"AP001","message":"orgid or campaign id is wrong"}});
		}else{
			////////////////////////////////
			_successfulUpdateProductCampaignData(self);
			//////////////////////////////////
		}
	})
} 

var _successfulUpdateProductCampaignData=function(self){
	logger.log("log","_successfulUpdateProductCampaignData");
	self.emit("successfulUpdateProductCampaign",{"success":{"message":"Product Campaign Updated Sucessfully"}})
}

ProductCampaign.prototype.removeProductCampaign=function(campaign_id,sessionuserid){
	var self=this;
	/////////////////////////////////////////////////////
	_checkProductCampaignExistOrNot(self,campaign_id,sessionuserid);
	/////////////////////////////////////////////////////
}

var _checkProductCampaignExistOrNot = function(self,campaign_id,sessionuserid){
	ProductCampaignModel.findOne({status:{$ne:"deactive"},campaign_id:campaign_id}).lean().exec(function(err,productcampain){
		if(err){
			self.emit("failedRemoveProductCampaign",{"error":{"code":"ED001","message":"Error in db to find Product Campaign : " +err}});
		}else if(productcampain){
			//////////////////////////////////////////////////
			_removeProductCampaign(self,campaign_id,sessionuserid);
			//////////////////////////////////////////////////
		}else{			
			self.emit("failedRemoveProductCampaign",{"error":{"code":"AP001","message":"Provided campaign_id is wrong"}});
		}
	})
}

var _removeProductCampaign = function(self,campaign_id,sessionuserid){
	ProductCampaignModel.update({campaign_id:campaign_id},{$set:{status:"deactive"}}).lean().exec(function(err,productupdatestatus){
		if(err){
			self.emit("failedRemoveProductCampaign",{"error":{"code":"ED001","message":"Error in db to delete product campaign"}});
		}else if(productupdatestatus!=1){
			self.emit("failedRemoveProductCampaign",{"error":{"code":"AP001","message":"Wrong campaign id"}});
		}else{
			////////////////////////////////
			_successfulRemoveProductCampaign(self);
			//////////////////////////////////
		}
	})
} 

var _successfulRemoveProductCampaign=function(self){
	logger.log("log","_successfulRemoveProductCampaign");
	self.emit("successfulRemoveProductCampaign",{"success":{"message":"Product Campaign Stopped Sucessfully"}})
}

ProductCampaign.prototype.getProductCampaign = function(orgid,campain_id) {
	var self=this;
	//////////////////////////////////////////
	_getProductCampaign(self,orgid,campain_id);
	/////////////////////////////////////////
};

var _getProductCampaign = function(self,orgid,campaign_id){
	ProductCampaignModel.findOne({status:{$ne:"deactive"},orgid:orgid,campaign_id:campaign_id}).lean().exec(function(err,productcampain){
		if(err){
			self.emit("failedGetProductCampaign",{"error":{"code":"ED001","message":"Error in db to find Product Campaign : " +err}});
		}else if(productcampain){
			//////////////////////////////////////////////////
			_successfulGetProductCampaign(self,productcampain);
			//////////////////////////////////////////////////
		}else{			
			self.emit("failedGetProductCampaign",{"error":{"code":"AP001","message":"Provided orgid or campaign_id is wrong"}});
		}
	})
}

var _successfulGetProductCampaign = function(self,productcampain){
	logger.emit("log","_successfulGetProductCampaign");
	self.emit("successfulGetProductCampaign", {"success":{"message":"Getting Product Campaign Details Successfully","Product_Campaign":productcampain}});
}

ProductCampaign.prototype.getAllOrgCampaign = function(orgid) {
	var self=this;
	//////////////////////////////////
	_getAllOrgCampaign(self,orgid);
	/////////////////////////////////
};

var _getAllOrgCampaign = function(self,orgid){
	ProductCampaignModel.find({orgid:orgid,status:{$ne:"deactive"}}).lean().exec(function(err,productcampain){
		if(err){
			self.emit("failedGetAllOrgCampaign",{"error":{"code":"ED001","message":"Error in db to find All Product Campain : "+err}});
		}else if(productcampain.length==0){
			self.emit("failedGetAllOrgCampaign",{"error":{"code":"AP002","message":"No Organization Campaign Exists"}});
		}else{
			////////////////////////////////////////////////////
			_successfulGetAllOrgCampaign(self,productcampain);
			////////////////////////////////////////////////////
		}
	})
}

var _successfulGetAllOrgCampaign = function(self,productcampain){
	logger.emit("log","_successfulGetAllOrgCampaign");
	self.emit("successfulGetAllOrgCampaign",{"success":{"message":"Getting All Organization Campaign Details Successfully","Product_Campaigns":productcampain}});
}

ProductCampaign.prototype.getAllProductCampaign = function(prodle) {
	var self=this;
	//////////////////////////////////
	_getAllProductCampaign(self,prodle);
	/////////////////////////////////
};

var _getAllProductCampaign = function(self,prodle){
	ProductCampaignModel.find({prodle:prodle,status:{$ne:"deactive"}}).lean().exec(function(err,productcampain){
		if(err){
			self.emit("failedGetAllProductCampaign",{"error":{"code":"ED001","message":"Error in db to find All Product Campain : "+err}});
		}else if(productcampain.length==0){
			self.emit("failedGetAllProductCampaign",{"error":{"code":"AP002","message":"No Product Campaign Exists"}});
		}else{
			////////////////////////////////////////////////////
			_successfulGetAllProductCampaign(self,productcampain);
			////////////////////////////////////////////////////
		}
	})
}

var _successfulGetAllProductCampaign = function(self,productcampain){
	logger.emit("log","_successfulGetAllProductCampaign");
	self.emit("successfulGetAllProductCampaign",{"success":{"message":"Getting All Product Campaign Details Successfully","Product_Campaigns":productcampain}});
}

ProductCampaign.prototype.deleteCampaignImage = function(camimageids,campaign_id) {
	var self=this;
	if(camimageids==undefined){
		self.emit("failedDeleteCampaignImage",{"error":{"code":"AV001","message":"Please provide campaign image ids"}});
	}else if(camimageids.length==0){
		self.emit("failedDeleteCampaignImage",{"error":{"message":"Given camimageids is empty "}});
	}else{
		///////////////////////////////////////////////////////////////////
	_deleteCampaignImage(self,camimageids,campaign_id);
	/////////////////////////////////////////////////////////////////	
	}
	
};
var _deleteCampaignImage=function(self,camimageids,campaign_id){
	 var camp_imagearray=[];
	camimageids=S(camimageids);
	// db.products.update({"product_images.imageid":{$in:["7pz904msymu","333"]}},{$pull:{"product_images":{imageid:{$in:["7pz904msymu","333"]}}}});
   if(camimageids.contains(",")){
   		camp_imagearray=camimageids.split(",");
   }else{
   		camp_imagearray.push(camimageids.s);
   }
	ProductCampaignModel.findAndModify({campaign_id:campaign_id,"artwork.imageid":{$in:camp_imagearray}},[],{$pull:{artwork:{imageid:{$in:camp_imagearray}}}},{new:false},function(err,deleteimagestatus){
		if(err){
			self.emit("failedDeleteCampaignImage",{"error":{"code":"ED001","message":"function:_deleteCampaignImage\nError in db to "}});
		}else if(!deleteimagestatus){
			self.emit("failedDeleteCampaignImage",{"error":{"message":"campaign_id or given camimageids is wrong "}});
		}else{
			var artwork=deleteimagestatus.artwork;
			// artwork=JSON.parse(artwork);
			logger.emit("log","dd"+JSON.stringify(artwork));
			var object_array=[];
			for(var i=0;i<artwork.length;i++){
				object_array.push({Key:artwork[i].key});
				console.log("test"+artwork[i]);
			}
			logger.emit("log","object_array:"+JSON.stringify(object_array));
			var delete_aws_params={
				Bucket: artwork[0].bucket, // required
  			Delete: { // required
    				Objects: object_array,
      			Quiet: true || false
      		}
      	}
      	logger.emit('log',"delete_aws_params:"+JSON.stringify(delete_aws_params));
      s3bucket.deleteObjects(delete_aws_params, function(err, data) {
			  if (err){
			  	logger.emit("error","Campaign images not deleted from amazon s3 campaign_id:"+campaign_id)
			  } else{
			  	logger.emit("log","Campaign images deleted from amazon s3 campaign_id:"+campaign_id);
			  } 
			})
			//////////////////////////////////
			_successfulDeleteCampaignImage(self);
			/////////////////////////////////////
		}
	})
}
var _successfulDeleteCampaignImage=function(self){
	logger.emit("log","_successfulDeleteCampaignImage");
	self.emit("successfulDeleteCampaignImage",{"success":{"message":"Delete Campaign Images Successfully"}});
}

