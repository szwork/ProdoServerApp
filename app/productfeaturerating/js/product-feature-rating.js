var events = require("events");
var logger = require("../../common/js/logger");
var ProductModel=require("../../product/js/product-model");
var UserModel=require("../../user/js/user-model");
var ProductFeatureRatingModel=require("./product-feature-rating-model");
var S=require("string");
function isArray(what) {
        return Object.prototype.toString.call(what) === '[object Array]';
   }
var ProductFeatureRating = function(productdata) {
	// this.product = productdata;
};
ProductFeatureRating.prototype = new events.EventEmitter;
module.exports = ProductFeatureRating;
ProductFeatureRating.prototype.rateProductFeature=function(prodle,featureratingdata,userid){
	var self=this;
	
	////////////////////////////////////////////////////////////
	_validateProductFeatureRatingData(self,prodle,featureratingdata,userid);
	//////////////////////////////////////////////////////////
}
var _validateProductFeatureRatingData=function(self,prodle,featureratingdata,userid){
	if(featureratingdata==undefined){
		self.emit("failedRateProductFeature",{error:{code:"AV001",message:"Please pass feature rating data"}})
	}else if(!isArray(featureratingdata)){
	  self.emit("failedRateProductFeature",{error:{code:"AV001",message:"featureratingdata should be an Array"}})
	}else if(featureratingdata.length==0){
		self.emit("failedRateProductFeature",{error:{code:"AV001",message:"featureratingdata should not be empty array"}})
	}else{
		var featureratingdataarray=[]
		for(var i=0;i<featureratingdata.length;i++){
			if(featureratingdata[i].featurename!=undefined && featureratingdata[i].featurerates!=undefined && S(featureratingdata[i].featurerates).isNumeric() ){
				featureratingdataarray.push(featureratingdata[i]);
			}
		}
		//////////////////////////////////////
		_rateAllFeatures(self,featureratingdataarray,userid,prodle,0)
		///////////////////////////////
	}
}
var _rateAllFeatures=function(self,featureratingdataarray,userid,prodle,indexvalue){
	if(featureratingdataarray.length>indexvalue){
		_isProductFeatureExistsToRate(self,prodle,featureratingdataarray[indexvalue],userid,function(err,result){
			if(err){
				console.log("tessssss"+indexvalue)
				self.emit("failedRateProductFeature",err)
				// _rateAllFeatures(self,featureratingdataarray,userid,prodle,++indexvalue)
			}else{
				console.log("tessssssssssssssssss"+indexvalue)
				_rateAllFeatures(self,featureratingdataarray,userid,prodle,++indexvalue)
			}
		})
	}else{
		console.log("successfulGetOverallProductFeatureRating")
		self.emit("successfulRateProductFeature",{success:{message:"Rate successfully"}})
	}
}
	
	var _isProductFeatureExistsToRate=function(self,prodle,featureratingdata,userid,callback){
		ProductModel.findOne({prodle:prodle,"features.featurename":featureratingdata.featurename},{prodle:1},function(err,product){
			if(err){
				logger.emit("error","_isProductFeatureExistsToRate"+err)
				callback({error:{code:"ED001",message:"Database Issue"}})
			}else if(!product){
				callback({error:{message:"Provided feature does not match with product"}})
			}else{
				//////////////////////////////////////////
				_isProductFeatureContainInFeatureRating(self,prodle,featureratingdata,userid,function(err,result){
					if(err){
						callback(err)
					}else{
						callback(null,result)
					}
				})
				////////////////////////////////////////
			}
		})
	}
var _isProductFeatureContainInFeatureRating=function(self,prodle,featureratingdata,userid,callback){
	UserModel.findOne({userid:userid,"featurerating.prodle":prodle,"featurerating.featurename":featureratingdata.featurename},function(err,userfeaturerating){
		if(err){
			logger.emit("error","Database Issue :_isProductFeatureContainInFeatureRating"+err)
			callback({error:{message:"Database Issue"}})
		}else if(!userfeaturerating){//new feature rating
			//////////////////////////////////
			_addNewFeatureRatingToUser(self,prodle,featureratingdata,userid,function(err,result){
					if(err){
						callback(err)
					}else{
						callback(null,result)
					}
				})
			/////////////////////////////////	
		}else{//change the existing feature rate
			///////////////////////////////////////////////////
			_updateNewFeatureRatingToUser(self,prodle,featureratingdata,userid,function(err,result){
					if(err){
						callback(err)
					}else{
						callback(null,result)
					}
				})
			/////////////////////////////////////////////
		}
	})
}
var _addNewFeatureRatingToUser=function(self,prodle,featureratingdata,userid,callback){
	var featureratingobject={featurename:featureratingdata.featurename,prodle:prodle,featurerates:featureratingdata.featurerates}
	UserModel.update({userid:userid},{$push:{featurerating:featureratingobject}},function(err,updatefeatureratingstatus){
		if(err){
			logger.emit("error","Database Issue :_addNewFeatureRatingToUser"+err)
			callback({error:{message:"Database Issue"}})
		}else if(updatefeatureratingstatus==0){
			callback({error:{message:"User id is wrong"}})
		}else{
			/////////////////////////////////
			_updateNewUserFeatureDataToFeatureRating(self,prodle,featureratingdata,true,function(err,result){
					if(err){
						callback(err)
					}else{
						callback(null,result)
					}
				})
			///////////////////////////////////
		}
	})
}
var _updateNewFeatureRatingToUser=function(self,prodle,featureratingdata,userid,callback){
	UserModel.aggregate({$match:{userid:userid}},{$unwind:"$featurerating"},{$match:{"featurerating.prodle":prodle,"featurerating.featurename":featureratingdata.featurename}},function(err,userfeaturerate){
		if(err){
			logger.emit("error","Database Issue :_addNewFeatureRatingToUser"+err)
			callback({error:{code:"ED001",message:"Database Issue"}})
		}else if(userfeaturerate.length==0){//this condition never come
			callback({error:{message:"userid is wrong"}})
		}else{
			var user_feature_data=userfeaturerate[0];
			console.log("user_feature_data"+JSON.stringify(user_feature_data))
			UserModel.update({userid:userid,featurerating:{$elemMatch:{prodle:prodle,featurename:user_feature_data.featurerating.featurename}}},{$set:{"featurerating.$.featurerates":featureratingdata.featurerates}},function(err,featurratestatus){
				if(err){
					logger.emit("error","Database Issue :_addNewFeatureRatingToUser"+err)
			    callback({error:{code:"ED001",message:"Database Issue"}})
				}else if(featurratestatus==0){
					callback({error:{message:"Featurename not exists"}})
				}else{
					var featurerates=featureratingdata.featurerates-user_feature_data.featurerating.featurerates
					featureratingdata.addratevalue=featurerates;
					console.log("featureratingdata featurerates"+featureratingdata.featurerates+" dddf"+user_feature_data.featurerating.featurerates)
					logger.emit("log","testong"+JSON.stringify(featureratingdata));
					/////////////////////////////////
			_updateNewUserFeatureDataToFeatureRating(self,prodle,featureratingdata,false,function(err,result){
					if(err){
						callback(err)
					}else{
						callback(null,result)
					}
				})
			///////////////////////////////////

				}
			})
		}
	})
}
var _updateNewUserFeatureDataToFeatureRating=function(self,prodle,featureratingdata,isnewuser,callback){
	ProductFeatureRatingModel.findOne({prodle:prodle,featurename:featureratingdata.featurename},function(err,featurerating){
		if(err){
			logger.emit("error","Database Issue :_addNewFeatureRatingToUser"+err)
			callback({error:{message:"Database Issue"}})
		}else if(featurerating){
			var featureupdatedata;
			if(isnewuser){
				featureupdatedata={ratecount:featurerating.ratecount+featureratingdata.featurerates,usercount:featurerating.usercount+1};
			}else{
				featureupdatedata={ratecount:featurerating.ratecount+featureratingdata.addratevalue};	
			}
			logger.emit("log","ratecount"+featurerating.ratecount);
			logger.emit("log","featureratingdata"+JSON.stringify(featureratingdata))
			logger.emit("log","featureupdatedata"+JSON.stringify(featureupdatedata))
			ProductFeatureRatingModel.update({prodle:prodle,featurename:featurerating.featurename},{$set:featureupdatedata},function(err,updatefeaturerating){
				if(err){
					logger.emit("error","Database Issue :_updateNewUserFeatureDataToFeatureRating"+err)
			    callback({error:{message:"Database Issue"}})
				}else if(updatefeaturerating==0){
					callback({error:{message:"featurename not exists"}})
				}else{
					callback(null,{success:{message:"Rating successfully"}})
					// ////////////////////////////////////////////////////
					// _succesfullFeatureRate(self,function(err,result){
					// 	if(err){
					// 		callback(err)
					// 	}else{
					// 		callback(null,result)
					// 	}
			  //  	})
					// //////////////////////////////////////////////////
				}
			})
		}else{//no feature exist in feature rating model
			//////////////////////////////////////////////////
			_addNewFeatureWithRateData(self,prodle,featureratingdata,function(err,result){
					if(err){
						callback(err)
					}else{
						callback(null,result)
					}
				})
			/////////////////////////////////////////////
		}
	})
}
var _addNewFeatureWithRateData=function(self,prodle,featureratingdata,callback){
	var productfeatureratedata={prodle:prodle,featurename:featureratingdata.featurename,ratecount:featureratingdata.featurerates,usercount:1}
	var productfeatureobject=new ProductFeatureRatingModel(productfeatureratedata);
	productfeatureobject.save(function(err,productfeaturerate){
		if(err){
			logger.emit("error","Database Issue :_addNewFeatureRatingToUser"+err)
			 callback({error:{message:"Database Issue"}})
			  }else{
			  		callback(null,{success:{message:"Rating successfully"}})
			 //  	////////////////////////////////////////////////////
				// 	_succesfullFeatureRate(self,function(err,result){
				// 		if(err){
				// 			callback(err)
				// 		}else{

				// 			callback(null,result)
				// 		}
				// })
					//////////////////////////////////////////////////	
			  }
	})
}
var _succesfullFeatureRate=function(self,callback){
	callback(null,{success:{message:"Rating successfully"}})
}
ProductFeatureRating.prototype.getMyProductFeatureRating=function(prodle,userid){
	var self=this;
	
	////////////////////////////////////////////
	_getMyProductFeatureRating(self,prodle,userid)
	///////////////////////////////////////////
}
var _getMyProductFeatureRating=function(self,prodle,userid){
	ProductModel.findOne({prodle:prodle},{prodle:1,features:1},function(err,product){
		if(err){
			logger.emit("error","Database Issue :_getMyProductFeatureRating"+err)
			self.emit("failedGetMyProductFeatureRating",{error:{code:"ED001",message:"Database Issue"}})
		}else if(!product){
			self.emit("failedGetMyProductFeatureRating",{error:{message:"prodle is wrong"}})
		}else{
			UserModel.aggregate({$match:{userid:userid}},{$unwind:"$featurerating"},{$match:{"featurerating.prodle":prodle}},{$project:{featurename:"$featurerating.featurename",prodle:"$featurerating.prodle",featurerates:"$featurerating.featurerates",_id:0}},function(err,userfeaturerating){
				if(err){
					logger.emit("error","Database Issue :_getMyProductFeatureRating"+err)
			    self.emit("failedGetMyProductFeatureRating",{error:{code:"ED001",message:"Database Issue"}})
				}else{
					var productfeature=product.features;
					var featurenamearray=[];
					var myproductfeaturerating=[];
					var featureratingnamearray=[]
					for(var i=0;i<userfeaturerating.length;i++){
						featureratingnamearray.push(userfeaturerating[i].featurename);
					}
					for(var j=0;j<productfeature.length;j++){
						if(featureratingnamearray.indexOf(productfeature[j].featurename)>=0){
							myproductfeaturerating.push(userfeaturerating[featureratingnamearray.indexOf(productfeature[j].featurename)])
						}else{
							myproductfeaturerating.push({featurename:productfeature[j].featurename,featurerates:null})
						}
					}
					///////////////////////////////////////////////
					_successfullMyProductFeatureRating(self,myproductfeaturerating)
					//////////////////////////////////////////////
				}
			})
		}
	})
}
var _successfullMyProductFeatureRating=function(self,myproductfeaturerating){
	self.emit("successfulGetMyProductFeatureRating",{success:{message:"Getting my product feature rating successfully",myproductfeaturerating:myproductfeaturerating}})
}
ProductFeatureRating.prototype.getOverallProductFeatureRating=function(prodle){
	var self=this;
	console.log("tests")
	////////////////////////////////////////////
	_getOverallProductFeatureRating(self,prodle)
	///////////////////////////////////////////
}
var _getOverallProductFeatureRating=function(self,prodle){
	ProductModel.findOne({prodle:prodle},{prodle:1,features:1},function(err,product){
		if(err){
			logger.emit("error","Database Issue :_getOverallProductFeatureRating"+err)
			self.emit("failedGetOverallProductFeatureRating",{error:{code:"ED001",message:"Database Issue"}})
		}else if(!product){
			self.emit("failedGetOverallProductFeatureRating",{error:{message:"prodle is wrong"}})
		}else{
			ProductFeatureRatingModel.find({prodle:prodle},function(err,productfeaturerating){
				if(err){
					logger.emit("error","Database Issue :_getOverallProductFeatureRating"+err)
		    	self.emit("failedGetOverallProductFeatureRating",{error:{code:"ED001",message:"Database Issue"}})
				}else {
		   	var productfeature=product.features;
					var featurenamearray=[];
					var overallproductfeaturerating=[];
					var featureratingnamearray=[]
					for(var i=0;i<productfeaturerating.length;i++){
						featureratingnamearray.push(productfeaturerating[i].featurename);
					}
					for(var j=0;j<productfeature.length;j++){
						if(featureratingnamearray.indexOf(productfeature[j].featurename)>=0){
							overallproductfeaturerating.push(productfeaturerating[featureratingnamearray.indexOf(productfeature[j].featurename)])
						}else{
							overallproductfeaturerating.push({featurename:productfeature[j].featurename,prodle:product.prodle,ratecount:0,usercount:0})
						}
					}
					/////////////////////////////////////////////////////////////////
					_successfullOverAllFeatureRating(self,overallproductfeaturerating)
					//////////////////////////////////////////////////////////////
				}
			})
		}
	})
}
var _successfullOverAllFeatureRating=function(self,overallproductfeaturerating){
	self.emit("successfulGetOverallProductFeatureRating",{success:{message:"Getting Overalll product feature rating successfully",overallproductfeaturerating:overallproductfeaturerating}})
}		