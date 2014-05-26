var Testimonial=require("./testimonial");
exports.addTestimonial=function(req,res){
	var orgid=req.params.orgid;
    
    var prodle=req.params.prodle;
  	var testimonialdata=req.body.testimonialdata;
    logger.emit("log","req testimonial body"+JSON.stringify(req.body));
  	var product = new Product(testimonialdata);

  
  	var sessionuserid=req.user.userid;
     logger.emit("log","\norgid:"+orgid+"\nsessionid:"+sessionuserid);
    product.removeAllListeners("failedAddTestimonial");
    product.on("failedAddTestimonial",function(err){
      logger.emit("error", err.error.message,sessionuserid);
      // product.removeAllListeners();
      res.send(err);
    });
    product.removeAllListeners("successfulAddTestimonial");
    product.on("successfulAddTestimonial",function(result){
      logger.emit("info", result.success.message,sessionuserid);
      // product.removeAllListeners();
      res.send(result);
    });
    
   
    
    if(req.user.org.orgid==orgid){ 
      logger.emit("error","You can not write testimonial of your own product",sessionuserid)
      product.emit("failedAddTestimonial",{"error":{"code":"EA001","message":"You can not write testimonial of your own product"}})
   	}else{
     product.addTestimonial(orgid,prodle,sessionuserid);
    }
}