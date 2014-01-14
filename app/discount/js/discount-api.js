var DiscountModel=require("./discount-model");
exports.loaddiscount=function(req,res) {
	var currentdate=new Date();
	var discountdata={
		impact:{price:100,timeperiod:90},//imapct price % discount and timeperiod defaults number of days
		maxcount:100,//set wehen at the time of creation
		usedcount:0,//update whenever use the discount code
		expirtydate:new Date(currentdate.setMonth(currentdate.getMonth()+1))
  }
  var discount=new DiscountModel(discountdata);
  discount.save(function(err,discount_data){
  	if(err){
  		res.send({"error":{"message":"Error in db"}});
  	}else{
  		res.send({"success":{"message":"Load Discount trial data"}});
  	}
  })
	// body...
}
exports.getDiscountCode=function (req,res) {
	DiscountModel.findOne({},function(err,discount){
		if(err){
			res.send({"error":{"message":"Error in db","code":"ED001"}});
		}else if(discount){
			res.send({"success":{"message":"Get discount code","discount":discount}});	
		}else{
			res.send({"error":{"message":"No discount exists"}});
		}
	})
}