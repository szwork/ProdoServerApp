var SubscriptionModel=require('./subscription-model'); 
var generateId = require('time-uuid');
exports.loadsubscriptiondata=function(req,res)
{
var subscriptionarray=
[
	{
		
		plantype:"individual",
		plandescription:"Individual Monthly Plan",
		planpaymentcommitment:
		{
			commitmenttype:"monthly",
			amount:5,
			currency:"dollar"
		}
	},
	{	
		
		plantype:"individual",
		plandescription:"Individual Quarterly Plan",
		planpaymentcommitment:
		{
			commitmenttype:"quarterly",
			amount:10,
			currency:"dollar"
		}
	},
	{ 
		
		plantype:"individual",
		plandescription:"Individual Yearly Plan",
		planpaymentcommitment:
		{
			commitmenttype:"yearly",
			amount:50,
			currency:"dollar"
		}
	},
	{ 
		plantype:"company",
		// plandescription:"Individual Quarterly Plan",
		plandescription:"Company Monthly Plan",
		
		planpaymentcommitment:
		{
			commitmenttype:"monthly",
			amount:10,
			currency:"dollar"
		}
	},
	{	
		plantype:"company",
		plandescription:"Company Quarterly Plan",
		planpaymentcommitment:
		{
			commitmenttype:"quarterly",
			amount:25,
			currency:"dollar"
		}
	},
	{	
		plantype:"company",
		plandescription:"Company Yearly Plan",
		planpaymentcommitment:
		{
			commitmenttype:"yearly",
			amount:100,
			currency:"dollar"
		}
	},
	{
		
		plantype:"manufacturer",
		plandescription:"Manufacturer Monthly Plan",
		planpaymentcommitment:
		{
			commitmenttype:"monthly",
			amount:20,
			currency:"dollar"
		}
	},
	{	
		
		plantype:"manufacturer",
		plandescription:"Manufacturer Quarterly Plan",
		planpaymentcommitment:
		{
			commitmenttype:"quarterly",
			amount:50,
			currency:"dollar"
		}
	},
	{ 
		
		plantype:"manufacturer",
		plandescription:"Manufacturer Yearly Plan",
		planpaymentcommitment:
		{
			commitmenttype:"yearly",
			amount:180,
			currency:"dollar"
		}
	}
];
for(var i=0;i<subscriptionarray.length;i++){

        subscriptionarray[i].planid=generateId();
		SubscriptionModel.update({plandescription:subscriptionarray[i].plandescription},{$set:subscriptionarray[i]},{upsert:true},function(err,langcodeupdatestatus){
			if(err){
				//res.send("error in db ")
				// logger.error("error in db");
			}else if(langcodeupdatestatus==1){
				//res.send("Workcategory uploaed");
				// logger.log("log","subscriptionarray loaded loaded");
				console.log("subscription :"+i);
			}else{
				//res.send("");
				// logger.error("log","ssssssss");
			}
		})
	}
	res.send("Defualt Subscription loaded")
};
exports.getAllSubscriptionPlan=function(req,res)
{

	SubscriptionModel.aggregate({$group:{_id: "$plantype",plans: { $push: {planid:"$planid",plandescription:"$plandescription",planpaymentcommitment:"$planpaymentcommitment"}}}},{$project:{plans:1,plantype:"$_id",_id:0}}
,function(err,subscription){
		if(err)
		{	logger.emit("error","DBERROR:getAllSubscriptionPlan \nerror message:"+err)
		 	res.send({"error":{"message":"Database Server Issuce","code":"ED001"}}) 
		}else if(subscription.length>0){
			res.send({"success":{"message":"Get Subscription plans Successfully","subscription":subscription}});
		}else{
			res.send({"error":{"message":"No subscription plan exists","code":"AS001"}})
		}
	})
}