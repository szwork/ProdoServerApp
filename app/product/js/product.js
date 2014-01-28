/*
* Overview: Product 
* Dated:
* Author: Ramesh Kunhiraman
* Copyright: Prodonus Software Private Limited and GiantLeap Systems Private Limited 2013
* Change History:
* ----------------------------------------------------------------------
* date | author | description 
* ----------------------------------------------------------------------
* 27-3-2013 | xyx | Add a new property
* 12-11-2013|Sunil|Add a subscription 
*/

var util = require("util");
var events = require("events");
var logger = require("../../common/js/logger");
var productModel = require("./product-model");
var commonapi = require('../../common/js/common-api');
var CONFIG = require('config').Prodonus;
var shortId = require('shortid');
var S=require('string');
// var CommentModel=require("./comment-model");

var Product = function(productdata) {
	this.product = productdata;
};

var regxemail = /\S+@\S+\.\S+/; 
Product.prototype = new events.EventEmitter;
module.exports = Product;


Product.prototype.addProduct=function(orgid,sessionuserid){
	var self=this;
	var productdata=this.product;
	////////////////////////////////////////////////////////////
	_validateProductData(self,productdata,orgid,sessionuserid);
	//////////////////////////////////////////////////////////
}

	var _validateProductData = function(self,productdata,orgid,sessionuserid) {
		//validate the org data
		 if(productdata==undefined){
		 	self.emit("failedProductAdd",{"error":{"code":"AV001","message":"Please provide data to add product"}});
		 }else if(productdata.name==undefined){
	   		self.emit("failedProductAdd",{"error":{"code":"AV001","message":"Please pass prdouct name"}});
	   	} else if(productdata.description==undefined){
	    	self.emit("failedProductAdd",{"error":{"code":"AV001","message":"please pass product description "}});
	  	 }else{

	   	/////////////////////////////
	   	_addProduct(self,productdata,orgid);
	   	///////////////////////
	   }
	};
	var _addProduct=function(self,productdata,orgid){
		productdata.orgid=orgid;
	  var product=new productModel(productdata);
	  product.save(function(err,product_data){
	  	if(err){
	  		self.emit("failedProductAdd",{"error":{"code":"ED001","message":"Error in db to add new product "}});	
	  	}else{
	  		///////////////////////
	  		_successfulProductAdd(self);
	  		//////////////////////////
	  	  
	  	}
	  })

	}
	var _successfulProductAdd=function(self){
		logger.log("log","_successfulProductAdd");
		self.emit("successfulProductAdd",{"success":{"message":"Product added sucessfully"}})
	}
// Product.prototype.commentToProduct=function(sessionuserid,prodle,commentdata){
// 	var self=this;
//       ////////////////////////////////////
// 	_validateCommentData(self,sessionuserid,prodle,commentdata);
// 	//////////////////////////////////////
	
// }
// var _validateCommentData=function(self,sessionuserid,prodle,commentdata) {
// 	if(commentdata==undefined){
// 	   self.emit("failedCommentToProduct",{"error":{"code":"AV001","message":"Please provide commentdata"}});	
// 	}else if(commentdata.user==undefined){
// 		self.emit("failedCommentToProduct",{"error":{"code":"AV001","message":"Please provide user to commentdata"}});		
// 	}else if(commentdata.user.userid==undefined){
// 		self.emit("failedCommentToProduct",{"error":{"code":"AV001","message":"Please provide userid with user object"}});		
// 	} else if(commentdata.commenttext==undefined){
// 		self.emit("failedCommentToProduct",{"error":{"code":"AV001","message":"Please pass commenttext"}});			
// 	}else if(commentdata.commenttext.trim().length==0){
// 		self.emit("failedCommentToProduct",{"error":{"code":"AV001","message":"Please enter commenttext"}});			
// 	}else{
// 		///////////////////////////////////////////////////////
// 		_isSessionUserToComment(self,sessionuserid,prodle,commentdata);
// 		///////////////////////////////////////////////////////
// 	}
// }
// var _isSessionUserToComment=function(self,sessionuserid,prodle,commentdata){
// 	if(sessionuserid!=commentdata.user.userid){
// 		self.emit("failedCommentToProduct",{"error":{"code":"EA001","message":"Provided userid is not match with sessionuserid"}})
// 	}else{
// 		///////////////////////////////////////////
// 		__commentToProduct(self,prodle,commentdata);
// 		///////////////////////////////////////////
// 	}
// }
// var __commentToProduct=function(self,prodle,commentdata){
// 	commentdata.commentid="prc"+shortId.generate();
// 	commentdata.status="active";
// 	commentdata.datecreated=new Date();
// 	commentdata.prodle=prodle;
// 	var product_comment=new CommentModel(commentdata);
// 	product_comment.save(function(err,product_commentdata){
// 		if(err){
// 			self.emit("failedCommentToProduct",{"error":{"code":"ED001","message":"Error in db to save new comment"}});
// 		}else{
// 			var q = CommentModel.find({prodle:prodle,type:"product"},{_id:0,prodle:0}).sort({datecreated:-1}).limit(5);
// 			q.lean().exec(function(err, CommentModels) {
// 				if(err){
// 					self.emit("failedCommentToProduct",{"error":{"code":"ED001","message":"Error in db to find Product Comment"}});
// 				}else if(CommentModels.length!=0){//there is no comment of product type
// 					productModel.update({prodle:prodle},{$set:{product_comments:CommentModels}},function(err,commentstatus){
// 						if(err){
// 							self.emit("failedCommentToProduct",{"error":{"code":"ED001","message":"Error in db to give comment to product"}});
// 						}else if(commentstatus!=1){
// 							self.emit("failedCommentToProduct",{"error":{"code":"AP001","message":"prodct id is wrong"}});
// 						}else{
// 							///////////////////////////////////
// 							_successfulcommentToProduct(self,product_commentdata);
// 							/////////////////////////////////
// 						}
// 					})
// 				}else{//if there is no new product update comment
// 					///////////////////////////////////
// 					_successfulcommentToProduct(self,product_commentdata);
// 					/////////////////////////////////
// 				}
//   			})
// 		}
// 	})
// }
// var _successfulcommentToProduct=function(self,newcomment){
// 	logger.emit("log","_successfulcommentToProduct");
// 	self.emit("successfulCommentToProduct",{"success":{"message":"Gave comment to product sucessfully","product_comment":newcomment}})
// }
Product.prototype.getProduct = function(orgid,prodle) {
	var self=this;
	/////////////////////////
	_getProduct(self,orgid,prodle);
	////////////////////////
};
var _getProduct=function(self,orgid,prodle){
	productModel.findOne({orgid:orgid,prodle:prodle,status:{$ne:"deactive"}}).lean().exec(function(err,product){
		if(err){
			self.emit("failedGetProduct",{"error":{"code":"ED001","message":"Error in db to find Product"}});
		}else if(product){
			 ////////////////////////////////
			_successfulGetProduct(self,product);
			//////////////////////////////////
		}else{
			
			self.emit("failedGetProduct",{"error":{"code":"AP001","message":"Provided prodle is wrong"}});
		}
	})
}
var _successfulGetProduct=function(self,product){
	logger.emit("log","_successfulProductGet");
	self.emit("successfulGetProduct", {"success":{"message":"Getting Product details Successfully","product":product}});
}
Product.prototype.getAllProduct = function(orgid) {
	var self=this;
	//////////////////
	_getAllProduct(self,orgid);
	///////////////////
};
var _getAllProduct=function(self,orgid){
	productModel.find({orgid:orgid,status:{$ne:"deactive"}}).lean().exec(function(err,product){
		if(err){
			self.emit("failedGetAllProduct",{"error":{"code":"ED001","message":"Error in db to find all product"}});
		}else if(product.length==0){
			self.emit("failedGetAllProduct",{"error":{"code":"AP002","message":"No product exists"}});
		}else{
			////////////////////////////////
			_successfulGetAllProduct(self,product);
			//////////////////////////////////
		}
	})
};

var _successfulGetAllProduct=function(self,product){
	logger.emit("log","successfulGetAllProduct");
	self.emit("successfulGetAllProduct", {"success":{"message":"Getting All Product details Successfully","product":product}});
}
Product.prototype.deleteProduct = function(orgid,prodle) {
	var self=this;
	//////////////////
	_deleteProduct(self,orgid,prodle);
	///////////////////
};
var _deleteProduct=function(self,orgid,prodle){
	productModel.update({orgid:orgid,prodle:prodle},{$set:{status:"deactive"}}).lean().exec(function(err,productdeletestatus){
		if(err){
			self.emit("failedDeleteProduct",{"error":{"code":"ED001","message":"Error in db to delete product"}});
		}else if(productdeletestatus!=1){
			self.emit("failedDeleteProduct",{"error":{"code":"AP001","message":"product id is wrong"}});
		}else{
			////////////////////////////////
			_successfulDeleteProduct(self);
			//////////////////////////////////
		}
	})
};

var _successfulDeleteProduct=function(self){
	logger.emit("log","_successfulDeleteProduct");
	self.emit("successfulDeleteProduct", {"success":{"message":"Delete Product Successfully"}});
}
Product.prototype.deleteProductImage = function(prodleimageids,prodle,orgid) {
	var self=this;
	if(prodleimageids==undefined){
		self.emit("failedDeleteProductImage",{"error":{"code":"AV001","message":"Please provide prodleimageids "}});
	}else if(prodleimageids.length==0){
		self.emit("failedDeleteProductImage",{"error":{"message":"Given prodleimageids is empty "}});
	}else{
		///////////////////////////////////////////////////////////////////
	_deleteProductImage(self,prodleimageids,prodle,orgid);
	/////////////////////////////////////////////////////////////////	
	}
	
};
var _deleteProductImage=function(self,prodleimageids,prodle,orgid){
	var prodle_imagearray=[];
	
	//db.products.update({"product_images.imageid":{$in:["7pz904msymu","333"]}},{$pull:{"product_images":{imageid:{$in:["7pz904msymu","333"]}}}});
	 prodleimageids=S(prodleimageids);

     if(prodleimageids.contains(",")){
     	prodle_imagearray=prodleimageids.split(",");
     }else{
     	prodle_imagearray.push(prodleimageids.s)
     }
	productModel.update({orgid:orgid,prodle:prodle,"product_images.imageid":{$in:prodle_imagearray}},{$pull:{product_images:{imageid:{$in:prodle_imagearray}}}},function(err,deleteimagestatus){
		if(err){
			self.emit("failedDeleteProductImage",{"error":{"code":"ED001","message":"function:_deleteProductImage\nError in db to "}});
		}else if(deleteimagestatus==0){
			self.emit("failedDeleteProductImage",{"error":{"message":"orgid or prodle or given prodleimageids is wrong "}});
		}else{
			//////////////////////////////////
			_successfulDeleteProductImage(self);
			/////////////////////////////////////
		}
	})
}
var _successfulDeleteProductImage=function(self){
	logger.emit("log","_successfulDeleteProductImage");
	self.emit("successfulDeleteProductImage",{"success":{"message":"Delete Product Images Successfully"}});
}
Product.prototype.updateProduct = function(orgid,prodle) {
	var self=this;
	//////////////////
	_validateUpdateProductData(self,orgid,prodle);
	///////////////////
};
var _validateUpdateProductData=function(self,orgid,prodle){
	var productdata=self.product;
	if(productdata==undefined){
		self.emit("failedUpdateProduct",{"error":{"code":"AV001","message":"Please pass update data"}});
	}else if(productdata.prodle!=undefined){
		self.emit("failedUpdateProduct",{"error":{"code":"EA001","message":"Can't update prodle"}});
	}else if(productdata.product_comments!=undefined){
		self.emit("failedUpdateProduct",{"error":{"code":"EA001","message":"Can't  update product comments"}});
	}else{
		_updateProduct(self,orgid,prodle,productdata)
	}

}
var _updateProduct=function(self,orgid,prodle,productdata){
	productModel.update({orgid:orgid,prodle:prodle},{$set:productdata}).lean().exec(function(err,productupdatestatus){
		if(err){
			self.emit("failedUpdateProduct",{"error":{"code":"ED001","message":"Error in db to update product"}});
		}else if(productupdatestatus!=1){
			self.emit("failedUpdateProduct",{"error":{"code":"AP001","message":"product id is wrong"}});
		}else{
			////////////////////////////////
			_successfulUpdateProduct(self);
			//////////////////////////////////
		}
	})
};

var _successfulUpdateProduct=function(self){
	logger.emit("log","_successfulUpdateProduct");
	self.emit("successfulProductUpdation", {"success":{"message":"Update Product Successfully"}});
}