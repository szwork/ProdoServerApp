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
var orgModel=require("../../org/js/org-model");
var productModel = require("./product-model");
var TrendingModel = require("../../featuretrending/js/feature-trending-model");
var commonapi = require('../../common/js/common-api');
var CONFIG = require('config').Prodonus;
var shortId = require('shortid');
var S=require('string');
var shortId = require('shortid');
var __=require("underscore");
var UserModel=require("../../user/js/user-model")
var InboxModel=require("../../inbox/js/inbox-model");
// var CommentModel=require("./comment-model");
var AWS = require('aws-sdk');
var ProductEnquiry=require('./product-enquiry-model');
AWS.config.update({accessKeyId:'AKIAJOGXRBMWHVXPSC7Q', secretAccessKey:'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'});
AWS.config.update({region:'ap-southeast-1'});
var s3bucket = new AWS.S3();
var Product = function(productdata) {
	this.product = productdata;
};
function isArray(what) {
    return Object.prototype.toString.call(what) === '[object Array]';
}
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
	   	}else if(productdata.description==undefined){
	    	self.emit("failedProductAdd",{"error":{"code":"AV001","message":"please pass product description "}});
	  	 // }else if(productdata.model_no==undefined){
	  	 // 	self.emit("failedProductAdd",{"error":{"code":"AV001","message":"please pass model_no"}});
	  	}else if(productdata.category==undefined || productdata.category==""){
	  		self.emit("failedProductAdd",{"error":{"code":"AV001","message":"Pleae pass category"}});
	  	}else if( !isArray(productdata.category)){
	  		self.emit("failedProductAdd",{"error":{"code":"AV001","message":"category should be an array"}});
	  	}else if(productdata.category.length==0){
	  		self.emit("failedProductAdd",{"error":{"code":"AV001","message":"Please pass atleast one commentcategory"}});
	  	}else if(productdata.commentcategory==undefined || productdata.commentcategory==""){
	  		self.emit("failedProductAdd",{"error":{"code":"AV001","message":"Pleae pass commentcategory"}});
	  	}else if( !isArray(productdata.commentcategory)){
	  		self.emit("failedProductAdd",{"error":{"code":"AV001","message":"commentcategory should be an array"}});
	  	}else if(productdata.commentcategory.length==0){
	  		self.emit("failedProductAdd",{"error":{"code":"AV001","message":"Please pass atleast one commentcategory"}});
	  	}else{
	  	 	////////////////////////////////////////////////
			_checkProductNameIsSame(self,productdata,orgid);
			///////////////////////////////////////////////
	    }
	};
	var _checkProductNameIsSame=function(self,productdata,orgid){
		productModel.findOne({name:productdata.name/*,model_no:productdata.model_no*/},function(err,product){
			if(err){
				self.emit("failedProductAdd",{"error":{"code":"ED001","message":"Error in db to add new product "}});	
			}else if(product){
				if(product.orgid==orgid){//product is already associated with orgid
					if(product.status=="active"){
						self.emit("failedProductAdd",{"error":{"message":"Product is already associated with your organization"}})
					}else{
						////////////////////////////////////
						_addProduct(self,productdata,orgid);
						////////////////////////////////////
					}
				}else{
					_addProduct(self,productdata,orgid);
					// self.emit("failedProductAdd",{"error":{"message":"Product is already associated with other manufacturer"}})
				}				
			}else{
				/////////////////////////////
		   		_addProduct(self,productdata,orgid);
		   		///////////////////////				
			}
		})
	}
	
	var _addProduct=function(self,productdata,orgid){
		productdata.orgid=orgid;
		productdata.status="active";
		if(productdata.commentcategory.indexOf("general")<0){
          productdata.commentcategory.push("general");
		}
// 		productdata.prodle=shortId.generate();  
// 		productdata.features=[{featurename:productdata.name.toLowerCase(),featuredescription:" default product features"}];
//     var product=new productModel(productdata);
//     productModel.update({orgid:orgid,model_no:productdata.model_no},{$set:productdata},{upsert:true},function(err,addstatus){
//     	if(err){
//     		self.emit("failedProductAdd",{"error":{"code":"ED001","message":"Error in db to add new product "}});	
//     	}else{
//     		productModel.findOne({orgid:orgid,model_no:productdata.model_no},function(err,product){
//     			if(err){
//     				logger.emit("error","Database Issue :fun:_addProduct"+err);
//     				self.emit("failedProductAdd",{"error":{"code":"ED001","message":"Database Issue"}});	
//     			}else if(!product){
//     				self.emit("failedProductAdd",{"error":{"message":"Product does not exists"}});		
//     			}else{
// 		    		///////////////////////
// 			  		_successfulProductAdd(self,product);
// 			  		//////////////////////////
//     			}
//     		})
//     	}
//     })

		// productdata.prodle=shortId.generate();  
		productdata.features=[{featurename:productdata.name.toLowerCase(),featuredescription:"product features"}];
    	var product=new productModel(productdata);
	    product.save(function(err,addstatus){
	    	if(err){
	    		self.emit("failedProductAdd",{"error":{"code":"ED001","message":"Error in db to add new product "}});	
	    	}else{
	    		// productModel.findOne({orgid:orgid,model_no:productdata.model_no},function(err,product){
	    		// 	if(err){
	    		// 		logger.emit("error","Database Issue :fun:_addProduct"+err);
	    		// 		self.emit("failedProductAdd",{"error":{"code":"ED001","message":"Database Issue"}});	
	    		// 	}else if(!product){
	    		// 		self.emit("failedProductAdd",{"error":{"message":"Product does not exists"}});		
	    		// 	}else{
			    		///////////////////////
				  		_successfulProductAdd(self,product);
				  		_addProductInTrending(self,product);
				  		//////////////////////////
	    		// 	}
	    		// })
	    	}
	    })
	}

	var _addProductInTrending = function(self,product){
		orgModel.findOne({orgid:product.orgid},function(err,organization){
			if(err){
			  	logger.emit("error","Error in db to find user");	
			}else if(organization){
				var trend={prodle:product.prodle,commentcount:0,followedcount:0,name:product.name,orgid:product.orgid,org_category:organization.industry_category};
				var trend_data = new TrendingModel(trend);
				trend_data.save(function(err,analyticsdata){
				   	if(err){
				   	 	logger.emit("error","Error in db to save trending data" + err);
				   	}else{
				       	logger.emit("log","Trending for new product added sucessfully" + analyticsdata);
				  	}
				})
			}else{
				logger.emit("error","Wrong orgid");	
			}
		})	
	}

	var _successfulProductAdd=function(self,product){
		logger.log("log","_successfulProductAdd");
		self.emit("successfulProductAdd",{"success":{"message":"Product added sucessfully","prodle":product.prodle}});
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
			TrendingModel.findOne({orgid:orgid,prodle:prodle,status:{$ne:"deactive"}},{commentcount:1,followedcount:1,_id:0}).lean().exec(function(err,product_trend){
				if(err){
					logger.emit({"message":"Error in db to find ProductTrend"});
				// }else if(product_trend){
					// product.trending = product_trend;
				// 	////////////////////////////////					 
					// _successfulGetProduct(self,product);
				// 	//////////////////////////////////
				}else{
					console.log("Error in Db1");
					logger.emit({"message":"Provided prodle is wrong"});
					product.trending = product_trend;
					_successfulGetProduct(self,product);
				}
			})
			 ////////////////////////////////
			// _successfulGetProduct(self,product);
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

Product.prototype.getLatestFiveProducts = function() {
	var self=this;
	/////////////////////////
	_getLatestFiveProducts(self);
	////////////////////////
};

var _getLatestFiveProducts=function(self){
	productModel.find({status:{$ne:"deactive"}},{name:1,product_logo:1,display_name:1,description:1,product_images:1,_id:0}).sort({createddate:-1}).limit(5).lean().exec(function(err,product){
		if(err){
			self.emit("failedGetLatestFiveProducts",{"error":{"code":"ED001","message":"Error in db to find Latest Five Product"}});
		}else if(product){
			////////////////////////////////////
			_successfulGetLatestFiveProducts(self,product);
			////////////////////////////////////
		}else{			
			self.emit("failedGetLatestFiveProducts",{"error":{"code":"AP001","message":"Product Not Exist"}});
		}
	})
}

var _successfulGetLatestFiveProducts=function(self,product){
	logger.emit("log","_successfulGetLatestFiveProducts");
	self.emit("successfulGetLatestFiveProducts", {"success":{"message":"Getting Latest Five Product Details Successfully","Products":product}});
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

Product.prototype.getAllProductNames = function() {
	var self=this;
	//////////////////
	_getAllProductNames(self);
	///////////////////
};

var _getAllProductNames = function(self){
	productModel.find({status:{$ne:"deactive"}},{name:1,_id:0,prodle:1}).lean().exec(function(err,product){
		if(err){
			self.emit("failedGetAllProductNames",{"error":{"code":"ED001","message":"Error in db to find all product"}});
		}else if(product.length==0){
			self.emit("failedGetAllProductNames",{"error":{"code":"AP002","message":"No product exists"}});
		}else{
			////////////////////////////////
			_successfulGetAllProductNames(self,product);
			//////////////////////////////////
		}
	})
};

var _successfulGetAllProductNames = function(self,product){
	logger.emit("log","successfulGetAllProductNames");
	self.emit("successfulGetAllProductNames", {"success":{"message":"Getting All Product Names Successfully","product":product}});
}

Product.prototype.deleteProduct = function(orgid,prodle) {
	var self=this;
	//////////////////
	_checkProductIsProdonus(self,orgid,prodle);
	///////////////////
};

var _checkProductIsProdonus = function(self,orgid,prodle){
	productModel.findOne({"name":new RegExp('^'+"Prodonus", "i")},{prodle:1,orgid:1}).lean().exec(function(err,product){
		if(err){
			self.emit("failedDeleteProduct",{"error":{"code":"ED001","message":"Error in db to find product details"}});
		}else if(product){
			if(product.prodle == prodle){
				self.emit("failedDeleteProduct",{"error":{"code":"AP001","message":"Somthing has gone wrong Prodonus Cant be delete !"}});
			}else{
				_deleteProduct(self,orgid,prodle);
			}
	    }else{	    	
	    	_deleteProduct(self,orgid,prodle);
	    	// self.emit("failedDeleteProduct",{"error":{"code":"AP001","message":"Prodonus not found"}});
		}
	});
}

var _deleteProduct=function(self,orgid,prodle){
	productModel.update({orgid:orgid,prodle:prodle},{$set:{status:"deactive"}}).lean().exec(function(err,productdeletestatus){
		if(err){
			self.emit("failedDeleteProduct",{"error":{"code":"ED001","message":"Error in db to delete product"}});
		}else if(productdeletestatus!=1){
			self.emit("failedDeleteProduct",{"error":{"code":"AP001","message":"product id is wrong"}});
		}else{
			////////////////////////////////
			_changeProductStatusInTrending(self,prodle);
			// _successfulDeleteProduct(self);
			//////////////////////////////////
		}
	})
};

var _changeProductStatusInTrending = function(self,prodle){
	console.log("## changeProductStatusInTrending ##");
	TrendingModel.update({prodle:prodle},{$set:{status:"deactive"}}).lean().exec(function(err,status){
		if(err){
			self.emit("failedDeleteProduct",{"error":{"code":"ED001","message":"Error in db to update product status in trending" + err}});
	  	}else{
			// logger.emit("log","Status updated successfully in trending");
			_successfulDeleteProduct(self);
		}
	})
}

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
	productModel.findAndModify({orgid:orgid,prodle:prodle,"product_images.imageid":{$in:prodle_imagearray}},[],{$pull:{product_images:{imageid:{$in:prodle_imagearray}}}},{new:false},function(err,deleteimagestatus){
		if(err){
			self.emit("failedDeleteProductImage",{"error":{"code":"ED001","message":"function:_deleteProductImage\nError in db to "}});
		}else if(!deleteimagestatus){
			self.emit("failedDeleteProductImage",{"error":{"message":"orgid or prodle or given prodleimageids is wrong "}});
		}else{
			var product_images=deleteimagestatus.product_images;
			var object_array=[];
			for(var i=0;i<product_images.length;i++){
				object_array.push({Key:product_images[i].key});
			}
			var delete_aws_params={
				Bucket: product_images[0].bucket, // required
  			Delete: { // required
    				Objects: object_array,
      			Quiet: true || false
      		}
      	}
      s3bucket.deleteObjects(delete_aws_params, function(err, data) {
			  if (err){
			  	logger.emit("error","Product images not deleted from amazon s3 prodle:"+prodle)
			  } else{
			  	logger.emit("log","Product images deleted from amazon s3 product prodle:"+prodle);
			  } 
			})
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
		_updateProduct(self,orgid,prodle,productdata);
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
			_updateTrendingForProduct(self,orgid,prodle,productdata);
			//////////////////////////////////
		}
	})
};

var _updateTrendingForProduct = function(self,orgid,prodle,productdata){
	orgModel.findOne({orgid:orgid},function(err,organization){
		if(err){
		  	logger.emit("error","Error in db to find user");	
		}else if(organization){
			TrendingModel.update({prodle:prodle,orgid:orgid},{$set:{name:productdata.name,org_category:organization.industry_category}}).lean().exec(function(err,status){
				if(err){
					logger.emit("error","Error in db to update trending");
			  	}else{
					logger.emit("log","Product trending updated successfully");
				}
			})
		}else{
			logger.emit("error","Wrong orgid");
		}
	})
}

var _successfulUpdateProduct=function(self){
	logger.emit("log","_successfulUpdateProduct");
	self.emit("successfulProductUpdation", {"success":{"message":"Product Updated Successfully"}});
}
Product.prototype.addProductFeature = function(orgid,prodle,productfeaturedata) {
	var self=this;
	//////////////////
	_validateProductFeature(self,orgid,prodle,productfeaturedata);
	///////////////////
};
var _validateProductFeature=function(self,orgid,prodle,productfeaturedata){
	
	if(productfeaturedata==undefined){
		self.emit("failedAddProudctFeatures",{"error":{"code":"AV001","message":"Please pass productfeaturedata"}});
	}else if(productfeaturedata.length==0){
		self.emit("failedAddProudctFeatures",{"error":{"code":"EA001","message":"Please provide atleast one product feature"}});
	}else{
		/////////////////////////////////////////////////////////////////////
		_checkFeatureNameIsAlreadyExists(self,orgid,prodle,productfeaturedata);
		/////////////////////////////////////////////////////////
		
	}

}
var _checkFeatureNameIsAlreadyExists=function(self,orgid,prodle,productfeaturedata){
	var feature_exist=[];
  var new_feature=[];
  var feature_names=[];
  for(var i=0;i<productfeaturedata.length;i++){
  	if(productfeaturedata[i].featurename!=undefined && productfeaturedata[i].featuredescription!=undefined){
  		feature_names.push(productfeaturedata[i].featurename);
		}
  }
  logger.emit("log","feature_names"+feature_names);		
  var query=productModel.aggregate({$match:{prodle:prodle}},{$unwind:"$features"},{$match:{"features.featurename":{$in:feature_names}}});
  logger.emit("log","query"+JSON.stringify(query));
  query.exec(function(err,product_features){
  	if(err){
  		self.emit("failedAddProudctFeatures",{"error":{"code":"ED001","message":"E_checkFeatureNameIsAlreadyExists"+err}});
  	}else if(product_features.length==0){
  		var add_product_feature=[];
  		console.log("hhh");
  		for(var i=0;i<productfeaturedata.length;i++){
				
					add_product_feature.push(productfeaturedata[i]);
				
  		}
  		logger.emit("log","add_product_feature"+add_product_feature);
  		////////////////////////
		_addProductFeature(self,orgid,prodle,add_product_feature,[]);
		//////////////////////////////////
  	}else{
  		logger.emit("log","productfeature"+product_features.length);
  		logger.emit("log","productfeaturedata"+productfeaturedata.length);
  		if(product_features.length>=productfeaturedata.length){
  			self.emit("failedAddProudctFeatures",{"error":{"message":"Feature already exist"}});	
  		}else{
  			var database_features_name=[];
  		for(var i=0;i<product_features.length;i++){
  			database_features_name.push(product_features[i].features.featurename)
  		}
  		for(var i=0;i<productfeaturedata.length;i++){
  			if(productfeaturedata[i].featurename!=undefined && productfeaturedata[i].featuredescription!=undefined){
  				if(database_features_name.indexOf(productfeaturedata[i].featurename)<0){
  					new_feature.push(productfeaturedata[i]);
		  		}else{
		  			feature_exist.push(productfeaturedata[i]);
		  		}
				}
		  }
		  logger.emit("log","new features"+new_feature);
		  logger.emit("log","feature_exist"+feature_exist);
		  ////////////////////////
			_addProductFeature(self,orgid,prodle,new_feature,feature_exist);
			//////////////////////////////////
  		}
  	}
  })
}
var _addProductFeature=function(self,orgid,prodle,productfeaturedata,feature_exist){
  
 
	productModel.update({orgid:orgid,prodle:prodle,},{$addToSet:{features:{$each:productfeaturedata}}}).exec(function(err,productfeatureaddstatus){
		if(err){
			self.emit("failedAddProudctFeatures",{"error":{"code":"ED001","message":"Error in db to add product feature"+err}});
		}else if(productfeatureaddstatus!=1){
			self.emit("failedAddProudctFeatures",{"error":{"code":"AP001","message":"product id is wrong"}});
		}else{
			////////////////////////////////
			_successfulAddProductFeatures(self,feature_exist);
			//////////////////////////////////
		}
	})
};

var _successfulAddProductFeatures=function(self,feature_exist){
	logger.emit("log","_successfulAddProductFeatures");
	self.emit("successfulAddProductFeatures", {"success":{"message":"Product Feature Added Suceessfully","exist_product_feature":feature_exist}});
}
Product.prototype.updateProductFeature = function(orgid,prodle,productfeatureid,productfeaturedata) {
	var self=this;
	//////////////////
	_validateUpdateProductFeature(self,orgid,prodle,productfeatureid,productfeaturedata);
	///////////////////
};
var _validateUpdateProductFeature=function(self,orgid,prodle,productfeatureid,productfeaturedata){
	
	if(productfeaturedata==undefined){
		self.emit("failedUpdateProudctFeatures",{"error":{"code":"AV001","message":"Please pass productfeaturedata"}});
	}else if(productfeaturedata.featurename==undefined ){
		self.emit("failedUpdateProudctFeatures",{"error":{"code":"EA001","message":"Please provide featurename "}});
	}else if(productfeaturedata.featuredescription==undefined) {
		self.emit("failedUpdateProudctFeatures",{"error":{"code":"EA001","message":"Please provide featurre description "}});
	}else{
		_updateProductFeature(self,orgid,prodle,productfeatureid,productfeaturedata)
	}
	

}
var _updateProductFeature=function(self,orgid,prodle,productfeatureid,productfeaturedata){

	productModel.update({orgid:orgid,prodle:prodle,"features._id":productfeatureid},{$set:{"features.$.featurename":productfeaturedata.featurename,"features.$.featuredescription":productfeaturedata.featuredescription}}).exec(function(err,productfeatureupdatestatus){
		if(err){
			self.emit("failedUpdateProudctFeatures",{"error":{"code":"ED001","message":"Error in db to update product"}});
		}else if(productfeatureupdatestatus!=1){
			self.emit("failedUpdateProudctFeatures",{"error":{"code":"AP001","message":"product id or feature id is wrong"}});
		}else{
			////////////////////////////////
			_successfulUpdateProductFeatures(self);
			//////////////////////////////////
		}
	})
};

var _successfulUpdateProductFeatures=function(self){
	logger.emit("log","_successfulUpdateProductFeatures");
	self.emit("successfulUpdateProductFeatures", {"success":{"message":"Product Feature Updated Suceessfully"}});
}
Product.prototype.deleteProductFeature = function(orgid,prodle,productfeatureid) {
	var self=this;
	_deleteProductFeature(self,orgid,prodle,productfeatureid)
};

var _deleteProductFeature=function(self,orgid,prodle,productfeatureid,productfeaturedata){

	productModel.update({orgid:orgid,prodle:prodle,"features._id":productfeatureid},{$pull:{features:{_id:productfeatureid}}}).exec(function(err,productfeaturedeletestatus){
		if(err){
			self.emit("failedDeleteProudctFeatures",{"error":{"code":"ED001","message":"Error in db to delete product"}});
		}else if(productfeaturedeletestatus!=1){
			self.emit("failedDeleteProudctFeatures",{"error":{"message":"featureid or prodle is wrong"}});
		}else{
			////////////////////////////////
			_successfulDeleteProductFeatures(self);
			//////////////////////////////////
		}
	})
};

var _successfulDeleteProductFeatures=function(self){
	logger.emit("log","_successfulDeleteProductFeatures");
	self.emit("_successfulDeleteProductFeatures", {"success":{"message":"Product Feature Deleted Suceessfully"}});
}

Product.prototype.getProductFeature = function(orgid,prodle) {
	var self=this;
	_getProductFeature(self,orgid,prodle)
};

var _getProductFeature=function(self,orgid,prodle){

	productModel.findOne({orgid:orgid,prodle:prodle},{features:1,_id:0}).exec(function(err,productfeature){
		if(err){
			self.emit("failedGetProudctFeatures",{"error":{"code":"ED001","message":"Error in db to delete product"}});
		}else if(!productfeature){
			self.emit("failedGetProudctFeatures",{"error":{"message":"prodle is wrong"}});
		}else{
			for(var i=0;i<productfeature.features.length;i++)
			{
				productfeature.features[i].featureid=productfeature.features[i]._id;
				productfeature.features[i]._id=undefined;
			}
			////////////////////////////////
			_successfulGetProductFeatures(self,productfeature.features);
			//////////////////////////////////
		}
	})
};

var _successfulGetProductFeatures=function(self,productfeature){
	logger.emit("log","_successfulGetProductFeatures");
	self.emit("successfulGetProductFeatures", {"success":{"message":"Product Feature Getting Suceessfully","productfeature":productfeature}});
}

Product.prototype.getProductTrending = function() {
	var self=this;
	_getProductTrending(self);
};

var _getProductTrending=function(self){
	console.log("_getProductTrending");
	TrendingModel.find({status:{$ne:"deactive"},followedcount:{$gt:0},commentcount:{$gt:0}},{name:1,orgid:1,prodle:1,commentcount:1,followedcount:1,_id:0}).sort({followedcount:-1,commentcount:-1}).limit(6).exec(function(err,trenddata){
		if(err){
			self.emit("failedGetProudctTrends",{"error":{"code":"ED001","message":"Error in db to get product trending data"}});
		}else if(!trenddata){
			self.emit("failedGetProudctTrends",{"error":{"message":"Trend data not exist"}});
		}else{
			///////////////////////////////////////////
			_successfulGetProductTrends(self,trenddata);
			///////////////////////////////////////////
		}
	})
};

var _successfulGetProductTrends=function(self,trenddata){
	logger.emit("log","_successfulGetProductTrends");
	self.emit("successfulGetProductTrends", {"success":{"message":"Product Trends Getting Suceessfully","ProductTrends":trenddata}});
}

Product.prototype.getCategorySpecificTrending = function(orgid) {
	var self=this;
	_getOrgCategories(self,orgid);
};

var _getOrgCategories = function(self,orgid){
	orgModel.findOne({orgid:orgid},function(err,organization){
		if(err){
		  	self.emit("failedGetCategorySpecificTrending",{"error":{"code":"ED001","message":"Error in db to get org_category"}});
		}else if(!organization){
			self.emit("failedGetCategorySpecificTrending",{"error":{"message":"orgid is wrong"}});
		}else{
			console.log("organization : "+organization.industry_category);
			_getCategorySpecificTrending(self,organization.industry_category)
		}		
	})
}

var _getCategorySpecificTrending=function(self,category){
	console.log("_getCategorySpecificTrending");
	TrendingModel.find({status:{$ne:"deactive"},org_category:{$in:category},followedcount:{$gt:0},commentcount:{$gt:0}},{name:1,orgid:1,prodle:1,commentcount:1,followedcount:1,_id:0}).sort({followedcount:-1,commentcount:-1}).limit(5).exec(function(err,trenddata){
		if(err){
			self.emit("failedGetCategorySpecificTrending",{"error":{"code":"ED001","message":"Error in db to get product trending data"}});
		}else if(!trenddata){
			self.emit("failedGetCategorySpecificTrending",{"error":{"message":"Trend data not exist"}});
		}else{
			///////////////////////////////////////////
			_successfulGetCategorySpecificTrending(self,trenddata);
			///////////////////////////////////////////
		}
	})
};

var _successfulGetCategorySpecificTrending=function(self,trenddata){
	logger.emit("log","_successfulGetCategorySpecificTrending");
	self.emit("successfulGetCategorySpecificTrending", {"success":{"message":"Product Trends Getting Suceessfully","ProductTrends":trenddata}});
}

Product.prototype.getAllCategoryTags = function() {
	var self=this;
	////////////////////////////
	_getAllCategoryTags(self);
	///////////////////////////
};

var _getAllCategoryTags=function(self){
	productModel.find({$where:"this.category.length>0"},{category:1,_id:0},function(err,categorytags){
		if(err){
			logger.emit("error","Database Issue _getAllCategoryTags "+err)
			self.emit("failedGetAllCategoryTags",{"error":{"message":"Database Issue"}})
		}else if(categorytags.length==0){
			self.emit("failedGetAllCategoryTags",{"error":{"message":"No Category Tags Exists"}})
		}else{
			var categorytgsarray=[];
			for(var i=0;i<categorytags.length;i++){
				categorytgsarray=__.union(categorytags[i].category,categorytgsarray);
			}
			///////////////////////////////////
			_successfullGetAllCategoryTags(self,categorytgsarray);
			///////////////////////////////////
		}
	})
}
var _successfullGetAllCategoryTags=function(self,categorytgsarray){
	self.emit("successfulGetAllCategoryTags",{"success":{"message":"Getting All Category Tags Successfully","categorytags":categorytgsarray}})
}
Product.prototype.latestAddedProduct = function() {
	var self=this;

	///////////////////////////
	_latestAddedProduct(self);
	////////////////////////
};
var _latestAddedProduct=function(self){
	var query=productModel.find({},{orgid:1,prodle:1,product_logo:1,product_images:1}).sort({prodo_setupdate:-1}).limit(5);
	query.exec(function(err,products){
		if(err){
			self.emit("failedLatestAddedProduct",{error:{code:"ED001",message:"Database Issue"+err}})
		}else if(products.length==0){
         self.emit("failedLatestAddedProduct",{error:{message:"No Latest Products"}})
		}else{
			/////////////////////////////////////////////////////
			_successfullLatestAddedOrganization(self,products)
			///////////////////////////////////////////////////////
		}
	})
}
var _successfullLatestAddedOrganization=function(self,products){
	self.emit("successfulLatestAddedProduct",{success:{message:"Latest Product Getting Successfully",product:products}})
}
Product.prototype.getAllCommentTags = function() {
	var self=this;
	////////////////////////////
	_getAllCommentTags(self);
	///////////////////////////
};

var _getAllCommentTags=function(self){
	productModel.find({$where:"this.commentcategory.length>0"},{commentcategory:1,_id:0},function(err,commenttags){
		if(err){
			logger.emit("error","Database Issue _getAllCategoryTags "+err)
			self.emit("failedGetAllCommentTags",{"error":{"message":"Database Issue"}})
		}else if(commenttags.length==0){
			self.emit("failedGetAllCommentTags",{"error":{"message":"No Comment Tags Exists"}})
		}else{
			var commenttagsarray=[];
			for(var i=0;i<commenttags.length;i++){
				commenttagsarray=__.union(commenttags[i].commentcategory,commenttagsarray);
			}
			///////////////////////////////////
			_successfullGetAllCommentTags(self,commenttagsarray);
			///////////////////////////////////
		}
	})
}
var _successfullGetAllCommentTags=function(self,commenttagsarray){
	self.emit("successfulGetAllCommentTags",{"success":{"message":"Getting All Comment Tags Successfully","commenttags":commenttagsarray}})
}
Product.prototype.productEnquiryRequest = function(productenquierydata,orgid,prodle,user) {
	var self=this;
	//////////////////////////////////////////////////////////////
	_validateProductEnquiryRequest(self,productenquierydata,orgid,prodle,user);
	//////////////////////////////////////////////////////////////
};
var _validateProductEnquiryRequest=function(self,productenquirydata,orgid,prodle,user){
	if(productenquirydata==undefined){
		self.emit("failedProductEnquiryRequest",{"error":{"message":"Please pass productenquirydata"}})	
	}else if(productenquirydata.subject==undefined || productenquirydata.subject==""){
		self.emit("failedProductEnquiryRequest",{"error":{"message":"Please pass productenquiry subject"}})		
	}else if(productenquirydata.body==undefined || productenquirydata.body==""){
		self.emit("failedProductEnquiryRequest",{"error":{"message":"Please pass productenquiry body"}})		
	}else{
		////////////////////////////////////////////////////////////////////
		_isValidOrgForProductEnquiry(self,productenquirydata,orgid,prodle,user)
		///////////////////////////////////////////////////////////////////
	}
}
var _isValidOrgForProductEnquiry=function(self,productenquirydata,orgid,prodle,user){
	orgModel.findOne({orgid:orgid},{orgid:1},function(err,organization){
		if(err){
			logger.emit("error","Database Issue _isValidOrgForProductEnquiry "+err)
			self.emit("failedProductEnquiryRequest",{"error":{"message":"Database Issue"}})		
		}else if(!organization){
			self.emit("failedProductEnquiryRequest",{"error":{"message":"Organization not exists"}})		
		}else{
			productModel.findOne({orgid:orgid,prodle:prodle},function(err,product){
				if(err){
					logger.emit("error","Database Issue _isValidOrgForProductEnquiry "+err)
					self.emit("failedProductEnquiryRequest",{"error":{"message":"Database Issue"}})		
				}else if(!product){
					self.emit("failedProductEnquiryRequest",{"error":{"message":"Product not exists"}});		
				}else{
					/////////////////////////////////////////////////////////////////
					_sendProductEnquiryRequest(self,productenquirydata,orgid,product,user)
					/////////////////////////////////////////////////////////////////
				}
			})
		}
	})
}
var _sendProductEnquiryRequest=function(self,productenquirydata,orgid,product,user){
	var body=productenquirydata.body;
	var subject=productenquirydata.subject;
	body="<br><br>Enquiry about product <b>"+product.name+"</b><br><br>"+productenquirydata.body;
	body+="<br><br>This email content is sent on behalf of  "+user.email+" by Prodonus Software Team";
  body+="<br>Disclaimer: We are not responsible for the content of this email as it is produced by "+user.email;
    var grparray=[new RegExp("admin",'i'),new RegExp("sales",'i'),new RegExp("sales",'i')];
		orgModel.aggregate({$match:{orgid:orgid}},{$unwind:"$usergrp"},{$match:{"usergrp.grpname":{$in:grparray}}},{$project:{grpname:"$usergrp.grpname",grpmembers:"$usergrp.grpmembers",_id:0}},function(err,usergrps){
			if(err){
				logger.emit("error","Database Issue _sendProductEnquiryRequest "+err)
		    self.emit("failedProductEnquiryRequest",{"error":{"code":"ED001","message":"Database Issue"}})			
			}else if(usergrps.length==0){
				self.emit("failedProductEnquiryRequest",{"error":{"message":"There is no admin,sales,marketing user exists"}})			
			}else{
				var usergrpidsarray=[];
				for(var j=0;j<usergrps.length;j++){
					usergrpidsarray=__.union(usergrpidsarray,usergrps[j].grpmembers);
				}
				UserModel.find({userid:{$in:usergrpidsarray},status:"active"},{userid:1,email:1},function(err,useremails){
  				if(err){
  					logger.emit("error","Database Issue _sendProductEnquiryRequest "+err)
						self.emit("failedProductEnquiryRequest",{"error":{"message":"Database Issue"}})			
  				}else if(useremails.length==0){
  					self.emit("failedProductEnquiryRequest",{"error":{"message":"No Organization member exists"}})			
  				}else{
  					var emailarray=[];
  					var validproductenquiryuserids=[];
						for(var i=0;i<useremails.length;i++){
							emailarray.push(useremails[i].email);	
							validproductenquiryuserids.push(useremails[i].userid);	
						}
						var message = {
		        from: "Prodonus  <business@prodonus.com>", // sender address
		        to: emailarray+"", // list of receivers
		        subject:subject, // Subject line
		        html: body // html body
		       };
		       console.log("message"+JSON.stringify(message))
         ////////////////////////////////////
		   _addNotificationToGroupMemberInbox(message,validproductenquiryuserids,user)
		     ///////////////////////////////////
         /////////////////////////////////////	
         _addToTheProductEnquiry(self,orgid,product.prodle,message,user.userid)
         //////////////////////////////////////

		    commonapi.sendMail(message,CONFIG.smtp_business, function (result){
		      if(result=="failure"){
		        logger.emit("error","Product enquiry request not sent to "+message.to+" by"+user.email);
		      }else{
		        logger.emit("log","Product enquiry request Sent Successfully to"+message.to+" by"+user.email);
		      }
		    });

			}
		})
	}
  })
    
}
var _addToTheProductEnquiry=function(self,orgid,prodle,message,userid){
	var productenquirydata={orgid:orgid,prodle:prodle,subject:message.subject,body:message.body,userid:userid}
	var productenquiry=new ProductEnquiry(productenquirydata);
	productenquiry.save(function(err,product_enquiry){
		if(err){
			logger.emit("error","Database Issue _sendProductEnquiryRequest "+err)
			    self.emit("failedProductEnquiryRequest",{"error":{"code":"ED001","message":"Database Issue"}})			
		}else{
			
			///////////////////////////////////////
			_successfullProductEnquiry(self)
			////////////////////////////////////	
		}
	})
}
var _successfullProductEnquiry=function(self){
	self.emit("successfulProductEnquiryRequest",{success:{message:"Product Enquiry Request Sent successfully to Organization Member"}})
}
var _addNotificationToGroupMemberInbox=function(message,userids,user){
	UserModel.find({userid:{$in:userids}},{userid:1,email:1,firstname:1},function(err,users){
		if(err){
			logger.emit("error","Database Issue"+err)
		}else if(!users){
			logger.emit("error","No user exists _addNotificationToGroupMemberInbox")
		}else{
			var inboxarray=[]
			for(var i=0;i<users.length;i++){
				var inbox
				if(user.firstname==undefined){
					inbox={messagetype:"enquiry",userid:users[i].userid,from:{email:user.email,userid:user.userid},subject:message.subject,body:message.body}
				}else{
					inbox={messagetype:"enquiry",userid:users[i].userid,from:{email:user.email,userid:user.userid,name:user.firstname},subject:message.subject,body:message.body}
				}
				inboxarray.push(inbox)
			}
			InboxModel.create(inboxarray,function(err,inboxex){
				if(err){
					logger.emit("error","Database Issue"+err)
				}else{
					logger.emit("log","sent to inbox")
				}
			})

		}
	})
}