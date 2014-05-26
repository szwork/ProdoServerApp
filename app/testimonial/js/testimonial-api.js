var Testimonial=require("./testimonial");
var logger = require("../../common/js/logger");

exports.addTestimonial=function(req,res){
	var orgid=req.params.orgid;
    
    var prodle=req.params.prodle;
  	var testimonialdata=req.body.testimonialdata;
    logger.emit("log","req testimonial body"+JSON.stringify(req.body));
  	var testimonial = new Testimonial(testimonialdata);

  
  	var sessionuserid=req.user.userid;
     logger.emit("log","\norgid:"+orgid+"\nsessionid:"+sessionuserid);
    testimonial.removeAllListeners("failedAddTestimonial");
    testimonial.on("failedAddTestimonial",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // product.removeAllListeners();
      res.send(err);
    });
    testimonial.removeAllListeners("successfulAddTestimonial");
    testimonial.on("successfulAddTestimonial",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // product.removeAllListeners();
      res.send(result);
    });
    if(req.user.org.orgid==orgid){ 
      logger.emit("error","You can not write testimonial of your own product",sessionuserid)
      testimonial.emit("failedAddTestimonial",{"error":{"code":"EA001","message":"You can not write testimonial of your own product"}})
   	}else{
     testimonial.addTestimonial(orgid,prodle,sessionuserid,req.get('host'));
    }
}
exports.testimonialAction=function(req,res){
	var testimonialid=req.params.testimonialid;
	var action=req.query.name;
    var testimonial = new Testimonial();
    var sessionuserid=req.user.userid;
     // logger.emit("log","\norgid:"+orgid+"\nsessionid:"+sessionuserid);
    testimonial.removeAllListeners("failedTestimonailAction");
    testimonial.on("failedTestimonailAction",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // product.removeAllListeners();
      res.send(err);
    });
    testimonial.removeAllListeners("successfulTestimonialAction");
    testimonial.on("successfulTestimonialAction",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // product.removeAllListeners();
      res.send(result);
    });
    if(req.user.org.orgid==null){ 
      logger.emit("error","You are not organization user To perform this action",sessionuserid)
      testimonial.emit("failedAddTestimonial",{"error":{"code":"EA001","message":"You are not organization user To perform this action"}})
   	}else{
     testimonial.testimonialAction(testimonialid,sessionuserid,action);
    }
}

exports.getTestimonialForProduct=function(req,res){
	var prodle=req.params.prodle;
    var testimonial = new Testimonial();
    var sessionuserid=req.user.userid;
     // logger.emit("log","\norgid:"+orgid+"\nsessionid:"+sessionuserid);
    testimonial.removeAllListeners("failedTestimonialForProduct");
    testimonial.on("failedTestimonialForProduct",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // product.removeAllListeners();
      res.send(err);
    });
    testimonial.removeAllListeners("successfulTestimonialForProduct");
    testimonial.on("successfulTestimonialForProduct",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // product.removeAllListeners();
      res.send(result);
    });
    
     testimonial.getTestimonialForProduct(prodle);
   
}