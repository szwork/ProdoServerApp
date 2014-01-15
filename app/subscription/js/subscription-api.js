var SubscriptionModel=require('./subscription-model'); 

exports.loadsubscriptiondata=function(req,res)
{
var subscriptionarray=
[
	{
		plantype:"individual",
		planpaymentcommitment:
		{
			committype:"monthly",
			amount:5,
			currency:"dollar"
		}
	},
	{	plantype:"individual",
		planpaymentcommitment:
		{
			committype:"quarterly",
			amount:10,
			currency:"dollar"
		}
	},
	{   plantype:"individual",
		planpaymentcommitment:
		{
			committype:"yearly",
			amount:50,
			currency:"dollar"
		}
	},
	{
		plantype:"company",
		planpaymentcommitment:
		{
			committype:"monthly",
			amount:10,
			currency:"dollar"
		}
	},
	{	plantype:"company",
		planpaymentcommitment:
		{
			committype:"quarterly",
			amount:25,
			currency:"dollar"
		}
	},
	{	plantype:"company",
		planpaymentcommitment:
		{
			committype:"yearly",
			amount:100,
			currency:"dollar"
		}
	},
	{
		plantype:"manufacturer",
		planpaymentcommitment:
		{
			committype:"monthly",
			amount:20,
			currency:"dollar"
		}
	},
	{	plantype:"manufacturer",
		planpaymentcommitment:
		{
			committype:"quarterly",
			amount:50,
			currency:"dollar"
		}
	},
	{	plantype:"manufacturer",
		planpaymentcommitment:
		{
			committype:"yearly",
			amount:180,
			currency:"dollar"
		}
	}
];
SubscriptionModel.create(subscriptionarray,function(err,docs)
{
	if(err)
	{
		console.log("error in creating default subscription model");
	}
	else
	{
		res.send({"success":"subscription default records insertd"});	
	}
})
};
exports.getAllSubscriptionPlan=function(req,res)
{

	SubscriptionModel.aggregate({$group:{_id: "$plantype",plans: { $push: {planid:"$planid",planpaymentcommitment:"$planpaymentcommitment"}}}},{$project:{plans:1,plantype:"$_id",_id:0}}
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