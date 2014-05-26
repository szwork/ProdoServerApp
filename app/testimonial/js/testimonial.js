var events = require("events");
var logger = require("../../common/js/logger");
var ProductModel = require("../../product/js/product-model");
var TestimonialModel=require("./testimonial-model");
var Testimonial = function(testimonialdata) {
	this.testimonial = testimonialdata;
};

Testimonial.prototype = new events.EventEmitter;
module.exports = Product;
Testimonial.prototype.addTestimonial=function(orgid,sessionuserid){
	var self=this;
	var testimonialdata=this.testimonial;
	////////////////////////////////////////////////////////////
	_validateTestimonialData(self,testimonialdata,orgid,prodle,sessionuserid);
	//////////////////////////////////////////////////////////
}
var _validateTestimonialData=function(self,testimonialdata,orgid,prodle,sessionuserid){
	if(testimonialdata==undefined){
		self.emit("failedAddTestimonial",{error:{code:"AV001",message:"please pass testimonialdata"}})
	}else if(testimonialdata.text==undefined || testimonialdata.text==""){
		self.emit("failedAddTestimonial",{error:{code:"AV001",message:"please enter testimonial text"}})
	}else if(testimonialdata.displayname==undefined || testimonialdata.displayname==""){
		self.emit("failedAddTestimonial",{error:{code:"AV001",message:"please enter testimonial displayname"}})
	}else{
		//////////////////////////////////////
		_addTestimonial(self,testimonialdata,orgid,prodle,sessionuserid)
		/////////////////////////////////////
	}
}
var _addTestimonial=function(self,testimonialdata,orgid,prodle,sessionuserid){
	ProductModel.findOne({orgid:orgid,prodle:prodle},{prodle:1},function(err,product){
		if(err){
			logger.emit("error","Database Issue _addTestimonial"+err)
			self.emit("failedAddTestimonial",{error:{code:"ED001",message:"Database Issue"}})
		}else if(!product){
			self.emit("failedAddTestimonial",{error:{message:"prodle or orgid is wrong"}})
		}else{
			UserModel.findOne({userid:sessionuserid},{profile_pic:1,userid:1,org:1},function(err,user){
				if(err){
					logger.emit("error","Database Issue _addTestimonial"+err)
			    self.emit("failedAddTestimonial",{error:{code:"ED001",message:"Database Issue"}})
				}else if(!user){
					self.emit("failedAddTestimonial",{error:{message:"userid is wrong"}})
				}else{
					var testimonail_data={text:testimonialdata.text,displayname:testimonialdata.displayname,prodle:prodle,orgid:orgid,user:{userid:user.userid,profile_pic:user.profile_pic,orgname:user.org.orgname}};
					var testimonial_object=new TestimonialModel(testimonail_data);
					testimonial_object.save(function(err,testimonial){
						if(err){
							logger.emit("error","Database Issue _addTestimonial"+err)
			        self.emit("failedAddTestimonial",{error:{code:"ED001",message:"Database Issue"}})
						}else{
							///////////////////////////////////
							_successfullAddTestimonial(self)
							///////////////////////////////////
						}
					})
				}
			})
		}
	})
}
var _successfullAddTestimonial=function(self){
	self.emit("successfulAddTestimonial",{success:{message:"Scuccessfully added testimonial"}});
}